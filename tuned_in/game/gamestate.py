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


class GameState:
    def __init__(self, room):
        self.room = room

    def next(self):
        state = self.gamestate.split()[0]
        if state == 'queue':
            return 'prompts'
        elif state in {'prompts', 'score'}:
            #introuce logic to check the room for the round, etc.
            return 'select'
        elif state == 'select':
            if not self.all_round_selections_made():
                return 'select'
            return 'vote'
        elif state == 'vote':
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
        prompts = Prompt.objects.filter(room_code=self.room.code, prompt_key=self.room.room_round)
        players = [alias.user for alias in aliases]
        combos = assign_prompt_combos(players)
        for (prompt, combo) in zip(prompts, combos):
            prompt.assigned_user_1 = combo[0]
            prompt.assigned_user_2 = combo[1]
            prompt.save(update_fields=['assigned_user_1', 'assigned_user_2'])
            
    def update(self):
        if self.requires_prompt_assignment():
            self.assign_prompts()
        
        if self.requires_round_update():
            self.update_round()

        self.update_gamestate()
        self.set_ready_statuses_to_false()
