import random
from .models import Room, Alias, Prompt, PromptAssignments
from .exceptions import RoomNotReadyError


GAMESTATES_DRIVEN_BY_TIMER = {
    Room.GameState.SELECT,
}

def get_slices(lst):
    # takes in a list (even numbers) and 
    # cuts it into a list of tuples. This will be user ids
    # e.g. [1,2,3,4] -> [(1,2), (3,4)]
    ret = []
    idxr = len(lst)//2
    for i in range(idxr):
        ret.append(tuple(lst[i::idxr]))
    return ret

def assign_prompt_combos(players):
    # players is a list of user ids (session ids).
    # this takes and input list and returns a list of tuples 
    # of the shuffled ids that correspond to prompt assignments ensuring that each player is assigned to 
    # two prompts
    # e.g. 
    # [1, 2, 3, 4] -> [(1, 3), (2, 4), (1, 4), (2, 3)]
    
    # create a copy of the players list
    c = list(players)
    # check if the list is even
    even = not (len(c) % 2)
    # start a return list for the tuples
    tups = []
    
    # shuffle the input list 
    random.shuffle(c)
    if even:
        # if the list is even length, then we shuffle the list, assign the tuples, and then
        # do that again. 
        # so looks like [1, 2, 3, 4]
        # first shuffle: [2, 3, 1, 4] -> [(2, 3), (1 , 4)]
        # second shuffle: [1, 4, 3, 2] -> [(1, 4), (3, 2)]
        # returns these two lists appended i.e. [(2, 3), (1, 4), (1, 4), (3, 2)]
        tups.extend(get_slices(c))
        random.shuffle(c)
        tups.extend(get_slices(c))
        return tups
    
    # if the list is odd, then pop off the last element and save it 
    fixed = c.pop()
    # get the new last element after popping and save it (remember, the list has been shuffled)
    last = c[-1]
    # append the tuple of the popped element and the last element
    # e.g. [1, 2, 3, 4, 5] shuffled -> [2, 3, 5, 1, 4] -> fixed = 4, last = 1, c now is [2, 3, 5, 1]
    # take (4, 1) and add it to the return list. Back at the even case now, so get the tuples slices 
    # with the remaining list [2, 3, 5, 1] -> [(2, 3), (5, 1)] extends the return list 
    # so ret list is now [(4, 1), (2, 3), (5, 1)]
    tups.append((fixed, last))
    tups.extend(get_slices(c))
    # pop from c again, so c is now [2, 3, 5]
    c.pop()
    # add back in the first popped element i.e. 4
    # now c = [2, 3, 5, 4]
    c.append(fixed)
    # shuffle the new c again and get the tuple slices
    # so c -> [3, 2, 4, 5] and 
    # ret list becomes [(4, 1), (2, 3), (5, 1), (3, 2), (4, 5)]
    # notice that the 'last' variable was used in the first tuple, and then in the original shuffle
    # the 'fixed' variable was only used in the first tuple, that is why we replace it with the 'last' variable for this second shuffle, 
    # so that each element in the list is involved in two of the shuffles. Again each id gets assigned to two prompts 
    # i.e. included in exactly two tuples
    random.shuffle(c)
    tups.extend(get_slices(c))
    return tups



def set_ready_statuses_to_false(room_code):
    """sets all the ready statuses to false for a room (used on round updates)"""
    aliases = Alias.objects.filter(room_code=room_code).all()
    for alias in aliases:
        alias.ready = False
        alias.save(update_fields=['ready'])



def update_gamestate(room):
    """method used to update the gamestate for a room"""
    aliases = Alias.objects.filter(room_code=room.code)
    
    # for all other rounds, we will update the ready status on the user's alias for each user
    # this checks to ensure that all players are ready before updating the gamestate
    aliases = Alias.objects.filter(room_code=room.code)
    if room.gamestate not in GAMESTATES_DRIVEN_BY_TIMER and not all([alias.ready for alias in aliases]):
        raise RoomNotReadyError(room.code)
    
    
    if room.gamestate == Room.GameState.QUEUE:
        # if we are coming from the prompt page (where players enter prompts), then we need to assign the prompts
        # remember that we already confirmed that each player is ready. Note that users now enter the prompts on the QUEUE page
        players = [alias.user for alias in aliases]
        for main_round in range(1, room.num_rounds + 1):
            # get the prompts for the current round num
            # (will change the prompt_key field to be main_round on the prompt object)
            prompts = Prompt.objects.filter(room_code=room.code, main_round=main_round)
            # assign the combos (see logic above)
            combos = assign_prompt_combos(players)
            for i, (prompt, combo) in enumerate(zip(prompts, combos)):
                PromptAssignments(assigned_user=combo[0], room_code=room.code, prompt_unique_id=prompt.unique_id).save()
                PromptAssignments(assigned_user=combo[1], room_code=room.code, prompt_unique_id=prompt.unique_id).save()
                # set the voting round for the prompt. This determines the order its voted in within each main round
                prompt.voting_round = i + 1
                prompt.main_round = main_round
                prompt.save()
        # after assigning the prompts, we continue to the select song page from the Prompt page
        room.gamestate = Room.GameState.SELECT
        # room.gamestate = Room.GameState.PROMPT
        room.num_players = len(aliases)
    elif room.gamestate == Room.GameState.SELECT:
        # if all song selections have been made for the current round, i.e. all players are ready, we can continue to the voting stage
        room.gamestate = Room.GameState.VOTE
    elif room.gamestate == Room.GameState.VOTE:
        # if we are at the voting stage currently, then we need to check if the voting round is = to the max voting round.
        # if so, we need to reset the voting round and continue to the scoring stage
        # otherwise, we just increase the voting round and keep the gamestate the same.
        # max voting round is equal to the number of players since each player creates one prompt for each round
        # i.e. if there are 3 players and 3 main rounds, there are 9 prompts spread over 3 rounds, 3 prompts per round
        if room.voting_round == room.num_players:
            room.voting_round = 1
            room.gamestate = Room.GameState.SCORE
        else:
            room.voting_round += 1
    elif room.gamestate == Room.GameState.SCORE:
        # if we are at the scoring stage, then we need to check if we are the final main round
        # this would indicate that we have finished the current game and we can loop back to the queue stage
        # otherwise, we update the main round and loop back to the select stage 
        if room.main_round == 3:
            room.gamestate = Room.GameState.QUEUE
        else:
            room.main_round += 1
            room.gamestate = Room.GameState.SELECT
    # since we are updating the gamestate or one of the main rounds/voting rounds, then we need to reset the ready 
    # statuses for each player
    set_ready_statuses_to_false(room.code)
    room.current_timer = 0
    # finally, save the room and return
    room.save()
    return room

