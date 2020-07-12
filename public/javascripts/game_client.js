// This file manages the games client's logic. It's here that Socket.io connections are handled
// and functions from canvas.js are used to manage the game's visual appearance.

var socket = io();
var canPlayCard = false;
var canBet = false;
var logFull = false;
var playerPoints = [],
	opponentPoints = [];
var opponentCard, playerCard, winningTeam, matchEndReason, readyToEnd; // timerInterval;
var currentBet = 0;
var betIncrements = 5;

// Set the countdown timer
// const turnTimer = 60;

//////////  Socket Events  \\\\\\\\\\
socket.on("enter match", function(team) {
	enterMatch(team);
});

socket.on("update cards", function(cards) {
	updateCards(cards);
});

socket.on("turn play on", function() {
	turnOnPlay();
});

socket.on("turn on bet", function() {
	turnOnBet();
});

socket.on("turn off bet", function() {
	console.log('in turn off bet emitter');
	labels["currentBet"].visible = false;
	labels["betting"].visible = false;
	turnOffBet();
});

socket.on("update current bet", function(newBet) {
	currentBet = newBet;
	labels["currentBet"].text = "Current Bet: " + currentBet;
})

socket.on("choose cards", function(cards) {
	chooseCards(cards);
})

socket.on("choose trumps", function() {
	chooseTrumps();
})

socket.on("unknown card played", function() {
	unknownCardPlayed();
});

socket.on("fight result", function(result) {
	displayResult(result);
});

socket.on("quit match", function(reason) {
	console.log('end of match');
	matchEndReason = reason;
	readyToEnd = true;
	quitMatch();	
});


socket.on("end match", function(winners, reason) {
	console.log('end of match');
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
	console.log('joining team  ', team);
	playerPoints = [];
	opponentPoints = [];
	labels["result"].visible = false;
	labels["main menu"].visible = false;
	labels["main menu"].clickable = false;
	labels["rematch"].visible = false;
	labels["rematch"].clickable = false;
	labels["rematch"].disabled = false;
	labels["waiting"].visible = false;
	// labels["timer"].text = turnTimer;
	// labels["timer"].visible = true;
	// timerInterval = setInternval(updateTimer, 1000);
	// labels["timer"].visible = false;


	labels["currentBet"].visible = true;
	labels["betting"].visible = true;


	resetDots(labels["waiting"]);
	labels["searching"].visible = false;
	resetDots(labels["searching"]);
	labels["logo"].visible = false;
	displayCardSlots = true;
}

function updateCards(cards) {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	for (var i = 0; i < cards.length; i++) {
		handSlots[i].card = cards[i];
	}
}

function turnOnPlay(){
	// labels["timer"].text = turnTimer;
	// labels["timer"].visible = true;
	// timerInterval = setInterval(updateTimer, 1000);
	canPlayCard = true;
}

function turnOnBet(){
	labels["betting"].visible = false;

	labels["currentBet"].visible = true;
	labels["bet"].visible = true;
	labels["pass"].visible = true;
	canBet = true;
}

function turnOffBet() {
	labels["pass"].visible = false;
	labels["bet"].visible = false;
	canBet = false;
}

function turnOffPlay(){
	// labels["timer"].visible = false;
	canPlayCard = false;
}

function handleBet() {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	if (canBet) {
		console.log('betting');
		var newBet = currentBet + betIncrements;
		labels["currentBet"].text = 'Current Bet: ' + newBet;
		console.log(' new bet ' , newBet);
		socket.emit("bet", newBet);
		labels["betting"].visible = true;
		turnOffBet();
	}
}

function handlePass() {
	console.log('passing');
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

function displayResult(result) {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	var player = undefined;
	var opponent = undefined;
	if (result.winner.socketId === socket.id) {
		player = result.winner;
		opponent = result.loser;
	} else {
		player = result.loser;
		opponent = result.winner;
	}
	playerPoints = player.points;
	opponentPoints = opponent.points;
	opponentCard = opponent.card;
	// clearInterval(timerInterval);
	setTimeout(function() {
		if (readyToEnd) {
			endMatch();
		} else {
			canPlayCard = true;
			opponentCard = undefined;
			playerCard = undefined;
			// labels["timer"].text = turnTimer;
			// timerInterval = setInterval(updateTimer, 1000);
			canPlayCard = true;
			socket.emit("request cards update");
		}
	}, (2 * 1000));
}

function quitMatch() {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
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

	labels["rematch"].disabled = true;
	labels["rematch"].clickable = false;

	labels["result"].text = "A Player Disconnected";
	labels["result"].size = 100;
	labels["result"].visible = true;
	labels["rematch"].visible = true;
	labels["main menu"].visible = true;
	labels["main menu"].clickable = true;
	// labels["timer"].visible = false;
	// labels["timer"].text = turnTimer;
	// clearInterval(timerInterval);
	winningTeam = undefined;
	matchEndReason = undefined;
}

function endMatch() {
	if (logFull) console.log("%s(%s)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	console.log('winning team is ', winningTeam);
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
	// labels["timer"].visible = false;
	// labels["timer"].text = turnTimer;
	// clearInterval(timerInterval);
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
	var dotLabels = [labels["waiting"], labels["searching"], labels["betting"]];
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

// function updateTimer() {
// 	labels["timer"].text -= 1;
// 	if (labels["timer"].text === 0) {
// 		canPlayCard = false;
// 		clearInterval(timerInterval);
// 		playCard(0);
// 		turnOffPlay();
// 	}
// }
