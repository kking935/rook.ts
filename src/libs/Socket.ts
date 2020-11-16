
import socketio, { Socket } from "socket.io";
import { Server } from "https";
import { enterQueueFour, enterQueueSix, enterQueueTwo, handleBet, handlePass, leaveMatch, leaveQueue, playCard, playerConnect, playerDisconnected, rematchRequested, setTrumps, updateCardsRequested, updateChosenCards } from "./game_manager";

export const listen = (app: Server ) => {
	const io = socketio.listen(app);
    io.on("connection", (socket: Socket) => {
        
        playerConnect(socket)
    
		socket.on("disconnect", function() {
			playerDisconnected(io, socket);
		});

		socket.on("enter queue two", function() {
			enterQueueTwo(io, socket);
		});

		socket.on("enter queue four", function() {
			enterQueueFour(io, socket);
		});

		socket.on("enter queue six", function() {
			enterQueueSix(io, socket);
		});

		socket.on("leave queue", function() {
			leaveQueue(socket);
		});

		socket.on("bet", function(bet: any) {
			handleBet(io, socket, bet);
		});

		socket.on("pass", function() {
			handlePass(io, socket);
		})

		socket.on("update cards", function(cards: any) {
			updateChosenCards(socket, cards)
		})

		socket.on("set trumps", function(newTrumps: string) {
			setTrumps(io, socket, newTrumps);
		})

		socket.on("play card", function(card: any) {
			// console.log('play card')
			playCard(io, socket, card);
		});

		socket.on("leave match", function() {
			leaveMatch(io, socket);
		});

		socket.on("request cards update", function() {
			updateCardsRequested(socket);
		});

		socket.on("request rematch", function() {
			rematchRequested(io, socket);
		});
	});
	return io;
};

export default listen