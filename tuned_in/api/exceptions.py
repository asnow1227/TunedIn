class RoomNotReadyError(Exception):
    def __init__(self, room_code):
        message = f'Not all players in room {room_code} are ready'
        super().__init__(message)