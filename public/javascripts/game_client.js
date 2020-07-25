// This file manages the games client's logic. It's here that Socket.io connections are handled
// and functions from canvas.js are used to manage the game's visual appearance.

// Ignore
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
var betIncrements = 5;


//////////  Socket Events  \\\\\\\\\\
socket.on("update cards", function(cards) {
	updateCards(cards);
});

socket.on("enter match", function(team) {
	enterMatch(team);
});

socket.on("update choose cards", function(cards, slot) {
	updateChooseCards(cards, slot);
});

socket.on("update current bet", function(newBet, bettingTeamId) {
	updateCurrentBet(newBet, bettingTeamId);
})

socket.on("turn on bet", function() {
	turnOnBet();
});

socket.on("end betting", function() {
	endBet()
});

socket.on("turn on choose cards", function() {
	turnOnChooseSlots();
})

socket.on("turn on choose trumps", function() {
	turnOnChooseTrumps()
})

socket.on("start round with trumps", function(newTrumps) {
	startRoundWithTrumps(newTrumps)
})

socket.on("turn play on", function() {
	turnOnPlay();
});

socket.on("waiting on bet winner to choose cards", function() {
	turnOnLabels(["playerChoosingCards"])
})

socket.on("waiting on bet winner to choose trumps", function() {
	turnOffChooseSlots();
	turnOffLabels(["playerChoosingCards"])
	turnOnLabels(["playerChoosingTrumps"])
})

socket.on("unknown card played", function() {
	unknownCardPlayed();
});

socket.on("circuit winners", function(winningTeam) {
	displayCircuitResult(winningTeam);
});

socket.on("round winners", function(winningTeam) {
	// Display winner or looser team
	displayRoundResult(winningTeam);
})

socket.on("abbort match", function(reason) {
	matchEndReason = reason;
	readyToEnd = true;
	abbortMatch();	
});

socket.on("end match", function(winners, reason) {
	winningTeam = winners;
	matchEndReason = reason;
	readyToEnd = true;
	endMatch();	
});

socket.on("no rematch", function() {
	if (labels["waiting"].visible || labels["rematch"].visible) {
		turnOffLabels(["waiting"])
		disableLabels(["rematch"])
	}
});

//////////  Functions  \\\\\\\\\\
function enterQueue() {
	// // if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	socket.emit("enter queue");
	turnOffLabels(["play"])
	turnOnLabels(["searching"])
}

function enterMatch(newTeam) {
	// // if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	team = newTeam;
	playerPoints = [];

	turnOffLabels(["searching", "logo"]);
	turnOnLabels(["currentBet", "betting"])
}

function updateCards(cards) {
	// // if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	handSlots = [cards.length];

	for (var i = 0; i < cards.length; i++) {
		cards[i].position = {
			x: handSlotsX,
			y: handSlotsY
		}
		handSlots[i] = cards[i];
	}
	displayCardSlots = true;

	handleResize();
}

function turnOnBet(){
	turnOffLabels(["betting"]);
	turnOnClickableLabels(["bet", "pass"])
	canBet = true;
}

function turnOffBet(){
	turnOnLabels(['betting'])
	turnOffLabels(["bet", "pass"])
	canBet = false;
}

function endBet() {
	// // console.log('\n\nending betting')
	turnOffLabels(['betting', 'bet', 'pass', 'currentBet'])
	canBet = false;
}

function handleBet() {
	 //  // // // if (logFull) // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	if (canBet) {
		var newBet = currBet + betIncrements;
		labels["currentBet"].text = 'Current Bet: ' + newBet;
		
		socket.emit("bet", newBet);
		turnOffBet()
	}
}

function handlePass() {
	//  // // // if (logFull) // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
   
   if (canBet) {
	   socket.emit("pass");
	   turnOnLabels(['betting'])
	   turnOffLabels(['bet', 'pass'])
   }
}

function updateChooseCards(cards, slot) {
	// // if (logFull) // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	this.displaySlot = slot

	console.log(displaySlot)

	chooseSlots = [cards.length];

	for (var i = 0; i < cards.length; i++) {
		cards[i].position = {
			x: chooseSlotsX,
			y: chooseSlotsY
		}
		chooseSlots[i] = cards[i];
	}

	displayChooseSlots = true;

	handleResize();
}

function turnOnChooseSlots(){
	turnOnLabels(['chooseCards'])
	turnOnClickableLabels(['submitCards'])
	canChooseCards = true;
}

function turnOffChooseSlots() {
	turnOffLabels(["submitCards", "chooseCards"])
	displayChooseSlots = false;
	canChooseCards = false;
	chooseSlots = undefined;
}

function turnOnTrumps() {
	turnOnLabels(['chooseTrumps'])
	turnOnClickableLabels(['Yellow', 'Green', 'Blue', 'Black'])
}

function turnOnChooseTrumps() {
	// display new trumps value
	turnOnLabels(['chooseTrumps'])
	turnOnClickableLabels(['Yellow', 'Blue', 'Black', 'Green'])
}

function chooseTrumps(newTrumps){
	trumps = newTrumps
	updateSubmitTrumps()
	turnOnClickableLabels(['submitTrumps'])
}

function submitChosenCards() {
	turnOffChooseSlots();
	socket.emit('update cards', handSlots)
}

function submitTrumps() {
	if (trumps != undefined) {
		socket.emit('set trumps', trumps)
		turnOffLabels(['chooseTrumps', 'Yellow', 'Blue', 'Green', 'Black', 'submitTrumps'])
	}
}

function startRoundWithTrumps(newTrumps){
	turnOffLabels(['playerChoosingTrumps', 'submitSelectedCard'])
	trumps = newTrumps
	updateTrumps()
	turnOnLabels(['trumps', 'waitingToPlay'])
	disableLabels(['submitSelectedCard'])
}

function submitSelectedCard() {
	if (canPlayCard && selectedHandSlot) {
		socket.emit('play card', selectedHandSlot)
		disableLabels(['submitSelectedCard'])
		handSlots[selectedHandSlot.slotNum].number = undefined;
		handSlots[selectedHandSlot.slotNum].color = undefined;
		selectedHandSlot= undefined;
	}
}

function turnOnPlay(){
	canPlayCard = true;
	turnOffLabels(['waitingToPlay'])
	turnOnLabels(['yourTurn', 'submitSelectedCard'])
	disableLabels(['submitSelectedCard'])
}

function turnOffPlay(){
	canPlayCard = false;
	disableLabels(['submitSelectedCard'])
	turnOffLabels(['submitSelectedCard'])
}

function playCard(index) {
	// // if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	if (canPlayCard) {
		socket.emit("play card", index);
		turnOffPlay();
	}
}

function unknownCardPlayed() {
	// if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	opponentCard = {isUnknown: true};
}

function displayCircuitResult(team) {
	// if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	if (this.team.id === winningTeam.id) {
		// Add winning label here
	} else {
		// Add loosing label here
	}
}


function displayRoundResult(winningTeam) {
	// if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	if (this.team.id === winningTeam.id) {
		// Add winning label here
	} else {
		// Add loosing label here
	}
}

function prepareForEnd(){
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

	
	var strLabs = []
	for (var i in labels) {
		// // console.log('removee', i)
		strLabs.push(i)
	}
	turnOffLabels(strLabs)

	// resetDots(dottedLabels);

	if (handSlotsMulti)
	for (var i = 0; i < handSlots.length; i++) {
		handSlots[i] = undefined;
	}

	if (chooseSlots)
	for (var i = 0; i < chooseSlots.length; i++) {
		chooseSlots[i] = undefined;
	}
}

function abbortMatch() {
	// // console.log('abborting')
	prepareForEnd();

	disableLabels(["rematch"])
	labels["reason"].text = "A Player Disconnected";
	labels["reason"].size = 90;
	turnOnLabels(["reason", "rematch"])
	turnOnClickableLabels(["main menu"])
}

function endMatch() {


	prepareForEnd();

	labels["reason"].text = ["You Lose!", "You Win!"][+(team.id === winningTeam.id)];
	turnOnLabels(["reason"])
	turnOnClickableLabels(["main menu", "rematch"])
	
	if (matchEndReason === "player left") {
		disableLabels(["rematch"])
	}
}

function exitMatch() {
	// if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	prepareForEnd();

	socket.emit("leave match");

	turnOnClickableLabels(["play"])
	turnOnLabels(["logo"])
}

function requestRematch() {
	// if (logFull) // // console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	socket.emit("request rematch");
	turnOffLabels(["rematch"])
	turnOnLabels(["waiting"])
}

function animateLabels() {
	for (var i = 0; i < dottedLabels.length; i++) {
		if (dottedLabels[i].visible) {
			updateDots(dottedLabels[i]);
		}
	}
}

function updateDots(label) {
	var dots = label.text.split(".").length - 1;
	var newDots = ((dots + 1) % 4);
	label.text = label.text.slice(0, -3) + Array(newDots + 1).join(".") + Array(3 - newDots + 1).join(" ");
}

function resetDots(label) {
	label.text = label.text.slice(0, -3) + "...";
}