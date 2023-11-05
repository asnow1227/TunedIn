import { useSocketContext } from "../../providers/SocketContext";
import { useUserContext } from "../../providers/UserContext";


export default function AuthenticateLanding({ user }){
    socketManager = useSocketContext();
    socketManager.send('authentication_update', {
        user: user.id
    });
}