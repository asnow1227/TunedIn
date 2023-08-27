from api.models import Room, Alias, Prompt
import random

READY_CHECK = {
    'queue': False,
    'prompts': True
}


def get_slices(lst):
    ret = []
    idxr = len(lst)//2
    for i in range(idxr):
        ret.append(tuple(lst[i::idxr]))
    return ret

def assign_prompt_combos(players):
    c = list(players)
    even = not (len(c) % 2)
    tups = []
    
    random.shuffle(c)
    if even:
        tups.extend(get_slices(c))
        random.shuffle(c)
        tups.extend(get_slices(c))
        return tups
    
    fixed = c.pop()
    last = c[-1]
    tups.append((fixed, last))
    tups.extend(get_slices(c))
    c.pop()
    c.append(fixed)
    random.shuffle(c)
    tups.extend(get_slices(c))
    return tups


## the gamestate object is used to update the gamestate. There is a ready status associated with each player.
# for the prompt round, each player must enter all three prompts to be set to ready status. For the voting round,
# eventially want to have this be a set time interval from the client that will send a message to the socket when the 
# clock has expired for making a selection. Want this to be like a minute or so. Otherwise, we need to count if all the votes 
# are entered for a given prompt.

class GameState:
    def __init__(self, room):
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
            # if we are a voting stage, check if all the votes are submitted. To simplify, when time has expired to submit a vote, 
            # an empty string will be entered for the voting user.
            if not self.all_round_votes_submitted():
                return 'vote'
            return 'score'

    @property
    def gamestate(self):
        return self.room.gamestate

    def requires_ready_check(self):
        return READY_CHECK[self.gamestate]

    def requires_round_update(self):
        return self.gamestate == 'score' and self.room.room_round <= 1
        
    def requires_prompt_assignment(self):
        return self.next() == 'select' 

    def update_gamestate(self):
        self.room.gamestate = self.next()
        self.room.save(update_fields=['gamestate'])

    def update_round(self):
        self.room.room_round += 1
        self.room.save(update_fields=['room_round'])

    def ready_check(self):
        if not self.requires_ready_check():
            return True
        aliases = Alias.objects.filter(room_code=self.room.code).all()
        print({alias.alias: (alias.ready, alias.room_code) for alias in aliases})
        return all([alias.ready for alias in aliases])

    def set_ready_statuses_to_false(self):
        aliases = Alias.objects.filter(room_code=self.room.code).all()
        for alias in aliases:
            alias.ready = False
            alias.save(update_fields=['ready'])

    def all_round_selections_made(self):
        prompts = Prompt.objects.filter(room_code=self.room.code).all()
        return not any([
            prompt.assigned_user_1_song_choice is None or 
            prompt.assigned_user_2_song_choice is None
            for prompt in prompts
        ])

    def all_round_votes_submitted(self):
        prompts = Prompt.objects.filter(room_code=self.room.code).all()
        n_players = len(Alias.objects.filter(room_code=self.room.code).all())
  
        return all([
            prompt.assigned_user_1_votes + prompt.assigned_user_2_votes == n_players - 2
            for prompt in prompts
        ])

    def assign_prompts(self):
        aliases = Alias.objects.filter(room_code=self.room.code).all()
        # assign the propmts based on the prompt key, this makes it easier to select prompts from the db
        prompts = Prompt.objects.filter(room_code=self.room.code, prompt_key=self.room.room_round)
        players = [alias.user for alias in aliases]
        combos = assign_prompt_combos(players)
        for (prompt, combo) in zip(prompts, combos):
            prompt.assigned_user_1 = combo[0]
            prompt.assigned_user_2 = combo[1]
            print(prompt.assigned_user_1, prompt.assigned_user_2, prompt.prompt_text)
            prompt.save(update_fields=['assigned_user_1', 'assigned_user_2'])
            
    def update(self):
        if self.requires_prompt_assignment():
            self.assign_prompts()
        
        if self.requires_round_update():
            self.update_round()

        self.update_gamestate()
        self.set_ready_statuses_to_false()
