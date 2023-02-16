READY_CHECK = {
    'queue': False,
    'prompts': False
}

class GameState:
    def __init__(self, gamestate, room_code):
        self.gamestate = gamestate
        self.room_code = room_code

    def next(self):
        state = self.gamestate.split()[0]
        print(f"next call: {state}")
        if state == 'queue':
            return 'prompts'
        elif state == 'prompts':
            #introuce logic to check the room for the round, etc.
            return 'round'

    @staticmethod
    def requires_ready_check(gamestate):
        return READY_CHECK[gamestate]