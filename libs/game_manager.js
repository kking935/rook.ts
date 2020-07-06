// This file handles all socket.io connections and manages the serverside game logic.

var socketio = require("socket.io");
const e = require("express");

var players = [];
var queue = [];
var matches = [];
var rematchRequests = [];

var goalPoints = 500;

const numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 1];
const colors = ["yellow", "green", "blue", "black"];
const rook = {
	number: 20,
	color: "red"
}

// Declare team size
const teamSize = 2;
const handSize = 10;
const potSize = 5;

var logFull = false;
const timerDuration = 60;

updateTimers();

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

		socket.on("play card", function(index) {
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
	console.log("FINDING PLAYER BY ID");
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
	console.log("FIND PLAYER BY ID");
	var player = findPlayerById(socket.id);
	if (queue.indexOf(player) === -1) {
		console.log("FOUND PLAYER BY ID");
		queue.push(player);
		socket.emit("queue entered");
		console.log(queue.length);
		if (queue.length >= 4) {
			createMatch([queue.shift(), queue.shift(), queue.shift(), queue.shift()]);
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

	// Create unique id for match
	var id = createId();
	console.log("Match id: ", id);

	// Create a deck before assigning hands to players
	var newDeck = shuffleDeck(generateDeck());

	// Create array for players
	var newPlayers = [];


	var newTeams = [];
	for (var team = 0; 
		team < Math.floor(participants.length / teamSize); 
		team++) {
		newTeams.push({
			id: team,
			points: 0
		})
	}


	// Iterate over each participant
	for (var participant = 0; participant < participants.length; participant++) {
		// Create a new playerObject
		console.log("Assiging to team : ", newTeams[Math.floor(participant / teamSize)])
		var playerObject = {
			socket: participants[participant].socket,
			// Add player to next team in order
			team: newTeams[Math.floor(participant / teamSize)],
			turn: participant,
			// Deal them a hand
			cards: dealHand(newDeck, handSize),
			currentCard: undefined
		};

		console.log("Adding new player to match: ", playerObject);

		newPlayers.push(playerObject);
		participants[participant].socket.emit("update cards", playerObject.cards);
	}

	var newRound = {
		number: 0,							// The round number
		pot: dealHand(newDeck, potSize),		// The pot at the start of each round
		cardPile: [],						// The current pile of cards
		topCard: undefined,					// The current greatest card value
		turn: 0,							// Which player's turn it is
		currentLeader: undefined,			// Current winning team
		trumps: undefined,					// The card color for trumps
		bet: undefined,								// The bet for this round
		better: undefined					// The team that bet on this round
	}

	// Make new match
	var match = {
		matchId: id,
		deck: newDeck,
		round: newRound,
		players: newPlayers,
		teams: newTeams,
		isOver: false,
		timerActive: false,
		timer: timerDuration
	};

	console.log("Creating new match: ", match);

	for (var z = 0;  z < participants.length; z++){
		participants[z].socket.join(id);
	}

	matches.push(match);
	io.to(id).emit("enter match");
	match.timerActive = true;

	participants[0].socket.emit("turn on play");
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

//////////////////////////// PLAY FUNCTIONS /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////


/**
 * Handles when a player wants to play their currently selected card
 * @param socket 	The socket of the player to play a card for
 * @param index 	The index in the card array of the player's hand
 */
function playCard(socket, index) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	console.log("\n\nplaying card\n\n");

	var match = findMatchBySocketId(socket.id);
	if (match) {
		var player = findPlayerById(match, socket.id);
		
		if (!player.currentCard) {
			if (index >= 0 && index < player.cards.length) {
				if (player.cards[index] !== undefined) {
					// player.currentCard = player.cards[index];
					// player.cards[index] = undefined;

					if (player.turn == match.turn) {
						player.currentCard = player.cards[index];
						player.cards[index] = undefined;

						match.timerActive = false;
						match.timer = timerDuration;

						if (fightCards(match, player.currentCard)) {
							match.round.topCard = player.currentCard;
							match.round.currentLeader = player.team;
						}

						match.round.cardPile.push(player.currentCard);

						if (player.turn == match.round.turn) {
							processRound(match);
						}
						else {
							match.round.turn++;
						}
					}
				}
			}
		}
	}
}

function fightCards(match, newCard) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	if (newCard === rook) {
		return true;
	}
	else if (match.round.topCard.number === rook) {
		return false;
	}

	var newCardWins = false;

	if (newCard.number > match.round.topCard.number) {
		newCardWins = true;
	}

	if (match.round.topCard.color == trumps && newCard.color != trumps) {
		newCardWins = false;
	}

	/*	
	// If the the powers are equal, it's a tie. Pass the player with the higest power as winner.
	// 	processRound(match, c0.power === c1.power, match.players[c0.power > c1.power ? 0 : 1]);
	// } else {
	// 	// Using modulus we can find the player with the winning type.
	// 	// Our types are represented by numbers: Rock = 0, Paper = 1, Scissors = 2
	// 	// We don't have to worry about ties, so a table of outcomes would look like this:

	// 	// | Types  _0_|_1_|_2_|
	// 	// |   0   |   | 1 | 0 |
	// 	// |   1   | 0 |   | 1 |
	// 	// |   2   | 1 | 0 |   |

	// 	// Since we have an array of players, we can use the outcome as the index to get the winner.
	// 	processRound(match, false, match.players[(2 + c0.type - c1.type) % 3]);
	// }{
		

	// 	// If the the powers are equal, it's a tie. Pass the player with the higest power as winner.
	// 	processRound(match, c0.power === c1.power, match.players[c0.power > c1.power ? 0 : 1]);
	// } else {
	// 	// Using modulus we can find the player with the winning type.
	// 	// Our types are represented by numbers: Rock = 0, Paper = 1, Scissors = 2
	// 	// We don't have to worry about ties, so a table of outcomes would look like this:

	// 	// | Types  _0_|_1_|_2_|
	// 	// |   0   |   | 1 | 0 |
	// 	// |   1   | 0 |   | 1 |
	// 	// |   2   | 1 | 0 |   |

	// 	// Since we have an array of players, we can use the outcome as the index to get the winner.
	// 	processRound(match, false, match.players[(2 + c0.type - c1.type) % 3]);
	// }
	*/

	return newCardWins;
}

/**
 * Processes the end of each round, determining who won
 * @param {} match 
 * @param {*} tied 
 * @param {*} winner 	The winning team's number
 */
function processRound(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	var totalPoints = 0;
	for (var card = 0; card < match.round.cardPile.length; card++) {
		switch(match.round.cardPile[card].number) {
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

	if (match.round.better === match.round.currentLeader
		&& match.round.bet <= totalPoints) {
		match.round.better.points += totalPoints;
	}
	else {
		match.round.better.points -= totalPoints;
	}

	// TODO: Update figh result socket now
	io.to(match.matchId).emit("fight result", match.round.currentLeader);

	if (match.round.currentLeader.points >= goalPoints) {
		endMatch(match, winner, "set");
	} else {
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
}

function checkForSet(player) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	for (var i = 0; i < player.points.length; i++) {
		var setColors = [];
		for (var j = 0; j < player.points[i].length; j++) {
			if (setColors.indexOf(player.points[i][j].color) === -1) {
				setColors.push(player.points[i][j].color);
			}
		}
		// If the player has 3 of the same element of different color
		if (setColors.length >= 3) {
			return true;
		}
	}
	for (var i = 0; i < player.points[0].length; i++) {
		for (var j = 0; j < player.points[1].length; j++) {
			for (var k = 0; k < player.points[2].length; k++) {
				
				// If player has 3 different elements with 3 different colors
				if (player.points[0][i].color !== player.points[1][j].color &&
					player.points[0][i].color !== player.points[2][k].color &&
					player.points[1][j].color !== player.points[2][k].color) {
					return true;
				}
			}
		}
	}
	return false;
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
			var winner = match.players[match.players[0].socket.id !== socket.id ? 0 : 1];
			endMatch(match, winner, "player left");
		} else {
			io.to(match.matchId).emit("no rematch");
		}
		removeMatch(match);
	}
}

/**
 * Ends a match for all of the players invovled
 * @param match 	The match to end
 * @param {*} winner 	The winners of the match (an array of players)
 * @param {*} reason 	The reason they won
 */
function endMatch(match, winners, reason) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	for (var winner = 0; winner < winners.length; winner++) {
		io.to(match.matchId).emit("end match", winners[winner].socket.id, reason);
	}
	match.isOver = true;
	match.timer = timerDuration;
	match.timerActive = false;
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
		var player = findPlayerById(match, socket.id);
		player.socket.emit("update cards", player.cards);
		match.timerActive = true;
	}
}

/**
 * Handles when a player requests a rematch
 * @param {*} socket 
 */
function rematchRequested(socket) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	// Find this players match
	var match = findMatchBySocketId(socket.id);

	// If match exits
	if (match) {
		match.rematch += 1;

		// If the match has a requested rematch and 
		if (match.rematch == match.players.length) {
			removeMatch(match);
			createMatch(match.players);
		}
	}
} 

/**
 * Updates the timers for each active match
 */
function updateTimers() {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	for (var i = 0; i < matches.length; i++) {
		if (matches[i].timerActive) {
			matches[i].timer -= 1;
			if (matches[i].timer === 0) {
				timesup(matches[i]);
			}
		}
	}
	setTimeout(updateTimers, 1000);
}

/**
 * Handles what to do when a match's time is up
 * @param match 	The match that's time is up
 */
function timesup(match) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	match.timerActive = false;
	match.timer = timerDuration;
	if (match.players[0].currentCard) {
		if (match.players[1].currentCard) {
			fightCards(match);
		} else {
			processRound(match, false, match.players[0]);
		}
	} else {
		if (match.players[1].currentCard) {
			processRound(match, false, match.players[1]);
		} else {
			processRound(match, true, match.players[0]);
		}
	}
}
