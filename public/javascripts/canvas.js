//////////  Prototypes  \\\\\\\\\\
String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

Array.prototype.move = function (from, to) {
	this.splice(to, 0, this.splice(from, 1)[0]);
};

//////////  Constructors  \\\\\\\\\\
function Label(position, text, size, visible, clickable, disabled, callback) {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	//x and y are integers betweem 0 and 1. Use as percentages.
	this.position = position;
	this.text = text;
	this.size = size;
	this.visible = visible;
	this.clickable = clickable;
	this.disabled = disabled;
	this.down = false;
	this.callback = callback;
}

//////////  Canvas  \\\\\\\\\\
function init() {
	if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	canvas = document.getElementById("game-canvas");
	ctx = canvas.getContext("2d");
	handleResize();
	handSlots = [];
	for (var i = 1; i < 6; i++) {
		handSlots.push({
			position: {
				x: canvas.width / 6 * i - cardWidth / 2,
				y: canvas.height - cardHeight * 1.1
			},
			card: undefined
		});
	}

	labels["logo"] = new Label({x: 0.5, y: 0.35}, "Card Fu", 192, true, false, false);
	labels["play"] = new Label({x: 0.5, y: 0.7}, "Play!", 128, true, true, false, enterQueue);
	labels["searching"] = new Label({x: 0.5, y: 0.7}, "Searching...", 128, false, false, false);
	labels["reason"] = new Label({x: 0.5, y: 0.25}, "", 72, false, false, false);
	labels["result"] = new Label({x: 0.5, y: 0.3}, "", 144, false, false, false);
	labels["rematch"] = new Label({x: 0.5, y: 0.65}, "Rematch", 96, false, false, false, requestRematch);
	labels["main menu"] = new Label({x: 0.5, y: 0.8}, "Main Menu", 96, false, false, false, exitMatch);
}

function animate() {
	requestAnimFrame(animate);
	draw();
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
	for (i in labels) {
		if (isOnLabel(event, labels[i])) {
			if (!clickCursor) {
				$("#game-canvas").css("cursor", "pointer");
				clickCursor = true;
			}
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
		if (isOnSlot(event, handSlots[i])) {
			playCard(i);
			playerCard = handSlots[i].card;
			handSlots[i].card = undefined;
			return;
		}
	}
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
		var labelWidth = label.text.length * label.size * r * 0.5;
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
	cardWidth = 120 * r;
	cardHeight = cardWidth * 1.5;
	if (handSlots) {
		for (var i = 1; i < 6; i++) {
			handSlots[i-1].position = {
				x: canvas.width / 6 * i - cardWidth / 2,
				y: canvas.height - cardHeight * 1.1
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
	drawPoints();
	if (playerCard) {
		drawCard(playerCard, playerCardPosition, 1.5);
	}
	if (opponentCard) {
		if (opponentCard.isUnknown) {
			drawUnknownCard(opponentCardPosition, 1.5);
		} else {
			drawCard(opponentCard, opponentCardPosition, 1.5);
		}
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
	ctx.fillStyle = colors[card.color];
	ctx.fillRect(position.x, position.y, cardWidth * scale, cardHeight * scale);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 2 * scale * r;
	ctx.strokeRect(position.x, position.y, cardWidth * scale, cardHeight * scale);
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(position.x + cardWidth * scale * 0.1, position.y + cardHeight * scale * 0.067, cardWidth * scale * 0.8, cardHeight * scale * 0.866);
	ctx.fillStyle = typeColors[card.type];
	ctx.font = "bold " + (64 * scale * r) + "px chinese_takeaway";
	ctx.fillText(card.power, position.x + cardWidth * scale / 2, position.y + cardHeight * scale * 0.4);
	ctx.font = (32 * scale * r) + "px Arial";
	ctx.fillText(card.type.capitalize(), position.x + cardWidth * scale / 2, position.y + cardHeight * scale * 0.7);
}

function drawPointCard(card, position, scale) {
	if (!scale) {
		scale = 1;
	}
	ctx.textBaseline = "middle"; 
	ctx.textAlign = "center";
	ctx.fillStyle = colors[card.color];
	ctx.fillRect(position.x, position.y, cardWidth * scale, cardWidth * scale);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 4 * scale * r;
	ctx.strokeRect(position.x, position.y, cardWidth * scale, cardWidth * scale);
	ctx.fillStyle = typeColors[card.type];
	ctx.font = "bold " + (72 * scale * r) + "px Arial";
	ctx.fillText(card.type[0].toUpperCase(), position.x + cardWidth * scale / 2, position.y + cardWidth * scale * 0.5);
	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 3 * r * scale;
	ctx.strokeText(card.type[0].toUpperCase(), position.x + cardWidth * scale / 2, position.y + cardWidth * scale * 0.5);
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
	ctx.font = "bold " + (72 * r * scale) + "px chinese_takeaway";
	ctx.fillText("?", position.x + cardWidth * scale / 2, position.y + cardHeight * 0.6 * scale);
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
	ctx.font = (label.size * r) + "px chinese_takeaway";
	if (!label.disabled) {
		ctx.fillStyle = "#9a9a9a";
		ctx.fillText(label.text, canvas.width * label.position.x + (6 * r), canvas.height * label.position.y + (6 * r));
		ctx.fillStyle = "#000000";
	} else {
		ctx.fillStyle = "#9a9a9a";
	}
	if (label.down) {
		ctx.fillText(label.text, canvas.width * label.position.x + (4 * r), canvas.height * label.position.y + (4 * r));
	} else {
		ctx.fillText(label.text, canvas.width * label.position.x, canvas.height * label.position.y);
	}
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

var canvas, ctx, horizontalCenter, verticalCenter, clickPos, clickedCard, cardWidth, cardHeight, playerCardPosition, opponentCardPosition;
var clickCursor = false,
	displayCardSlots = false,
	aspect = 16 / 10,
	labels = [];
var typeColors = {"fire": "#FF8B26", "water" : "#1260E6", "ice" : "#74D5F2"};
var colors = {"yellow": "#fdee00", "orange": "#ffb235", "green": "#52a546", "blue": "#246acd", "red": "#e02929", "purple": "#9738af"};

init();
animate();

window.addEventListener("resize", handleResize, false);
canvas.addEventListener("mousemove", handleMouseMove, false);
canvas.addEventListener("mousedown", handleMouseDown, false);
canvas.addEventListener("mouseup", handleMouseUp, false);