// This file manages the games client's logic. It's here that Socket.io connections are handled
// and functions from canvas.js are used to manage the game's visual appearance.

var socket = io();
var canPlayCard = false;
var canBet = false;
var canChooseCards = false;
var logFull = false;
var playerPoints = [],
	opponentPoints = [];
var opponentCard, playerCard, winningTeam, matchEndReason, readyToEnd;
var currentBet = 0;
var betIncrements = 5;

//////////  Socket Events  \\\\\\\\\\
socket.on("update cards", function(cards) {
	updateCards(cards);
});

socket.on("enter match", function(team, cards) {
	enterMatch(team);
});

socket.on("update choose cards", function(cards) {
	updateChooseCards(cards);
});

socket.on("turn play on", function() {
	turnOnPlay();
});

socket.on("turn on bet", function() {
	turnOnBet();
});

socket.on("turn off bet", function() {
	labels["currentBet"].visible = false;
	labels["betting"].visible = false;
	turnOffBet();
});

socket.on("update current bet", function(newBet, bettingTeamId) {
	updateCurrentBet(newBet, bettingTeamId);
})

socket.on("choose cards", function() {
	// labels["chooseCards"].visible = true;
	// canChooseCards = true;
	socket.emit("update cards", handSlots);
})

socket.on("choose trumps", function() {
	labels["chooseTrumps"].visible = true;
	labels["red"].visible = true;
	labels["green"].visible = true;
	labels["blue"].visible = true;
	labels["black"].visible = true;

	labels["red"].clickable = true;
	labels["green"].clickable = true;
	labels["blue"].clickable = true;
	labels["black"].clickable = true;
})

socket.on("set trumps", function(newTrumps) {
	// display new trumps value
	labels["trumps"].text = 'Trumps: ' + newTrumps;
	labels["trumps"].color2 = toColor(newTrumps);
	labels["trumps"].visible = true;
})

socket.on("waiting on bet winner to choose cards", function() {
	console.log('in here waiting')
	labels["playerChoosingCards"].visible = true;
})

socket.on("waiting on bet winner to choose trumps", function() {
	labels["playerChoosingTrumps"].visible = true;
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

socket.on("quit match", function(reason) {
	matchEndReason = reason;
	readyToEnd = true;
	quitMatch();	
});


socket.on("end match", function(winners, reason) {
	winningTeam = winners;
	matchEndReason = reason;
	readyToEnd = true;
	endMatch();	
});

socket.on("no rematch", function() {
	if (labels["waiting"].visiblen || labels["rematch"].visible) {
		labels["waiting"].visible = false;
		labels["rematch"].disabled = true;
		labels["rematch"].clickable = false;
		labels["rematch"].visible = true;
	}
});

//////////  Functions  \\\\\\\\\\
function enterQueue() {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	socket.emit("enter queue");
	labels["play"].visible = false;
	labels["play"].clickable = false;
	labels["searching"].visible = true;
}

function enterMatch(newTeam) {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	team = newTeam;
	playerPoints = [];
	opponentPoints = [];
	labels["result"].visible = false;
	labels["main menu"].visible = false;
	labels["main menu"].clickable = false;
	labels["rematch"].visible = false;
	labels["rematch"].clickable = false;
	labels["rematch"].disabled = false;
	labels["waiting"].visible = false;
	labels["currentBet"].visible = true;
	labels["betting"].visible = true;
	labels["logo"].visible = false;
	labels["searching"].visible = false;
}

function updateCards(cards) {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	for (var i = 0; i < cards.length; i++) {
		handSlots[i].card = cards[i];
	}
	displayCardSlots = true;

}
function updateChooseCards(cards) {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	for (var i = 0; i < cards.length; i++) {
		chooseSlots[i].card = cards[i];
	}

	displayChooseSlots = true;

	handleResize();
}

function updateCurrentBet(newBet, bettingTeamId) {
	currentBet = newBet;
	labels["currentBet"].text = "Current Bet: " + currentBet;
	labels["currentBet"].color1 = "#0f0f0f";

	if (team.id === bettingTeamId) {
		labels["currentBet"].color2 = "#52a546";
	}
	else {
		labels["currentBet"].color2 = "#e02929";
	}
}

function turnOnPlay(){
	canPlayCard = true;
}

function turnOnBet(){
	labels["betting"].visible = false;
	labels["currentBet"].visible = true;
	labels["bet"].visible = true;
	labels["bet"].clickable = true;
	labels["pass"].visible = true;
	labels["pass"].clickable = true;
	canBet = true;
}

function turnOffBet() {
	labels["pass"].visible = false;
	labels["pass"].clickable = false;
	labels["bet"].visible = false;
	labels["bet"].clickable = false;
	canBet = false;
}

function doneChoosingCards() {
	canChooseCards = false;
	socket.emit('choose cards', handSlots)
}

function turnOffPlay(){
	canPlayCard = false;
}

function handleBet() {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	if (canBet) {
		var newBet = currentBet + betIncrements;
		labels["currentBet"].text = 'Current Bet: ' + newBet;
		socket.emit("bet", newBet);
		labels["betting"].visible = true;
		turnOffBet();
	}
}

function handlePass() {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	if (canBet) {
		socket.emit("pass");
		labels["betting"].visible = true;
		turnOffBet();
	}
}

function playCard(index) {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	if (canPlayCard) {
		socket.emit("play card", index);
		turnOffPlay();
	}
}

function unknownCardPlayed() {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	opponentCard = {isUnknown: true};
}

function displayCircuitResult(team) {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	if (this.team.id === winningTeam.id) {
		// Add winning label here
	} else {
		// Add loosing label here
	}
}


function displayRoundResult(winningTeam) {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());

	if (this.team.id === winningTeam.id) {
		// Add winning label here
	} else {
		// Add loosing label here
	}
}

function prepareForEnd(){
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	displayChooseSlots = false;
	handleResize();
	canPlayCard = false;
	readyToEnd = false;
	opponentCard = undefined;
	playerCard = undefined;
	displayCardSlots = false;
	labels["betting"].visible = false;
	labels["currentBet"].visible = false;
	turnOffBet();

	for (var i = 0; i < handSlots.length; i++) {
		handSlots[i].card = undefined;
	}

	for (var i = 0; i < chooseSlots.length; i++) {
		chooseSlots[i].card = undefined;
	}
}

function quitMatch() {
	prepareForEnd();

	labels["rematch"].disabled = true;
	labels["rematch"].clickable = false;
	labels["result"].text = "A Player Disconnected";
	labels["result"].size = 90;
	labels["result"].visible = true;
	labels["rematch"].visible = true;
	labels["main menu"].visible = true;
	labels["main menu"].clickable = true;
	winningTeam = undefined;
	matchEndReason = undefined;
}

function endMatch() {
	prepareForEnd();

	if (matchEndReason === "player left") {
		var reason = ["Your opponent", "You"][+(team.id !== winningTeam.id)] + " left the match";
		labels["rematch"].disabled = true;
		labels["rematch"].clickable = false;
	} else {
		var reason = ["Your opponent has", "You have"][+(team.id === winningTeam.id)] + " a full set";
		labels["rematch"].clickable = true;
	}

	labels["result"].text = ["You Lose!", "You Win!"][+(team.id === winningTeam.id)];
	labels["result"].visible = true;
	labels["rematch"].visible = true;
	labels["main menu"].visible = true;
	labels["main menu"].clickable = true;
	winningTeam = undefined;
	matchEndReason = undefined;
}

function exitMatch() {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	playerPoints = [];
	opponentPoints = [];
	socket.emit("leave match");
	labels["result"].visible = false;
	labels["main menu"].visible = false;
	labels["main menu"].clickable = false;
	labels["rematch"].visible = false;
	labels["rematch"].clickable = false;
	labels["rematch"].disabled = false;
	labels["waiting"].visible = false;
	resetDots(labels["waiting"]);
	labels["play"].visible = true;
	labels["play"].clickable = true;
	labels["logo"].visible = true;
}

function requestRematch() {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	socket.emit("request rematch");
	labels["rematch"].visible = false;
	labels["rematch"].clickable = false;
	labels["waiting"].visible = true;
}

function animateLabels() {
	var dotLabels = [labels["waiting"], labels["searching"], labels["betting"], labels["chooseCards"], labels["chooseTrumps"], labels["playerChoosingCards"], labels["playerChoosingTrumps"]];
	for (var i = 0; i < dotLabels.length; i++) {
		if (dotLabels[i].visible) {
			updateDots(dotLabels[i]);
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