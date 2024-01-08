import { useSocketContext } from "../contexts/SocketContext";
import { useUserContext } from "../contexts/UserContext";
import { authenticateUsersSpotify } from "../backend/API";
import { SPOTIFY_API } from "../backend/API";

export default function useSpotifyAuth(){
    const { user } = useUserContext();
    const socketManager = useSocketContext();

    const spotifyLogout = async () => {
        SPOTIFY_API.post('logout').then((_) => {
            socketManager.send('user_logout_spotify', {player_id: user.id})
        });
    };

    const spotifyLogin = async () => {
        await authenticateUsersSpotify();
    };

    const toggleSpotifyAuth =  async () => {
        console.log(user.isAuthenticated);
        if (user.isAuthenticated){
            await spotifyLogout();
        } else {
            await spotifyLogin();
        }
    }

    return { spotifyLogout, spotifyLogin, toggleSpotifyAuth }
}