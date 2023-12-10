
class SocketManager {
    constructor(roomCode){
        this.socket = new WebSocket(`ws://${window.location.host}/ws/room/${roomCode}/`);
        this.functions = new Map();
        this.routeMessage = this.routeMessage.bind(this);
        this.removeEvent = this.removeEvent.bind(this);
        this.onEvent = this.onEvent.bind(this);
        this.send = this.send.bind(this);
        this.removeEvents = this.removeEvents.bind(this);
        this.roomCode = roomCode;
        this.onEvents = this.onEvents.bind(this);
        this.socket.onmessage = this.routeMessage;
    }
    routeMessage(e){
        let data = JSON.parse(e.data);
        try {
            return this.functions[data.type](data.data)
        } catch (error) {
            console.log(data.type);
            console.log(data.data)
        }
    }
    onEvent(event_type, func){
        this.functions[event_type] = func;
    }
    onEvents(events){
        for (const [eventName, eventFunc] of Object.entries(events)) {
            this.functions[eventName] = eventFunc;
        };
    }
    removeEvent(event_type){
        this.functions.delete(event_type);
    }
    removeEvents(events){
        events.forEach(event => this.functions.delete(event));
    }
    send(event_type, data=null){
        if (this.socket === null) {
            return
        }
        const message = JSON.stringify({
            type: event_type,
            data: data
        });
        if (this.socket.readyState === 1) {
            this.socket.send(message);
        } else {
            this.socket.onopen = () => this.socket.send(message);
        }
    }
    close(){
        if (this.socket === null){
            return
        }
        this.socket.close();
    }
    initialize(roomCode){
        this.socket = new WebSocket(`ws://${window.location.host}/ws/room/${roomCode}/`);
        this.roomCode = roomCode;
        this.socket.onmessage = this.routeMessage;
    }
}

export default SocketManager;