// This file handles all socket.io connections and manages the serverside game logic.

var socketio = require("socket.io");
const e = require("express");
var logFull = false;

var logFull = false;

var players = [];
var queue = [];
var matches = [];
var rematchRequests = [];

var goalPoints = 500;
const teamSize = 1;
const numTeams = 2;
const handSize = 10;
const potSize = 5;

const numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 1];
const colors = ["Yellow", "Green", "Blue", "Black"];
const rook = {
	number: 20,
	color: "ROOK"
}

//////////  Socket.io  \\\\\\\\\\
module.exports.listen = function(app) {
	io = socketio.listen(app);
	io.on("connection", function(socket) {
		players.push({
			socket: socket,
		});

		socket.on("disconnect", function() {
			playerDisconnected(socket);
		});

		socket.on("enter queue", function() {
			enterQueue(socket);
		});

		socket.on("leave queue", function() {
			leaveQueue(socket);
		});

		socket.on("bet", function(bet) {
			handleBet(socket, bet);
		});

		socket.on("pass", function() {
			handlePass(socket);
		})

		socket.on("update cards", function(cards) {
			updateChosenCards(socket, cards)
		})

		socket.on("set trumps", function(newTrumps) {
			setTrumps(socket, newTrumps);
		})

		socket.on("play card", function(index) {
			console.log('play card')
			playCard(socket, index);
		});

		socket.on("leave match", function() {
			leaveMatch(socket);
		});

		socket.on("request cards update", function() {
			updateCardsRequested(socket);
		});

		socket.on("request rematch", function() {
			rematchRequested(socket);
		});
	});
	return io;
};

//////////  Functions  \\\\\\\\\\
// ------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Disconnects a player from their match	
 * @param socket 	The socket of the player to disconnect
 */
function playerDisconnected(socket) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	var player = findPlayerById(socket.id);
	var index = players.indexOf(player);
	if (index > -1) {
		leaveQueue(socket);
		leaveMatch(socket);
		players.splice(index, 1);
	}
}

/**
 * Finds a player by their socket's id
 * @param socketId	The socket id of the player
 */
function findPlayerById(socketId) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	for (var i = 0; i < players.length; i++) {
		if (players[i].socket.id === socketId) {
			return players[i];
		}
	}
	return false;
}

/**
 * Handles the event when a new player enters the queue (clicks on the play button to join a lobby)
 * @param socket	The socket of the player who entered the queue 
 */
function enterQueue(socket) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	var player = findPlayerById(socket.id);
	if (queue.indexOf(player) === -1) {
		queue.push(player);
		socket.emit("queue entered");
		if (queue.length >= numTeams * teamSize) {
			var newPlayers = [];
			var currentQueue = queue.length;
			for (var x = 0; x < currentQueue ; x++) {
				newPlayers.push(queue.shift())
			}
			createMatch(newPlayers);
		}
	}
}

/**
 * Removes a player from the queue
 * @param socket 	The socket of the player to remove from the queue
 */
function leaveQueue(socket) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	var player = findPlayerById(socket.id);
	var index = queue.indexOf(player);
	if (index > -1) {
		queue.splice(index, 1);
	}
	socket.emit("queue left");
}

/**
 * Creates a new match for the teams of players passed in
 * @param  participants 	The participlants to create a match for
 */
function createMatch(participants) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());


	if (participants.length === 6) {
		this.potSize = 3;
	} else {
		this.potSize = 5;
	}

	var id = createId();
	var newDeck = shuffleDeck(generateDeck());
	var newPlayers = [];
	var newTeams = [];
	for (var team = 0; team < numTeams; team++) {
		newTeams.push({
			id: team,
			points: 0
		})
	}

	for (var participant = 0; participant < participants.length; participant++) {
		var playerObject = {
			socket: participants[participant].socket,
			team: newTeams[Math.floor(participant % numTeams)],
			turn: participant,
			cards: dealHand(newDeck, handSize),
			currentCard: undefined
		};

		newPlayers.push(playerObject);
		participants[participant].socket.emit("update cards", playerObject.cards);
	}

	players = newPlayers;

	var match = {
		matchId: id,
		deck: newDeck,
		round: createRound(0, newDeck),
		players: newPlayers,
		teams: newTeams,
		isOver: false
	};

	for (var z = 0;  z < participants.length; z++){
		participants[z].socket.join(id);
	}

	matches.push(match);

	for (var x = 0; x < players.length; x++) {
		players[x].socket.emit("enter match", players[x].team);
	}

	var slot = 0;
	if (match.players.length === 6) {
		slot = -1;
	}

	io.to(match.matchId).emit("update choose cards", match.round.pot, slot);

	callBet(match);
}

function createRound(roundNumber, deck) {
	var newRound = {
		number: roundNumber,				// The round number
		pot: dealHand(deck, potSize),		// The pot at the start of each round
		turnToBet: 0,						// The turn for the bet
		bet: 0,								// The bet for this round
		roundBetter: undefined,				// The team that bet on this round
		currentBetters: players.slice(0),			// Initialize the round's betters to be all the players
		trumps: undefined,					// The card color for trumps
		circuit: createCircuit()				// The circuit of plays
	}
	return newRound;
}

function createCircuit() {
	var newCircuit = {
		cardPile: [],						// The current pile of cards
		bestCard: {number: -1, color: 'none'},	// The current greatest card value
		currentLeader: undefined,			// Player with the best card in this round's pile
		turnToPlay: 0,						// Which player's turn it is
	}
	return newCircuit;
}

/**
 * Creates an unique ID for a new match
 */
function createId() {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	var id = "";
	var charset = "ABCDEFGHIJKLMNOPQRSTUCWXYZabcdefghijklmnopqrtsuvwxyz1234567890";
	for (var i = 0; i < 16; i++) {
		id += charset.charAt(Math.floor(Math.random() * charset.length));
	}
	return id;
}

//////////////////////////// DECK FUNCTIONS /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

/**
 * Generates a new deck (for a new match)
 * @return deck	The newly generated deck of cards
 */
function generateDeck() {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	var deck = [];
	for (var color = 0; color < colors.length; color++) {
		for (var number = 0; number < numbers.length; number++) {
			deck.push({
				color: colors[color],
				number: numbers[number]
			});
		}
	}
	deck.push(rook);
	return deck;
}

/**
 * Deals a player's initial hand
 * @param deck 	The deck to deal from
 */
function dealHand(deck, numCards) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	var hand = [];
	for (var card = 0; card < numCards; card++) {
		hand.push(drawCard(deck));
	}
	return hand;
}

/**
 * Draws a card from this deck
 * @param deck 	The deck to draw a card from
 */
function drawCard(deck) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	return deck.shift();
}

/**
 * Shuffles the deck
 * @param deck	The deck of cards to shuffle
 * @return deckCopy 	The shuffled copy of the original deck of cards 
 */
function shuffleDeck(deck) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	var deckCopy = deck.slice();
	for (var i = deckCopy.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = deckCopy[i];
		deckCopy[i] = deckCopy[j];
		deckCopy[j] = temp;
	}
	return deckCopy;
}

//////////////////////////// FIND _ BY ID FUNCTIONS /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

/**
 * Finds a player's match based on their socket's id
 * @param socketId 	The id of the socket of the player whos match we're looking for
 */
function findMatchBySocketId(socketId) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	for (var i = 0; i < matches.length; i++) {
		for (var j = 0; j < matches[i].players.length; j++) {
			if (matches[i].players[j].socket.id === socketId) {
				return matches[i];
			}
		}
	}
	return false;
}
 
/**
 * Tells the next player in the match to bet,
 * or starts the round if the 
 * @param match 
 */
function callBet(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	var turn = match.round.turnToBet;
	if (turn < match.round.currentBetters.length && match.round.currentBetters.length != 1) {
		match.round.currentBetters[turn].socket.emit("turn on bet");
	}
	else if (match.round.currentBetters.length > 1) {
		match.round.turnToBet = 0;
		callBet(match);
	}
	else {
		// console.log('here')
		match.round.roundBetter = match.round.currentBetters[0];
		io.to(match.matchId).emit("end betting");
		startRound(match);
	}
}

function handleBet(socket, bet) {

	var match = findMatchBySocketId(socket.id);
	var player = findPlayerById(socket.id);

	io.to(match.matchId).emit('update current bet', bet, player.team.id);

	if (bet > match.round.bet) {
		match.round.bet = bet;
		match.round.roundBetter = player;
	}
	else {
		handlePass(socket);
	}

	match.round.turnToBet++;
	callBet(match);
}

function handlePass(socket) {
	var match = findMatchBySocketId(socket.id);
	var player = findPlayerById(socket.id);

	match.round.currentBetters.splice(match.round.currentBetters.indexOf(player), 1);	
	callBet(match);
}

function startRound(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	for (var i = 0; i < match.players.length; i++) {
		if (match.players[i] === match.round.roundBetter ) {
			match.round.roundBetter.socket.emit('turn on choose cards');
		}
		else {
			match.players[i].socket.emit('waiting on bet winner to choose cards')
		}
	}
}

function updateChosenCards(socket, cards) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	var match = findMatchBySocketId(socket.id)
	var player = findPlayerById(socket.id);
	player.cards = cards;

	for (var i = 0; i < match.players.length; i++) {
		if (match.players[i] === player) {
			match.players[i].socket.emit("turn on choose trumps");
		} else {
			// console.log('emitting waitingo on better to choose trumps')
			match.players[i].socket.emit("waiting on bet winner to choose trumps")
		}
	}

}

function setTrumps(socket, newTrumps) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	var match = findMatchBySocketId(socket.id);
	var player = findPlayerById(socket.id);
	
	match.round.trumps = newTrumps;

	io.to(match.matchId).emit("start round with trumps", newTrumps);

	match.round.circuit.turnToPlay = player.turn
	match.round.circuit.endTurn = player.turn - 1;
	if (match.round.circuit.endTurn < 0) {
		match.round.circuit.endTurn = match.players.length - 1
	}
	handleTurn(match);
}

/**
 * Handles when a player wants to play their currently selected card
 * @param socket 	The socket of the player to play a card for
 * @param index 	The index in the card array of the player's hand
 */
function playCard(socket, index) {
	console.log('here')
	// if (logFull) // console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	console.log('playing card')
	var match = findMatchBySocketId(socket.id);
	if (match) {
		for (var z = 0;  z < match.players.length; z++){
			// console.log("PlayerCARD : ", match.players[z].cards);
		}

		var player = findPlayerById(socket.id);
		var isTurn = (player.turn === match.round.circuit.turnToPlay);
		var isValidIndex = index >= 0 && index < player.cards.length;
		var cardExists = player.cards[index] !== undefined;

		if (isTurn && isValidIndex && cardExists && !player.currentCard) {
			console.log('about to fight cards')
			player.currentCard = player.cards[index];
			player.cards[index] = undefined;

			if (fightCards(match, player.currentCard)) {
				match.round.circuit.bestCard = player.currentCard;
				match.round.circuit.currentLeader = player.team;
			}

			match.round.circuit.cardPile.push(player.currentCard);

			match.round.circuit.turnToPlay++;


			console.log('about to handle turn', match.round.circuit.turnToPlay)
			handleTurn(match);
		}
	}
}

function handleTurn(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	// console.log('in handle turn')
	// console.log(match.round)
	var turn = match.round.circuit.turnToPlay;
	console.log('turn to play: ', turn)

	if (turn != match.round.circuit.endTurn) {
		if (turn >= match.players.length) {
			turn = 0;
			match.round.circuit.turnToPlay = 0;
		}
		match.players[turn].socket.emit("turn play on");
	}
	else {
		processCircuit(match);
	}
}

function fightCards(match, newCard) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	var newCardWins = newCard.number > match.round.circuit.bestCard.number;

	if (match.round.circuit.bestCard.color === match.round.trumps && newCard.color != trumps) {
		newCardWins = false;
	}

	return newCardWins;
}

/**
 * Processes the end of each round, determining who won
 * @param {} match 
 * @param {*} tied 
 * @param {*} winner 	The winning team's number
 */
function processCircuit(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	var totalPoints = 0;
	for (var card = 0; card < match.round.circuit.cardPile.length; card++) {
		switch(match.round.circuit.cardPile[card].number) {
			case "rook":
				totalPoints += 20;
				break;
			case 1:
				totalPoints += 15;
				break;
			case 5: 
				totalPoints += 5;
				break;
			case 10:
				totalPoints += 10;
				break;
			case 14:
				totalPoints += 10;
				break;
		}
	}

	match.round.circuit.currentLeader.team.points += totalPoints;

	io.to(match.matchId).emit("circuit winners", match.round.circuit.currentLeader.team);

	match.round.circuit.number++;

	if (match.round.circuit.number === handSize) {
		processRound(match);
	} else {
		nextCircuit(match);
	}
}


/**
 * Processes the end of each round, determining who won
 * @param {} match 
 * @param {*} tied 
 * @param {*} winner 	The winning team's number
 */
function processRound(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	if (match.round.bet <= match.round.roundBetter.team.roundPoints) {
		match.round.roundBetter.team.matchPoints += match.round.roundBetter.team.roundPoints;
	}
	else {
		match.round.roundBetter.team.matchPoints -= match.round.roundBetter.team.roundPoints;
	}

	if (match.round.roundBetter.team.points >= goalPoints) {
		endMatch(match, match.round.roundBetter.team, "set");
	} else {
		io.to(match.matchId).emit("round winners", match.round.roundBetter.team);
		nextRound(match);
	}
}

/**
 * Prepares each player in the match for the next round
 * @param {Prep} match 
 */
function nextRound(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	for (var i = 0; i < match.players.length; i++) {
		match.players[i].currentCard = undefined;
		for (var j = 0; j < match.players[i].cards.length; j++) {
			if (match.players[i].cards[j] === undefined) {
				match.players[i].cards[j] = drawCard(match.deck);
			}
		}
	}

	match.round.number++;
	match.round.turnToBet = 0;

	handleTurn(match)
}

/**
 * Handles when a player tries to leave a match
 * @param socket 
 */
function leaveMatch(socket) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	var match = findMatchBySocketId(socket.id);
	if (match) {
		if (!match.isOver) {
			abbortMatch(match);
		} else {
			io.to(match.matchId).emit("no rematch");
		}
		removeMatch(match);
	}
}

function abbortMatch(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	io.to(match.matchId).emit("abbort match", "player left");
	match.isOver = true;
}

/**
 * Ends a match for all of the players invovled
 * @param match 	The match to end
 * @param {*} winner 	The winners of the match (an array of players)
 * @param {*} reason 	The reason they won
 */
function endMatch(match, winningTeam, reason) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	io.to(match.matchId).emit("end match", winningTeam, reason);
	match.isOver = true;
}

/**
 * Removes a match from the array of matches that are being tracked
 * @param match	The match to remove 
 */
function removeMatch(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	var index = matches.indexOf(match);
	if (index > -1) {
		matches.splice(index, 1);
	}
}

/**
 * Updates a player's cards based on their socket id and its corresponding match
 * @param {*} socket 
 */
function updateCardsRequested(socket) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	var match = findMatchBySocketId(socket.id);
	if (match) {
		var player = findPlayerById( socket.id);
		player.socket.emit("update cards", player.cards);
	}
}

/**
 * Handles when a player requests a rematch
 * @param {*} socket 
 */
function rematchRequested(socket) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	var match = findMatchBySocketId(socket.id);
	if (match) {
		match.rematch += 1;
		if (match.rematch == match.players.length) {
			removeMatch(match);
			createMatch(match.players);
		}
	}
} 
