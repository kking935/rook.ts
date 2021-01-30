// This file handles all socket.io connections and manages the serverside game logic.

var socketio = require("socket.io");
const e = require("express");
var logFull = false;

var logFull = false;

var players = [];
var queueTwo = [];
var queueFour = [];
var queueSix = [];
var matches = [];
var rematchRequests = [];

var goalPoints = 500;
const teamSize = 2;
const numTeams = 2;
// const handSize = 1;
const potSize = 5;

const numbers = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 1];
const colors = ["Yellow", "Green", "Red", "Black"];
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

		socket.on("enter queue two", function() {
			enterQueueTwo(socket);
		});

		socket.on("enter queue four", function() {
			enterQueueFour(socket);
		});

		socket.on("enter queue six", function() {
			enterQueueSix(socket);
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

		socket.on("play card", function(card) {
			// console.log('play card')
			playCard(socket, card);
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
function enterQueueTwo(socket) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	var player = findPlayerById(socket.id);
	if (queueTwo.indexOf(player) === -1) {
		queueTwo.push(player);
		socket.emit("queue entered");
		if (queueTwo.length >= 2) {
			var newPlayers = [];
			var currentQueue = queueTwo.length;
			for (var x = 0; x < currentQueue ; x++) {
				newPlayers.push(queueTwo.shift())
			}
			createMatch(newPlayers, 5);
		}
	}
}

function enterQueueFour(socket) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	var player = findPlayerById(socket.id);
	if (queueFour.indexOf(player) === -1) {
		queueFour.push(player);
		socket.emit("queue entered");
		if (queueFour.length >= 4) {
			var newPlayers = [];
			var currentQueue = queueFour.length;
			for (var x = 0; x < currentQueue ; x++) {
				newPlayers.push(queueFour.shift())
			}
			createMatch(newPlayers, 10);
		}
	}
}

function enterQueueSix(socket) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	var player = findPlayerById(socket.id);
	if (queueSix.indexOf(player) === -1) {
		queueSix.push(player);
		socket.emit("queue entered");
		if (queueSix.length >= 6) {
			var newPlayers = [];
			var currentQueue = queueSix.length;
			for (var x = 0; x < currentQueue ; x++) {
				newPlayers.push(queueSix.shift())
			}
			createMatch(newPlayers, 7);
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
	var index = queueTwo.indexOf(player);
	if (index > -1){
		queueTwo.splice(index, 1)
		index = -1
	}
	else {
		index = queueFour.indexOf(player)
	}
	if (index > -1) {
		queueFour.splice(index, 1)
		index = -1
	}
	else {
		index = queueSix.indexOf(player)
	}
	if (index > -1) {
		queueSix.splice(index, 1);
		index = -1
	}
	socket.emit("queue left");
}

/**
 * Creates a new match for the teams of players passed in
 * @param  participants 	The participlants to create a match for
 */
function createMatch(participants, handSize) {
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
		};

		newPlayers.push(playerObject);
		participants[participant].socket.emit("update cards", playerObject.cards);
	}

	var match = {
		matchId: id,
		deck: newDeck,
		round: createRound(0, newDeck, newPlayers),
		players: newPlayers,
		teams: newTeams,
		isOver: false,
		gameSize: participants.length,
		handSize: handSize
	};

	for (var z = 0;  z < participants.length; z++){
		participants[z].socket.join(id);
	}

	matches.push(match);

	for (var x = 0; x < match.players.length; x++) {
		match.players[x].socket.emit("enter match", match.players[x].team);
	}

	var slot = 0;
	if (match.players.length === 6) {
		slot = -1;
	}

	io.to(match.matchId).emit("update choose cards", match.round.pot, slot);

	for (var i in newPlayers) {
		for (var x in players) {
			if (newPlayers[i].socket.id == players[x].socket.id) {
				players[x] = newPlayers[i]
			}
		}
	}
	callBet(match);
}

function createRound(roundNumber, deck, roundPlayers) {
	var newRound = {
		number: roundNumber,				// The round number
		pot: dealHand(deck, potSize),		// The pot at the start of each round
		turnToBet: 0,						// The turn for the bet
		bet: 0,								// The bet for this round
		roundBetter: undefined,				// The team that bet on this round
		currentBetters: roundPlayers.slice(0),			// Initialize the round's betters to be all the players
		trumps: undefined,					// The card color for trumps
		circuit: createCircuit()				// The circuit of plays
	}
	return newRound;
}

function createCircuit() {
	var newCircuit = {
		number: 0,							// The circuit number
		cardPile: [],						// The current pile of cards
		bestCard: {number: -1, color: 'none'},	// The current greatest card value
		currentLeader: 0,					// Player with the best card in this round's pile
		turnToPlay: 0,						// Which player's turn it is
		endTurn: 0
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
		console.log('the turn is ', turn)
		match.round.currentBetters[turn].socket.emit("turn on bet");
	}
	else if (match.round.currentBetters.length > 1) {
		match.round.turnToBet = 0;
		console.log('reseting turn to bet back to 0')

		callBet(match);
	}
	else {
		console.log('here')
		match.round.roundBetter = match.round.currentBetters[0];
		console.log('round better : ', match.round.roundBetter.socket.id)
		// console.log(match.round.roundBetter)
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

	console.log('passing: ', socket.id)
	console.log('current betters : ', match.round.currentBetters)
	match.round.currentBetters.splice(match.round.currentBetters.indexOf(player), 1);	
	console.log('current betters : ', match.round.currentBetters)

	callBet(match);
}

function startRound(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	for (var i = 0; i < match.players.length; i++) {
		// console.log(match.players[i])
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

	for (var i = 0; i < match.players.length; i++) {
		console.log(i)
		if (match.players[i].socket == socket) {
			console.log('calling turn on choose trumps')
			match.players[i].socket.emit("turn on choose trumps");
		} else {
			// console.log('emitting waitingo on better to choose trumps')
			match.players[i].socket.emit("waiting on bet winner to choose trumps")
		}
	}
	player.cards = cards;

}

function setTrumps(socket, newTrumps) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	var match = findMatchBySocketId(socket.id);
	var player = findPlayerById(socket.id);
	
	match.round.trumps = newTrumps;

	io.to(match.matchId).emit("start round with trumps", newTrumps, match.gameSize);

	console.log('player is ', player.turn)

	setTurns(match, player)

	// handleTurn(match);
}

function setTurns(match, player) {
	console.log('player is ', player.turn)
	match.round.circuit.currentLeader = player
	player.socket.emit("turn play on");
	match.round.circuit.turnToPlay = player.turn;
	console.log('setting turn to ', player.turn)
	match.round.circuit.endTurn = match.players.length;
}

/**
 * Handles when a player wants to play their currently selected card
 * @param socket 	The socket of the player to play a card for
 * @param index 	The index in the card array of the player's hand
 */
function playCard(socket, card) {
	// console.log('here')
	// if (logFull) // console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	// console.lo('playing card')
	var match = findMatchBySocketId(socket.id);
	if (match) {
		console.log('playing card')
		var player = findPlayerById(socket.id);
		var isTurn = (player.turn === match.round.circuit.turnToPlay);
		var cardExists = card !== undefined;

		if (isTurn && cardExists) {
			console.log('about to fight cards')
			// console.log('at line 468')

			if (fightCards(match, card)) {
				// console.log('at 471')
				match.round.circuit.bestCard = card;
				match.round.circuit.currentLeader = player;
			}
			
			io.to(match.matchId).emit('play card', card, match.round.circuit.cardPile.length)

			match.round.circuit.cardPile.push(card);

			match.round.circuit.turnToPlay++;
			match.round.circuit.endTurn--;

			// console.log('about to handle turn', match.round.circuit.turnToPlay)
			handleTurn(match);
		}
	}
}

function handleTurn(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	console.log('in handle turn')
	// console.log(match.round)
	// console.log('turn to play: ', match.round.circuit.turnToPlay )

	if (match.round.circuit.endTurn > 0) {
		if (match.round.circuit.turnToPlay >= match.players.length) {
			match.round.circuit.turnToPlay = 0;
		}
		console.log('telling player to play ', match.round.circuit.turnToPlay)
		match.players[match.round.circuit.turnToPlay].socket.emit("turn play on");
	}
	else {
		processCircuit(match);
	}
}

function fightCards(match, newCard) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	console.log('new card: ', newCard)
	console.log('current best: ', match.round.circuit.bestCard)
	// console.log('inside fight card')
	var newCardWins = false;
	if ((match.round.circuit.bestCard && match.round.circuit.bestCard.number !== 1) && newCard.number > match.round.circuit.bestCard.number || newCard.number === 1){
		newCardWins = true;
	} 

	var newCardIsTrumps = (newCard.color === match.round.trumps) || (newCard.color === "ROOK")
	var currCardIsTrumps = (match.round.circuit.bestCard.color === match.round.trumps) || (match.round.circuit.bestCard.color === "ROOK")
	
	if (currCardIsTrumps && !newCardIsTrumps) {
		newCardWins = false;
	}
	else if (!currCardIsTrumps && newCardIsTrumps) {
		newCardWins = true;
	} 
	else if (!currCardIsTrumps && !newCardIsTrumps) {
		if (match.round.circuit.bestCard.color != 'none' && match.round.circuit.bestCard.color != newCard.color) {
			newCardWins = false;
		}
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

	console.log('processing circuit')
	var totalPoints = 0;
	for (var card = 0; card < match.round.circuit.cardPile.length; card++) {
		switch(match.round.circuit.cardPile[card].number) {
			case 20:
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

	// console.log('curr leader: ',match.round.circuit.currentLeader)
	match.round.circuit.currentLeader.team.points += totalPoints;

	console.log('circuit winners')
	io.to(match.matchId).emit("circuit winners", match.round.circuit.currentLeader.team, totalPoints);


	match.round.circuit.number++;

	console.log('circuit number  : ', match.round.circuit.number, ' handsize ', match.handSize)
	setTimeout(() => {
		if (match.round.circuit.number == match.handSize) {
			processRound(match);
		} else {
			nextCircuit(match);
		}
	}, 5000);
}

function nextCircuit(match) {
	io.to(match.matchId).emit('new circuit')
	match.round.circuit.bestCard = {number: -1, color: 'none'}
	match.round.circuit.cardPile = []					// Reset card pile
	console.log('player is ', match.round.circuit.currentLeader.turn)

	setTurns(match, match.round.circuit.currentLeader)
}

/**
 * Processes the end of each round, determining who won
 * @param {} match 
 * @param {*} tied 
 * @param {*} winner 	The winning team's number
 */
function processRound(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	console.log('processing round')
	
	if (match.round.bet <= match.round.roundBetter.team.roundPoints) {
		match.round.roundBetter.team.matchPoints += match.round.roundBetter.team.roundPoints;
	}
	else {
		match.round.roundBetter.team.matchPoints -= match.round.roundBetter.team.roundPoints;
	}

	if (match.round.roundBetter.team.points >= goalPoints) {
		endMatch(match, match.round.roundBetter.team, "set");
	} else {
		console.log('next round')
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

	setTimeout(() => io.to(match.matchId).emit('new round'), 5000)

	// io.to(match.matchId).emit('new circuit')
	setTimeout(() => {
		match.deck = shuffleDeck(generateDeck())
		match.round = createRound(match.round.number + 1, match.deck, match.players)
		match.round.bet = 0
		
		for (var i = 0; i < match.players.length; i++) {
			match.players[i].cards = dealHand(match.deck, match.handSize);
			match.players[i].socket.emit('update cards', match.players[i].cards)
		}
	
		var slot = 0;
		if (match.players.length === 6) {
			slot = -1;
		}
		io.to(match.matchId).emit("update choose cards", match.round.pot, slot);
		callBet(match)
	}, 6000)
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
		var player = findPlayerById(socket.id);
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
