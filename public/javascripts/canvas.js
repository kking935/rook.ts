// This file manages the game's logic for most visual things and contains various functions
// for drawing on and manipulating the canvas, used by the game client.

var handSize = 10;
var potSize = 5;

//////////  Constructors  \\\\\\\\\\
function Label(position, text, size, visible, clickable, disabled, font, callback) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	// x and y are integers betweem 0 and 1. Use as percentages.
	this.position = position;
	this.text = text;
	this.size = size;
	this.visible = visible;
	this.clickable = clickable;
	this.disabled = disabled;
	this.down = false;
	this.font = font;
	this.callback = callback;
	this.color1 = "#9a9a9a"
	this.color2 = "#000000";
}

//////////  Canvas  \\\\\\\\\\
function init() {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	canvas = document.getElementById("game-canvas");
	ctx = canvas.getContext("2d");
	handleResize();
	handSlots = [];
	chooseSlots = [];
	team = undefined;

	for (var i = 0; i < handSize; i++) {
		handSlots.push({
			position: {
				x: canvas.width * 0.05 + canvas.width / handSize * i - cardWidth / 2,
				y: canvas.height - cardHeight * 1.1
			},
			card: undefined
		});
	}

	for (var x = 0; x < potSize; x++) {
		chooseSlots.push({
			position: {
				x: canvas.width * 0.05 + canvas.width / handSize * i - cardWidth / 2,
				y: canvas.height - cardHeight * 1.1
			},
			card: undefined
		})
	}

	labels["logo"] = new Label({x: 0.5, y: 0.3}, "ROOK", 192, true, false, false, primaryFont);
	labels["play"] = new Label({x: 0.5, y: 0.7}, "Play!", 144, true, true, false, secondaryFont, enterQueue);
	labels["searching"] = new Label({x: 0.5, y: 0.7}, "Searching   ", 144, false, false, false, secondaryFont);
	labels["result"] = new Label({x: 0.5, y: 0.3}, "", 192, false, false, false, secondaryFont);
	labels["rematch"] = new Label({x: 0.5, y: 0.62}, "Rematch", 128, false, false, false, secondaryFont, requestRematch);
	labels["waiting"] = new Label({x: 0.5, y: 0.62}, "Waiting   ", 128, false, false, false, secondaryFont);
	labels["main menu"] = new Label({x: 0.5, y: 0.78}, "Main Menu", 128, false, false, false, secondaryFont, exitMatch);
	labels["currentBet"] = new Label({x: 0.5, y: 0.1}, "Current Bet: 0", 128, false, false, false, secondaryFont);
	labels["bet"] = new Label({x: 0.25, y: 0.3}, "Bet", 98, false, true, false, secondaryFont, handleBet);
	labels["pass"] = new Label({x: 0.75, y: 0.3}, "Pass", 98, false, true, false, secondaryFont, handlePass);
	labels["betting"] = new Label({x: 0.5, y: 0.4}, "Waiting for other players to bet   ", 65, false, false, false, secondaryFont);
	labels["chooseCards"] = new Label({x: 0.5, y: 0.1}, "Choose which cards to discard   ", 65, false, false, false, secondaryFont);
	labels["playerChoosingCards"] = new Label({x: 0.5, y: 0.1}, "Bet winner is choosing their cards   ", 55, false, false, false, secondaryFont);
	labels["playerChoosingTrumps"] = new Label({x: 0.5, y: 0.1}, "Bet winner is choosing trumps   ", 55, false, false, false, secondaryFont);
}

function animate() {
	requestAnimFrame(animate);
	draw();
}

function toColor(colorStr) {
	var color = undefined;
	switch (colorStr) {
		case "yellow":
			color = "#CCCC00";
			break;
		case "green":
			color = "#52a546";
			break;
		case "blue":
			color = "#246acd";
			break;
		case "black":
			color = "#000000";
			break;
		case "ROOK":
			color = "#e02929"
			break;
	}

	return color;
}

//////////  Events  \\\\\\\\\\
function handleMouseMove(event) {
	for (var i = 0; i < handSlots.length; i++) {
		if (isOnSlot(event, handSlots[i])) {
			if (!clickCursor) {
				$("#game-canvas").css("cursor", "pointer");
				clickCursor = true;
			}
			return;
		}
	}

	for (var i = 0; i < chooseSlots.length; i++) {
		if (isOnSlot(event, chooseSlots[i])) {
			if (!clickCursor) {
				$("#game-canvas").css("cursor", "pointer");
				clickCursor = true;
			}
			return;
		}
	}

	for (i in labels) {
		if (isOnLabel(event, labels[i])) {
			if (!clickCursor) {
				$("#game-canvas").css("cursor", "pointer");
				clickCursor = true;
			}
			return;
		} else {
			labels[i].down = false;
		}
	}

	$("#game-canvas").css("cursor","auto");
	clickCursor = false;
}

function handleMouseDown(event) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	for (i in labels) {
		if (isOnLabel(event, labels[i]) && labels[i].clickable && !labels[i].disabled) {
			labels[i].down = true;
			return;
		}
	}
}

function handleMouseUp(event) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	for (i in labels) {
		if (labels[i].down) {
			labels[i].down = false;
			if (labels[i].callback && labels[i].clickable) {
				labels[i].callback();
			}
		}
	}

	for (var i = 0; i < handSlots.length; i++) {
		if (isOnSlot(event, handSlots[i]) && canPlayCard) {
			playCard(i);
			playerCard = handSlots[i].card;
			handSlots[i].card = undefined;
			return;
		}
	}

	for (var i = 0; i < chooseSlots.length; i++) {
		if (isOnSlot(event, chooseSlots[i]) && canChooseCard) {
			var temp = playerCard;
			playerCard = chooseSlots[i].card;
			chooseSlots[i].card = temp;
			return;
		}
	}
	handleMouseMove(event);
}

function isOnSlot(event, slot) {
	var x = (event.pageX - canvas.offsetLeft),
		y = (event.pageY - canvas.offsetTop);
	if (slot.card && canPlayCard) {
		if (x > slot.position.x && x < slot.position.x + cardWidth &&
			y > slot.position.y && y < slot.position.y + cardHeight) {
			return true;
		}
	}
	return false;
}

function isOnLabel(event, label) {
	var x = (event.pageX - canvas.offsetLeft),
		y = (event.pageY - canvas.offsetTop);
	if (label.clickable) {
		var labelWidth = label.text.length * label.size * r * 0.4;
		var labelHeight = label.size * r;
		var leftBoundary = label.position.x * canvas.width - labelWidth / 2;
		var rightBoundary = label.position.x * canvas.width + labelWidth / 2;
		var upperBoundary = label.position.y * canvas.height - labelHeight / 2;
		var lowerBoundary = label.position.y * canvas.height + labelHeight / 2;

		if (x > leftBoundary && x < rightBoundary &&
			y > upperBoundary && y < lowerBoundary) {
			return true;
		}
	}
	return false;
}

function handleResize() {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	if (window.innerWidth < window.innerHeight * aspect) {
		canvas.width = window.innerWidth * 0.9;
		canvas.height = window.innerWidth * 0.9 / aspect;
		r = canvas.width / 1000;
	} else {
		canvas.width = window.innerHeight * 0.9 * aspect;
		canvas.height = window.innerHeight * 0.9;
		r = canvas.height * aspect / 1000;
	}
	cardWidth = 90 * r;
	cardHeight = cardWidth * 1.5;
	if (handSlots) {
		for (var i = 0; i < handSize; i++) {
			handSlots[i].position = {
				x: canvas.width * 0.05 + canvas.width / handSize * i - cardWidth / 2,
				y: canvas.height - cardHeight * 1.1
			};
		}
	}

	if (chooseSlots) {
		console.log('resizing chooseSLots');
		for (var i = 0; i < potSize; i++) {
			chooseSlots[i].position = {
				x: canvas.width * 0.3 + canvas.width / handSize * i - cardWidth / 2,
				y: canvas.height - cardHeight * 1.1 * 3
			};
		}
	}

	playerCardPosition = {x: canvas.width * 0.17, y: canvas.height * 0.15};
	opponentCardPosition = {x: canvas.width * 0.83 - cardWidth * 1.5, y: canvas.height * 0.15};
}

//////////  Drawing  \\\\\\\\\\
function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < handSlots.length; i++) {
		if (displayCardSlots) {
			if (handSlots[i].card) {
				drawCard(handSlots[i].card, handSlots[i].position, 1);
			} else {
				drawEmptySlot(handSlots[i]);
			}
		}
	}

	for (var x = 0; x < chooseSlots.length; x++) {
		if (displayChooseSlots) {
			if (chooseSlots[x].card) {
				drawCard(chooseSlots[x].card, chooseSlots[x].position, 1)
			}
			else {
				drawEmptySlot(chooseSlots[i]);
			}
		}
	}

	drawPoints();
	if (playerCard) {
		drawCard(playerCard, playerCardPosition, 1.5);
	}

	if (opponentCard) {
		drawCard(opponentCard, opponentCardPosition, 1.5);
	}
	for (i in labels) {
		if (labels[i].visible) {
			drawLabel(labels[i]);
		}
	}
}


function drawCard(card, position, scale) {
	if (!scale) {
		scale = 1;
	}

	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillStyle = toColor(card.color);
	ctx.fillRect(position.x, position.y, cardWidth * scale, cardHeight * scale);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 2 * scale * r;
	ctx.strokeRect(position.x, position.y, cardWidth * scale, cardHeight * scale);
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(position.x + cardWidth * scale * 0.1, position.y + cardHeight * scale * 0.067, cardWidth * scale * 0.8, cardHeight * scale * 0.866);

	ctx.fillStyle = toColor(card.color);
	ctx.font = "bold " + (50 * scale * r) + "px Arial";
	ctx.fillText(card.number, position.x + cardWidth * scale / 2, position.y + cardHeight * scale * 0.4);
	ctx.font = (20 * scale * r) + "px Arial";
	ctx.fillText(card.color, position.x + cardWidth * scale / 2, position.y + cardHeight * scale * 0.7);	
}

function drawPointCard(card, position, scale) {
	if (!scale) {
		scale = 1;
	}

	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillStyle = toColor(card.color);
	ctx.fillRect(position.x, position.y, cardWidth * scale, cardWidth * scale);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 4 * scale * r;
	ctx.strokeRect(position.x, position.y, cardWidth * scale, cardWidth * scale);
	ctx.fillStyle = toColor(card.color);
	ctx.font = "bold " + (72 * scale * r) + "px Arial";
	ctx.fillText(card.number, position.x + cardWidth * scale / 2, position.y + cardWidth * scale * 0.5);
	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 3 * r * scale;
	ctx.strokeText(card.color, position.x + cardWidth * scale / 2, position.y + cardWidth * scale * 0.5);
}

function drawUnknownCard(position, scale) {
	if (!scale) {
		scale = 1;
	}
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillStyle = "#6f6f6f";
	ctx.fillRect(position.x, position.y, cardWidth * scale, cardHeight * scale);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 2 * scale * r;
	ctx.strokeRect(position.x, position.y, cardWidth * scale, cardHeight * scale);
	ctx.fillStyle = "#a0a0a0";
	ctx.fillRect(position.x + cardWidth * scale * 0.1, position.y + cardHeight * scale * 0.067, cardWidth * scale * 0.8, cardHeight * scale * 0.866);
	ctx.fillStyle = "#d1d1d1";
	ctx.font = "bold " + (72 * r * scale) + "px " + secondaryFont;
	ctx.fillText("?", position.x + cardWidth * scale / 2, position.y + cardHeight * 0.5 * scale);
}

function drawEmptySlot(slot) {
	ctx.fillStyle = "#a0a0a0";
	ctx.fillRect(slot.position.x, slot.position.y, cardWidth, cardHeight);
	ctx.strokeStyle = "#000000";
	ctx.strokeRect(slot.position.x, slot.position.y, cardWidth, cardHeight);
}

function drawPoints() {

	for (var i = 0; i < playerPoints.length; i++) {
		for (var j = playerPoints[i].length - 1; j >= 0; j--) {
			drawPointCard(playerPoints[i][j], {x: cardWidth * 0.55 * i + 10 * r, y: cardHeight * 0.5 * j * 0.2 + 10 * r}, 0.5);
		}
	}

	for (var i = 0; i < opponentPoints.length; i++) {
		for (var j = opponentPoints[i].length - 1; j >= 0; j--) {
			drawPointCard(opponentPoints[i][j], {x: canvas.width - cardWidth * 0.55 * (3-i) - 5 * r, y: cardHeight * 0.5 * j * 0.2 + 10 * r}, 0.5);
		}
	}
}

function drawLabel(label) {
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.font = (label.size * r) + "px " + label.font;
	var shadowDistance = label.size / 30;
	if (!label.disabled) {
		ctx.fillStyle = label.color1;
		ctx.fillText(label.text, canvas.width * label.position.x + (shadowDistance * r), canvas.height * label.position.y + (shadowDistance * r));
		ctx.fillStyle = label.color2;
	} else {
		ctx.fillStyle = "#9a9a9a";
	}
	if (label.down) {
		ctx.fillText(label.text, canvas.width * label.position.x + (shadowDistance * 0.5 * r), canvas.height * label.position.y + (shadowDistance * 0.5 * r));
	} else {
		ctx.fillText(label.text, canvas.width * label.position.x, canvas.height * label.position.y);
	}
}

function chooseTrumps() {
	// TODO: Implement this
}
//////////  Initialize  \\\\\\\\\\
window.requestAnimFrame = (function () {
	return window.requestAnimationFrame ||
		   window.webkitRequestAnimationFrame ||
		   window.mozRequestAnimationFrame ||
		   window.oRequestAnimationFrame ||
		   window.msRequestAnimationFrame ||
		   function (callback, element) {
			   window.setTimeout(callback, 1000 / 60);
		   };
})();

var handSlots, chooseSlots, canvas, ctx, horizontalCenter, verticalCenter, clickPos, clickedCard, cardWidth, cardHeight, playerCardPosition, opponentCardPosition;
var clickCursor = false,
	displayCardSlots = false,
	displayChooseSlots = false,
	aspect = 16 / 10,
	labels = [],
	primaryFont = "rook-primary";
	secondaryFont = "Arial";

init();
animate();

window.addEventListener("resize", handleResize, false);
canvas.addEventListener("mousemove", handleMouseMove, false);
canvas.addEventListener("mousedown", handleMouseDown, false);
canvas.addEventListener("mouseup", handleMouseUp, false);
setInterval(animateLabels, 300);
