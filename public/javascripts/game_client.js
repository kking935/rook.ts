var socket = io();
var logFull = false;

// State variables
// ----------------
// For betting:
var canBet = false;

// For choosing cards from pot:
var canChooseCards = false;

// For playing card:
var canPlayCard = false;

var opponentCard, playerCard, winningTeam, matchEndReason, readyToEnd;
var currBet = 0;
var betIncrease = 5;
var betIncrements = 5;

//////////  Socket Events  \\\\\\\\\\
socket.on('update cards', function (cards) {
	updateCards(cards);
});

socket.on('enter match', function (team) {
	enterMatch(team);
});

socket.on('update choose cards', function (cards, slot) {
	updateChooseCards(cards, slot);
});

socket.on('update current bet', function (newBet, bettingTeamId) {
	updateCurrentBet(newBet, bettingTeamId);
});

socket.on('turn on bet', function () {
	turnOnBet();
});

socket.on('end betting', function () {
	endBet();
});

socket.on('turn on choose cards', function () {
	turnOnChooseSlots();
});

socket.on('turn on choose trumps', function () {
	turnOnChooseTrumps();
});

socket.on('start round with trumps', function (newTrumps, gameSize) {
	startRoundWithTrumps(newTrumps, gameSize);
	initializeCircuitPile(gameSize);
});

socket.on('turn play on', function () {
	turnOnPlay();
});

socket.on('play card', function (card, slot) {
	addToCircuitPile(card, slot);
});

socket.on('waiting on bet winner to choose cards', function () {
	turnOnLabels(['playerChoosingCards']);
});

socket.on('waiting on bet winner to choose trumps', function () {
	turnOffChooseSlots();
});

socket.on('unknown card played', function () {
	unknownCardPlayed();
});

socket.on('unknown card played', function () {
	unknownCardPlayed();
});

socket.on('waiting on bet winner to choose trumps', function () {
	turnOffChooseSlots();
	turnOffLabels(['playerChoosingCards']);
	turnOnLabels(['playerChoosingTrumps']);
});

socket.on('circuit winners', function (winningTeam, points) {
	displayCircuitResult(winningTeam, points);
});

socket.on('new circuit', function () {
	resetCircuitPile();
});

socket.on('round winners', function (winningTeam) {
	// Display winner or looser team
	displayRoundResult(winningTeam);
});

socket.on('new round', function () {
	resetRound();
});

socket.on('abbort match', function (reason) {
	matchEndReason = reason;
	readyToEnd = true;
	abbortMatch();
});

socket.on('end match', function (winners, reason) {
	winningTeam = winners;
	matchEndReason = reason;
	readyToEnd = true;
	endMatch();
});

socket.on('no rematch', function () {
	if (labels['waiting'].visible || labels['rematch'].visible) {
		turnOffLabels(['waiting']);
		disableLabels(['rematch']);
	}
});

//////////  Functions  \\\\\\\\\\
function enterQueueTwo() {
	// // if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	socket.emit('enter queue two');
	turnOffLabels(['twoPlayers', 'fourPlayers', 'sixPlayers', 'logo']);
	turnOnLabels(['searching']);
}

function enterQueueFour() {
	// // if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	socket.emit('enter queue four');
	turnOffLabels(['twoPlayers', 'fourPlayers', 'sixPlayers', 'logo']);
	turnOnLabels(['searching']);
}

function enterQueueSix() {
	// // if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	socket.emit('enter queue six');
	turnOffLabels(['twoPlayers', 'fourPlayers', 'sixPlayers', 'logo']);
	turnOnLabels(['searching']);
}

function enterMatch(newTeam) {
	// // if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	team = newTeam;
	playerPoints = [];

	turnOffLabels(['searching']);
	turnOnLabels(['currentBet', 'betting']);
}

/**
 * Called when a change has been made by the server to the player's cards
 * @param cards	The new cards for the player
 */
function updateCards(cards) {
	// // if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	handSlots = undefined;
	handSlots = [cards.length];

	for (var i = 0; i < cards.length; i++) {
		cards[i].position = {
			x: handSlotsX,
			y: handSlotsY,
		};
		handSlots[i] = cards[i];
	}
	displayCardSlots = true;

	handleResize();
}

function turnOnBet() {
	turnOffLabels(['betting']);
	turnOnClickableLabels(['bet', 'pass', 'increaseBet', 'decreaseBet']);
	canBet = true;
	labels['bet'].text = `Bet ${currBet + betIncrease}`;

	if (betIncrease <= betIncrements) {
		disableLabels(['decreaseBet']);
		labels['decreaseBet'].background = false;
	}
}

function turnOffBet() {
	turnOnLabels(['betting']);
	turnOffLabels(['bet', 'pass', 'increaseBet', 'decreaseBet']);
	canBet = false;
	resetBetIncrease();
}

function handleBet() {
	if (canBet) {
		var newBet = currBet + betIncrease;
		labels['currentBet'].text = 'CURRENT BET: ' + newBet;
		socket.emit('bet', newBet);
		turnOffBet();
	}
}

function handleIncreaseBet() {
	if (canBet) {
		betIncrease += betIncrements;
		labels['bet'].text = `Bet ${currBet + betIncrease}`;
		if (betIncrease > betIncrements) {
			labels['decreaseBet'].background = 'red';
			enableLabels(['decreaseBet']);
		}
	}
}

function handleDecreaseBet() {
	if (canBet && betIncrease > betIncrements) {
		betIncrease -= betIncrements;
		labels['bet'].text = `Bet ${currBet + betIncrease}`;
		if (betIncrease <= betIncrements) {
			labels['decreaseBet'].background = false;
			disableLabels(['decreaseBet']);
		}
	}
}

function resetBetIncrease() {
	betIncrease = 5;
}

function handlePass() {
	if (canBet) {
		socket.emit('pass');
		turnOnLabels(['betting']);
		turnOffLabels(['bet', 'pass']);
	}
}

function endBet() {
	turnOffLabels([
		'betting',
		'bet',
		'pass',
		'currentBet',
		'decreaseBet',
		'increaseBet',
	]);
	canBet = false;
}

function updateChooseCards(cards, slot) {
	this.displaySlot = slot;
	chooseSlots = [cards.length];

	for (var i = 0; i < cards.length; i++) {
		cards[i].position = {
			x: chooseSlotsX,
			y: chooseSlotsY,
		};
		chooseSlots[i] = cards[i];
	}

	displayChooseSlots = true;
	handleResize();
}

function turnOnChooseSlots() {
	turnOnLabels(['chooseCards']);
	turnOnClickableLabels(['submitCards']);
	canChooseCards = true;
}

function turnOffChooseSlots() {
	turnOffLabels(['submitCards', 'chooseCards']);
	displayChooseSlots = false;
	canChooseCards = false;
	chooseSlots = undefined;
}

function turnOnTrumps() {
	turnOnLabels(['chooseTrumps']);
	turnOnClickableLabels(['Yellow', 'Green', 'Red', 'Black']);
}

function turnOnChooseTrumps() {
	// display new trumps value
	turnOnLabels(['chooseTrumps']);
	turnOnClickableLabels(['Yellow', 'Red', 'Black', 'Green']);
}

function chooseTrumps(newTrumps) {
	trumps = newTrumps;
	updateSubmitTrumps();
	turnOnClickableLabels(['submitTrumps']);
}

function submitChosenCards() {
	turnOffChooseSlots();
	socket.emit('update cards', handSlots);
}

function submitTrumps() {
	if (trumps != undefined) {
		socket.emit('set trumps', trumps);
		turnOffLabels([
			'chooseTrumps',
			'Yellow',
			'Red',
			'Green',
			'Black',
			'submitTrumps',
		]);
	}
}

function startRoundWithTrumps(newTrumps) {
	turnOffLabels(['playerChoosingTrumps']);
	trumps = newTrumps;
	updateTrumps();
	turnOnLabels(['trumps', 'waitingToPlay', 'submitSelectedCard']);
	turnOnLabels([
		'roundTeamPoints',
		'roundOpponentPoints',
		'totalTeamPoints',
		'totalOpponentPoints',
	]);
	disableLabels(['submitSelectedCard']);
}

function initializeCircuitPile(gameSize) {
	circuitPile = [];
	for (var i = 0; i < gameSize; i++) {
		circuitPile.push({
			number: undefined,
			color: undefined,
			position: {
				x: circuitPileX,
				y: circuitPileY,
			},
		});
	}
	console.log('initialized pile ', circuitPile);
	displayPile = true;
	handleResize();
}

function submitSelectedCard() {
	if (canPlayCard && selectedHandSlot) {
		socket.emit('play card', selectedHandSlot.card);
		disableLabels(['submitSelectedCard']);
		turnOffLabels(['yourTurn']);
		handSlots[selectedHandSlot.slotNum].number = undefined;
		handSlots[selectedHandSlot.slotNum].color = undefined;
		selectedHandSlot = undefined;
		console.log('turning off play');

		canPlayCard = false;
	}
}

function turnOnPlay() {
	console.log('turning on play');
	canPlayCard = true;
	turnOffLabels(['waitingToPlay']);
	turnOnLabels(['yourTurn', 'submitSelectedCard']);
	console.log(selectedHandSlot);
	if (selectedHandSlot) {
		enableLabels(['submitSelectedCard']);
	} else {
		disableLabels(['submitSelectedCard']);
	}
	handleResize();
}

function turnOffPlay() {
	console.log('turning off play');

	canPlayCard = false;
	displayPile = false;
	disableLabels(['submitSelectedCard']);
	turnOffLabels(['submitSelectedCard', 'yourTurn']);
}

function displayCircuitResult(winningTeam, points) {
	// if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	turnOffLabels(['yourTurn', 'waitingToPlay', 'trumps']);

	if (this.team.id === winningTeam.id) {
		labels['roundTeamPoints'].text = `TEAM ROUND POINTS: ${points}`;
		labels['circuitResult'].text = 'HAND WON';
		labels['circuitResult'].color1 = secondaryColor;
		labels['circuitResult'].color2 = toColor('Green');
	} else {
		labels['roundOpponentPoints'].text = `OPPONENT ROUND POINTS: ${points}`;
		labels['circuitResult'].text = 'HAND LOST';
		labels['circuitResult'].color1 = secondaryColor;
		labels['circuitResult'].color2 = toColor('Red');
	}
	turnOnLabels([
		'roundTeamPoints',
		'roundOpponentPoints',
		'circuitResult',
		'totalTeamPoints',
		'totalOpponentPoints',
	]);
}

function resetCircuitPile() {
	turnOffLabels(['circuitResult']);
	turnOnLabels(['waitingToPlay', 'trumps']);
	for (var i in circuitPile) {
		circuitPile[i].number = undefined;
		circuitPile[i].color = undefined;
	}
}

function displayRoundResult(winningTeam) {
	// if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	turnOffLabels(['yourTurn', 'waitingToPlay', 'circuitResult']);

	circuitPile = undefined;

	if (this.team.id === winningTeam.id) {
		labels[
			'totalTeamPoints'
		].text = `TEAM TOTAL POINTS: ${winningTeam.points}`;
		labels['roundResult'].text = 'ROUND WON';
		labels['roundResult'].color1 = secondaryColor;
		labels['roundResult'].color2 = toColor('Green');
	} else {
		labels[
			'totalOpponentPoints'
		].text = `OPPONENT TOTAL POINTS: ${winningTeam.points}`;
		labels['roundResult'].text = 'ROUND LOST';
		labels['roundResult'].color1 = secondaryColor;
		labels['roundResult'].color2 = toColor('Red');
	}
	turnOnLabels(['totalTeamPoints', 'totalOpponentPoints', 'roundResult']);
}

function resetRound() {
	turnOffPlay();
	labels['roundTeamPoints'].text = 'TEAM ROUND POINTS: 0';
	labels['roundOpponentPoints'].text = 'OPPONENT ROUND POINTS: 0';
	turnOffLabels([
		'totalTeamPoints',
		'totalOpponentPoints',
		'roundResult',
		'roundTeamPoints',
		'roundOpponentPoints',
	]);
	circuitPile = undefined;
	turnOnLabels(['currentBet', 'betting']);

	// for (var i in circuitPile) {
	// 	circuitPile[i].number = undefined;
	// 	circuitPile[i].color = undefined;
	// }
}

function prepareForEnd() {
	// if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	canBet = false;
	canPlayCard = false;
	displayCardSlots = false;
	displayChooseSlots = false;
	readyToEnd = false;

	trumps = undefined;
	opponentCards = undefined;
	playerCard = undefined;
	winningTeam = undefined;
	matchEndReason = undefined;

	var strLabs = [];
	for (var i in labels) {
		// // console.log('removee', i)
		strLabs.push(i);
	}
	turnOffLabels(strLabs);

	// resetDots(dottedLabels);

	if (handSlotsMulti)
		for (var i = 0; i < handSlots.length; i++) {
			handSlots[i] = undefined;
		}

	if (chooseSlots)
		for (var i = 0; i < chooseSlots.length; i++) {
			chooseSlots[i] = undefined;
		}

	if (circuitPile) circuitPile = undefined;
}

function abbortMatch() {
	// // console.log('abborting')
	prepareForEnd();

	disableLabels(['rematch']);
	labels['reason'].text = 'A PLAYER DISCONNECTED';
	turnOnLabels(['reason', 'rematch']);
	turnOnClickableLabels(['main menu']);
}

function endMatch() {
	prepareForEnd();

	labels['reason'].text = ['You Lose!', 'You Win!'][
		+(team.id === winningTeam.id)
	];
	turnOnLabels(['reason']);
	turnOnClickableLabels(['main menu', 'rematch']);

	if (matchEndReason === 'player left') {
		disableLabels(['rematch']);
	}
}

function exitMatch() {
	// if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	prepareForEnd();

	socket.emit('leave match');

	turnOnClickableLabels(['twoPlayers', 'fourPlayers', 'sixPlayers']);
	turnOnLabels(['logo']);
}

function requestRematch() {
	// if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	socket.emit('request rematch');
	turnOffLabels(['rematch']);
	turnOnLabels(['waiting']);
}

function animateLabels() {
	for (var i = 0; i < dottedLabels.length; i++) {
		if (dottedLabels[i].visible) {
			updateDots(dottedLabels[i]);
		}
	}
}

function updateDots(label) {
	var dots = label.text.split('.').length - 1;
	var newDots = (dots + 1) % 4;
	label.text =
		label.text.slice(0, -3) +
		Array(newDots + 1).join('.') +
		Array(3 - newDots + 1).join(' ');
}

function resetDots(label) {
	label.text = label.text.slice(0, -3) + '...';
}
