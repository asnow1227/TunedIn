import API from '../backend/API';

export default async function getRoom(roomCode){
    await API.get('get-room?code=' + roomCode)
}