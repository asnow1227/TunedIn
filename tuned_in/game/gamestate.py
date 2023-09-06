from api.models import Room, Alias, Prompt
import random

READY_CHECK = {
    'queue': False,
    'prompts': True,
    'vote': True
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


# the gamestate object is used to update the gamestate. There is a ready status associated with each player.
# for the prompt round, each player must enter all three prompts to be set to ready status. For the voting round,
# eventially want to have this be a set time interval from the client that will send a message to the socket when the 
# clock has expired for making a selection. Want this to be like a minute or so. Otherwise, we need to count if all the votes 
# are entered for a given prompt.

class GameState:
    def __init__(self, room):
        # this is a room object
        self.room = room

    def next(self):
        state = self.gamestate.split()[0]
        if state == 'queue':
            # if we are in the queue phase, we move to the enter prompts page
            return 'prompts'
        elif state in {'prompts', 'score'}:
            # if we are in the prompt enter page or have just exited a scoring stage, then we need to move to the 
            # select song phase
            return 'select'
        elif state == 'select':
            # to simplify, we will sumbit empty strings as the song selection if the time has expired, to avoid needing 
            # to change the structure of the gamestate as it currently stands (but may want to refactor this at some point)
            if not self.all_round_selections_made():
                # if there are still selections to be made for the round, then move to another song selection page.
                return 'select'
            # if all selections have been made for the current round, then continue to the voting phase
            return 'vote'
        elif state == 'vote':
            # if we are at a voting stage, check if all the votes are submitted. To simplify, when time has expired to submit a vote, 
            # an empty string will be entered for the voting user.
            if not self.all_voting_rounds_finished():
                self.update_voting_round()
                return 'vote'
            # update the voting round if we haven't finished the voting rounds
            self.reset_voting_round()
            return 'score'

    @property
    def gamestate(self):
        # returns the gamestate for the room
        return self.room.gamestate

    def requires_ready_check(self):
        # tells if us if the current gamestate requires a ready check (i.e. ensure all users are ready)
        return READY_CHECK[self.gamestate]

    def requires_round_update(self):
        # check if we need to update the round.
        # 3 rounds for now, so we need to update when the current 
        # gamestate is the scoring stage and the round is either 0 or 1
        # (round num starts at 0)
        return self.gamestate == 'score' and self.room.room_round <= 1
        
    def requires_prompt_assignment(self):
        # if we are moving to the song selection round, 
        # then need to assign the prompts for the round to the users
        return self.next() == 'select' 

    def update_gamestate(self):
        # update the gamestate by setting the current room gamestate to the next gamestate
        self.room.gamestate = self.next()
        self.room.save(update_fields=['gamestate'])

    def update_round(self):
        # update the round for the room
        self.room.room_round += 1
        self.room.save(update_fields=['room_round'])

    def update_voting_round(self):
        # updates the voting round for the room
        self.room.voting_round += 1
        self.room.save(update_fields=['voting_round'])

    def reset_voting_round(self):
        self.room.voting_round = 0
        self.room.save(update_fields=['voting_round'])

    def ready_check(self):
        # exposed to the views so they can call this easily. 
        # if we don't need the ready check for this round, then return True
        if not self.requires_ready_check():
            return True
        # otherwise, check if all aliases in the room are on ready status
        aliases = Alias.objects.filter(room_code=self.room.code).all()
        print({alias.alias: (alias.ready, alias.room_code) for alias in aliases})
        return all([alias.ready for alias in aliases])

    def set_ready_statuses_to_false(self):
        # sets all ready statuses to false for the given room
        aliases = Alias.objects.filter(room_code=self.room.code).all()
        for alias in aliases:
            alias.ready = False
            alias.save(update_fields=['ready'])

    def all_round_selections_made(self):
        # checks if all prompts have had someone enter a song choice.
        # this choice may be populated as an empty string if timer is reached 
        prompts = Prompt.objects.filter(room_code=self.room.code).all()
        return not any([
            prompt.assigned_user_1_song_choice is None or 
            prompt.assigned_user_2_song_choice is None
            for prompt in prompts
        ])

    def all_voting_rounds_finished(self):
        # check if all the round votes have been submitted.
        # number of votes should be equal to the number of players - 2]
        # for each vote.
        # may update this to avoid when a player does not enter a vote bc of timeout 
        # i.e., enter a non-null value for the vote and just check if all votes are not null
        # or just have the host tell us that we are ready to continue past the voting round
        # prompts = Prompt.objects.filter(room_code=self.room.code).all()
        # n_players = len(Alias.objects.filter(room_code=self.room.code).all())
  
        # return all([
        #     prompt.assigned_user_1_votes + prompt.assigned_user_2_votes == n_players - 2
        #     for prompt in prompts
        # ])
        # we will only call this function after the view verifies that the players are ready, so 
        # we can guarantee that players are ready to progress to next voting round, i.e.
        # if the current voting round is the max num voting rounds, then we progress to next phase
        # there will be n voting rounds per round, which means n_players - 1 is the final 
        # voting round
        current_voting_round = self.room.voting_round
        n_players = len(Alias.objects.filter(room_code=self.room.code).all())
        if current_voting_round == n_players - 1:
            return True
        return False

    def assign_prompts(self):
        aliases = Alias.objects.filter(room_code=self.room.code).all()
        # assign the propmts based on the prompt key, this makes it easier to select prompts from the db
        prompts = Prompt.objects.filter(room_code=self.room.code, prompt_key=self.room.room_round)
        players = [alias.user for alias in aliases]
        combos = assign_prompt_combos(players)
        for i, (prompt, combo) in enumerate(zip(prompts, combos)):
            prompt.assigned_user_1 = combo[0]
            prompt.assigned_user_2 = combo[1]
            prompt.voting_round = i
            print(prompt.assigned_user_1, prompt.assigned_user_2, prompt.prompt_text)
            prompt.save(update_fields=['assigned_user_1', 'assigned_user_2'])
            
    def update(self):
        # updates the gamestate, performing the necessary operations 
        # on the data models where necessary
        if self.requires_prompt_assignment():
            self.assign_prompts()
        
        if self.requires_round_update():
            self.update_round()

        self.update_gamestate()
        self.set_ready_statuses_to_false()
