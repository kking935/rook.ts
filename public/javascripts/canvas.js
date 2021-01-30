/////  Label Constructor  \\\\
// ------------------------- \\ 
function Label(banner, color1, color2, position, text, size, background, visible, clickable, disabled, font, callback) {
	// x and y are integers between 0 and 1. Use as percentages.
	this.banner = banner
	this.position = position;
	this.text = text.toUpperCase();
	this.size = size;
	this.visible = visible;
	this.clickable = clickable;
	this.disabled = disabled;
	this.down = false;
	this.hover = false;
	this.font = font;
	this.callback = callback;
	this.color1 = color1;
	this.color2 = color2;
	this.background = background
}

/////  Label Helpers  \\\\\\\\
// ------------------------- \\
function turnOnClickableLabels(labelsList) {
	for (var i in labelsList) {
		labels[`${labelsList[i]}`].visible = true;
		labels[`${labelsList[i]}`].clickable = true;
		labels[`${labelsList[i]}`].disabled = false;
	}
}

function addToCircuitPile(card, slot) {
	turnOnLabels(['waitingToPlay'])
	circuitPile[slot].number = card.number;
	circuitPile[slot].color = card.color
	// handleResize();
}

function turnOnLabels(labelsList) {
	for (var i in labelsList) {
		labels[`${labelsList[i]}`].visible = true;
	}
}

function disableLabels(labelsList) {
	for (var i in labelsList) {
		labels[`${labelsList[i]}`].disabled = true;
		labels[`${labelsList[i]}`].clickable = false;
	}
}

function enableLabels(labelsList) {
	for (var i in labelsList) {
		labels[`${labelsList[i]}`].disabled = false;
		labels[`${labelsList[i]}`].clickable = true;
	}
}

function turnOffLabels(labelsList) {
	for (var i in labelsList) {
		labels[`${labelsList[i]}`].visible = false;
		labels[`${labelsList[i]}`].clickable = false;
	}
	
}

/////////  Drawing  \\\\\\\\\\
// ------------------------- \\
function toColor(colorStr) {
	var color = undefined;
	switch (colorStr) {
		case "Yellow":
			color = "#CCCC00";
			break;
		case "Green":
			color = "#52a546";
			break;
		case "ROOK":
			color = "#246acd";
			break;
		case "Black":
			color = "#000000";
			break;
		case "Red":
			color = "#e02929";
			break;
		default:
			color = "#000000"
			break;
	}
	return color;
}

function drawEmptyPileSlot(position) {
	ctx.fillStyle = "#a0a0a0";
	ctx.fillRect(position.x, position.y, cardWidth, cardHeight);
	ctx.strokeStyle = "#000000";
	ctx.strokeRect(position.x, position.y, cardWidth, cardHeight);
}

function drawCard(card, scale) {
	if (!scale) {
		scale = 1;
	}
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillStyle = toColor(card.color);
	ctx.fillRect(card.position.x, card.position.y, cardWidth * scale, cardHeight * scale);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 2 * scale * r;
	ctx.strokeRect(card.position.x, card.position.y, cardWidth * scale, cardHeight * scale);
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(card.position.x + cardWidth * scale * 0.1, card.position.y + cardHeight * scale * 0.067, cardWidth * scale * 0.8, cardHeight * scale * 0.866);
	
	
	
	// ctx.fillStyle = toColor(card.color);
	ctx.fillStyle = 'rgb(54, 54, 54)';
	
	
	
	ctx.font = "bold " + (50 * scale * r) + "px Arial";
	ctx.fillText(card.number, card.position.x + cardWidth * scale / 2, card.position.y + cardHeight * scale * 0.4);
	ctx.font = (20 * scale * r) + "px Arial";
	ctx.fillText(card.color, card.position.x + cardWidth * scale / 2, card.position.y + cardHeight * scale * 0.7);	
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
	ctx.font = "bold " + (72 * r * scale) + "px " + labelFont;
	ctx.fillText("?", position.x + cardWidth * scale / 2, position.y + cardHeight * 0.5 * scale);
}

function drawEmptySlot(slotNum, x, y, slots) {
	var x = canvas.width * x + canvas.width / slots.length * slotNum - cardWidth / 2;
	var y = canvas.height * y;
	ctx.fillStyle = "#a0a0a0";
	ctx.fillRect(x, y, cardWidth, cardHeight);
	ctx.strokeStyle = "#000000";
	ctx.strokeRect(x, y, cardWidth, cardHeight);
}

function drawLabel(label) {
	if (label.visible && label.background) {
		drawBackground(label, label.background, 1.3)
	}
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.font = (label.size * r) + "px " + label.font;
	var shadowDistance = label.size / 20;
	if (label.disabled) {
		ctx.fillStyle = "#9a9a9a";
	} else {
		ctx.fillStyle = label.color1;
		ctx.fillText(label.text, canvas.width * label.position.x + (shadowDistance * r), canvas.height * label.position.y + (shadowDistance * r));
		
		if (label.hover && !label.background) {
			drawBackground(label, 'rgb(0, 140, 90)', 1)
		} else {
			// do nothing to overwrite background back to green
		}
		
		ctx.fillStyle = label.color2;
		if (label.down) {
			ctx.fillText(label.text, canvas.width * label.position.x + (shadowDistance * 0.5 * r), canvas.height * label.position.y + (shadowDistance * 0.5 * r));
		} else {
			ctx.fillText(label.text, canvas.width * label.position.x, canvas.height * label.position.y);
		}
	}
}

function drawBackground(label, color, scale) {
	var curCanvasWidth = document.getElementById('game-canvas').width
	var calcWidth = scale * label.text.length * label.size * (curCanvasWidth / 1500)
	if (label.banner) {
		calcWidth = curCanvasWidth
	} else if (label.text.length < 4) {
		calcWidth += calcWidth / label.text.length		
	}
	var calcHeight = label.size * (curCanvasWidth / 500)
	ctx.fillStyle = color;
	ctx.fillRect(
		canvas.width * label.position.x - calcWidth / 2, 
		canvas.height * label.position.y - calcHeight / 1.9, 
		calcWidth, 
		calcHeight
	)
	ctx.strokeStyle = "#000000";
	ctx.strokeRect(		canvas.width * label.position.x - calcWidth / 2, 
		canvas.height * label.position.y - calcHeight / 1.9, 
		calcWidth, 
		calcHeight);
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	if (displayPile) {
		for (var i in circuitPile) {
			if (circuitPile[i] && circuitPile[i].number && circuitPile[i].color) {
				drawCard(circuitPile[i], 1)
			} else {
				drawEmptyPileSlot(circuitPile[i].position, 1)
			}
		}
	}

	if (displayCardSlots) {
		for (var i in handSlots) {
			if (handSlots[i] && handSlots[i].number && handSlots[i].color) { 
				drawCard(handSlots[i], 1) 
			} else {
				drawEmptySlot(i, handSlotsX, handSlotsY, handSlots)
			}
		}

		if (selectedHandSlot && selectedHandSlot.card) { 
			if (selectedHandSlot.card.position.y > canvas.height * 0.7)
				selectedHandSlot.card.position.y -= canvas.height * 0.01;
			drawCard(selectedHandSlot.card, 1) 
		}
	}

	if (displayChooseSlots) {
		for (var i in chooseSlots) {
			if (canChooseCards || (displaySlot == i)) {
				drawCard(chooseSlots[i], 1);
			} else {
				drawUnknownCard(chooseSlots[i].position, 1);
			}
		}

		if (selectedChooseSlot && selectedChooseSlot.card) {
			if (selectedChooseSlot.card.position.y > canvas.height * 0.3)
				selectedChooseSlot.card.position.y -= canvas.height * 0.01;
			drawCard(selectedChooseSlot.card, 1)
		}
	}

	for (var i in labels) {
		if (labels[i].visible) {
			drawLabel(labels[i]);
		}
	}
}

/////////  Resizing  \\\\\\\\\
// ------------------------- \
function setSlotsPosition(slots, x, y, multiplyer) {
	for (var i in slots) {
		 slots[i].position = {
			x: canvas.width * x + canvas.width / slots.length * i * multiplyer - cardWidth / 2,
			y: canvas.height * y
		};
	}
}

function handleResize() {
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
		setSlotsPosition(handSlots, handSlotsX, handSlotsY, handSlotsMulti) 
	};
	if (chooseSlots) { 
		setSlotsPosition(chooseSlots, chooseSlotsX, chooseSlotsY, chooseSlotsMulti) 
	};
	if (selectedHandSlot) { 
		setSlotsPosition(selectedHandSlot.card, handSlotsX, handSlotsY, selectedHandSlot.slotNum) 
	};
	if (selectedChooseSlot) {
		setSlotsPosition(selectedChooseSlot.card, chooseSlotsX, chooseSlotsY, selectedChooseSlot.slotNum) 
	};
	if (circuitPile) { 
		setSlotsPosition(circuitPile, circuitPileX, circuitPileY, circuitPileMulti)
	}
}

///////  isOn Helpers  \\\\\\\
// ------------------------- \\ 
function isOnSlot(event, slot) {
	var x = (event.pageX - canvas.offsetLeft),
		y = (event.pageY - canvas.offsetTop);
	if (slot) {
		if (x > slot.position.x && x < slot.position.x + cardWidth &&
			y > slot.position.y && y < slot.position.y + cardHeight) {
			return true;
		}
	}
	return false;
}

function checkSlots(slots) {
	for (var i in slots) {
		if (isOnSlot(event, slots[i])) {
			if (!clickCursor) {
				$("#game-canvas").css("cursor", "pointer");
				clickCursor = true;
			}
			return;
		}
	}
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

///////  Mouse Events  \\\\\\\
// ------------------------- \\ 
function handleMouseMove(event) {
	checkSlots(handSlots);
	checkSlots(chooseSlots);

	for (var i in labels) {
		if (isOnLabel(event, labels[i])) {
			labels[i].hover = true;
			if (!clickCursor) {
				$("#game-canvas").css("cursor", "pointer");
				labels[i]
				clickCursor = true;
			}
			return;
		} else {
			labels[i].hover = false;
			labels[i].down = false;
		}
	}

	for (var i in chooseSlots) {
		if (isOnSlot(event, chooseSlots[i])) {
			if (!clickCursor) {
				$("#game-canvas").css("cursor", "pointer");
				clickCursor = true;
			}
			return;
		} else {
		}
	}

	for (var i in handSlots) {
		if (isOnSlot(event, handSlots[i])) {
			if (!clickCursor) {
				$("#game-canvas").css("cursor", "pointer");
				clickCursor = true;
			}
			return;
		} else {
		}
	}

	$("#game-canvas").css("cursor","auto");
	clickCursor = false;
}

function handleMouseDown(event) {
	for (i in labels) {
		if (isOnLabel(event, labels[i]) && labels[i].clickable && !labels[i].disabled) {
			labels[i].down = true;
			console.log(labels[i])
			return;
		}
	}
}

function handleMouseUp(event) {
	for (var i in labels) {
		if (labels[i].down) {
			labels[i].down = false;
			if (labels[i].callback && labels[i].clickable) {
				labels[i].callback();
			}
		}
	}

	if (displayCardSlots) {
		for (var i in handSlots) {
			if (isOnSlot(event, handSlots[i])) {
				if (selectedHandSlot === undefined || selectedHandSlot.card === undefined) {
					if (selectedChooseSlot) {
						const swapCard = handSlots[i]
						handSlots[i] = selectedChooseSlot.card
						chooseSlots[selectedChooseSlot.slotNum] = swapCard
						selectedChooseSlot = undefined
					}
					else {
						if (handSlots[i].number && handSlots[i].color) {
							selectedHandSlot = {
								slotNum: i,
								card: handSlots[i],
							} 
						}
						else { return }
					}
					if (canPlayCard)
						enableLabels(["submitSelectedCard"])
				} else {
					const swapCard = handSlots[i]
					handSlots[i] = selectedHandSlot.card;
					handSlots[selectedHandSlot.slotNum] = swapCard
					selectedHandSlot = undefined;
					disableLabels(["submitSelectedCard"])
				}
				handleResize();
				return;
			}
		}
	}

	if (canChooseCards) {
		for (var i in chooseSlots) {
			if (canChooseCards && isOnSlot(event, chooseSlots[i])) {
				if ((selectedChooseSlot === undefined || selectedChooseSlot.card === undefined)) {
					selectedChooseSlot = {
						slotNum: i, 
						card: chooseSlots[i]
					}
				}
				else {
					var tempSlot = chooseSlots[i];
					chooseSlots[i] = selectedChooseSlot.card;
					chooseSlots[selectedChooseSlot.slotNum] = tempSlot
					selectedChooseSlot = undefined
				}
				if (selectedChooseSlot && selectedHandSlot) {
					chooseSlots[selectedChooseSlot.slotNum] = selectedHandSlot.card;
					handSlots[selectedHandSlot.slotNum] = selectedChooseSlot.card;
					selectedChooseSlot = undefined;
					selectedHandSlot = undefined;
				}

				handleResize()
				return;
			}
		}
	}
	handleMouseMove(event);
}

/////////  Betting  \\\\\\\\\\
// ------------------------- \\
function updateCurrentBet(newBet, bettingTeamId) {
	currBet = newBet;
	labels["currentBet"].text = "CURRENT BET: " + currBet;
	// labels["currentBet"].color1 = "#0f0f0f";

	// if (team.id === bettingTeamId) {
	// 	labels["currentBet"].color2 = "#52a546";
	// }
	// else {
	// 	labels["currentBet"].color2 = "#e02929";
	// }
}

/////////  Trumps  \\\\\\\\\\\
// ------------------------- \\
function updateSubmitTrumps() {
	labels["submitTrumps"].text = "Choose " + trumps;
	labels["submitTrumps"].background = toColor(trumps);
}

function updateTrumps() {
	labels["trumps"].text = 'Trumps: ' + trumps;
	// labels["trumps"].color2 = toColor(trumps);
	labels["trumps"].color2 = 'black';
}

function chooseYellowTrumps() {
	chooseTrumps("Yellow")
}

function chooseRedTrumps() {
	chooseTrumps("Red")
}

function chooseBlackTrumps() {
	chooseTrumps("Black")
}

function chooseGreenTrumps() {
	chooseTrumps("Green")
}

//////////  Canvas  \\\\\\\\\\
// ------------------------- \\ 
function init() {
	canvas = document.getElementById("game-canvas");
	ctx = canvas.getContext("2d");
	handleResize();
	var primaryBG = 'black'
	var secondaryBG = 'white'
	var smallerButtonSize = 15
	var smallButtonSize = 40
	var mediumButtonSize = 50
	var largeBannerSize = 70
	var largerBannerSize = 90

	var topOffset = 0.08


	labels["logo"] = new Label(true, secondaryColor, 'white', {x: 0.5, y: topOffset}, "SELECT GAME MODE", mediumButtonSize, primaryBG, true, false, false, "Arial");
	labels["twoPlayers"] = new Label(false, secondaryColor, 'white', {x: 0.5, y: 0.35}, "Two Players", smallButtonSize, false, true, true, false, labelFont, enterQueueTwo);
	labels["fourPlayers"] = new Label(false, secondaryColor, 'white', {x: 0.5, y: 0.6}, "Four Players", smallButtonSize, false, true, true, false, labelFont, enterQueueFour);
	labels["sixPlayers"] = new Label(false, secondaryColor, 'white', {x: 0.5, y: 0.85}, "Six Players", smallButtonSize, false, true, true, false, labelFont, enterQueueSix);
	labels["waiting"] = new Label(false, primaryColor, secondaryColor, {x: 0.5, y: 0.62}, "Waiting   ", largerBannerSize, false, false, false, false, labelFont);
	labels["searching"] = new Label(false, secondaryColor, 'white', {x: 0.5, y: topOffset}, "Searching for players   ", mediumButtonSize, primaryBG, false, false, false, labelFont);
	labels["result"] = new Label(false, secondaryColor, 'white', {x: 0.5, y: topOffset}, "", mediumButtonSize, primaryBG, false, false, false, labelFont);
	labels["rematch"] = new Label(true, primaryColor, secondaryColor, {x: 0.5, y: 0.62}, "Rematch", smallButtonSize, false, false, false, false, labelFont, requestRematch);
	labels["main menu"] = new Label(false, secondaryColor, 'white', {x: 0.5, y: 0.78}, "Main Menu", smallButtonSize, false, false, false, false, labelFont, exitMatch);
	labels["reason"] = new Label(true, secondaryColor, 'white', {x: 0.5, y: topOffset}, "", mediumButtonSize, primaryBG, false, false, false, labelFont);
	labels["currentBet"] = new Label(true, secondaryColor, 'white', {x: 0.5, y: topOffset}, "Current Bet: 0", mediumButtonSize, primaryBG, false, false, false, labelFont);
	labels["bet"] = new Label(false, secondaryColor, 'white', {x: 0.65, y: 0.6}, "Bet", smallButtonSize, 'green', false, false, false, labelFont, handleBet);
	labels["pass"] = new Label(false, secondaryColor, 'white', {x: 0.35, y: 0.6}, "Pass", smallButtonSize, 'red', false, false, false, labelFont, handlePass);
	labels["betting"] = new Label(false, secondaryColor, 'white', {x: 0.5, y: 0.6}, "Waiting for other players to bet   ", smallButtonSize, 'grey', false, false, false, labelFont);
	labels["chooseCards"] = new Label(false, secondaryColor, 'white', {x: 0.5, y: topOffset}, "Choose which cards to discard   ", mediumButtonSize, primaryBG, false, false, false, labelFont);
	labels["submitCards"] = new Label(false, secondaryColor, 'white', {x: 0.5, y: 0.6}, "Discard cards", smallButtonSize, false, false, false, false, labelFont, submitChosenCards)
	labels["chooseTrumps"] = new Label(true, secondaryColor, 'white', {x: 0.5, y: topOffset}, "Choose trumps color   ", mediumButtonSize, primaryBG, false, false, false, labelFont);
	labels["Yellow"] = new Label(false, secondaryColor, 'white', {x: 0.2, y: 0.3}, "Yellow", smallButtonSize, toColor("Yellow"), false, false, false, labelFont, chooseYellowTrumps);
	labels["Red"] = new Label(false, secondaryColor, 'white', {x: 0.4, y: 0.3}, "Red", smallButtonSize, toColor("Red"), false, false, false, labelFont, chooseRedTrumps);
	labels["Green"] = new Label(false, secondaryColor, 'white', {x: 0.6, y: 0.3}, "Green", smallButtonSize, toColor("Green"), false, false, false, labelFont, chooseGreenTrumps);
	labels["Black"] = new Label(false, secondaryColor, 'white', {x: 0.8, y: 0.3}, "Black", smallButtonSize, toColor("Black"), false, false, false, labelFont, chooseBlackTrumps);
	labels["submitTrumps"] = new Label(false, secondaryColor, 'white', {x: 0.5, y: 0.6}, "Choose Trumps", smallButtonSize, false, false, false, false, labelFont, submitTrumps)
	labels["trumps"] = new Label(false, secondaryColor, secondaryColor, {x: 0.93, y: 0.2}, `Trumps: ${trumps}`, smallerButtonSize, false, false, false, false, labelFont);
	labels["playerChoosingCards"] = new Label(true, secondaryColor, 'white', {x: 0.5, y: topOffset}, "Waiting on bet winner   ", mediumButtonSize, primaryBG, false, false, false, labelFont);
	labels["playerChoosingTrumps"] = new Label(true, secondaryColor, 'white', {x: 0.5, y: topOffset}, "Bet winner is choosing trumps   ", mediumButtonSize, primaryBG, false, false, false, labelFont);
	labels["waitingToPlay"] = new Label(true, secondaryColor, 'white', {x: 0.5, y: topOffset}, "Waiting to play   ", mediumButtonSize, primaryBG, false, false, false, labelFont);
	labels["yourTurn"] = new Label(true, secondaryColor, 'white', {x: 0.5, y: topOffset}, "Your Turn   ", mediumButtonSize, primaryBG, false, false, false, labelFont);
	labels["submitSelectedCard"] = new Label(false, secondaryColor, 'white', {x: 0.5, y: 0.6}, "Play Card", smallButtonSize, false, false, false, false, labelFont, submitSelectedCard);
	labels['totalTeamPoints'] = new Label(false, secondaryColor, toColor("Green"), {x: 0.9, y: 0.03}, "Team Total Points: 0", smallerButtonSize, false, false, false, false, labelFont)
	labels['roundTeamPoints'] = new Label(false, secondaryColor, toColor("Green"), {x: 0.895, y: 0.06}, "Team Round Points: 0", smallerButtonSize, false, false, false, false, labelFont)
	labels['totalOpponentPoints'] = new Label(false, secondaryColor, toColor("Red"), {x: 0.88, y: 0.09}, "Opponent Total Points: 0", smallerButtonSize, false, false, false, false, labelFont)
	labels['roundOpponentPoints'] = new Label(false, secondaryColor, toColor("Red"), {x: 0.875, y: 0.12}, "Opponent Round Points: 0", smallerButtonSize, false, false, false, false, labelFont)
	labels["circuitResult"] = new Label(true, primaryColor, secondaryColor, {x: 0.5, y: topOffset}, "", mediumButtonSize, primaryBG, false, false, false, labelFont);
	labels["roundResult"] = new Label(true, primaryColor, secondaryColor, {x: 0.5, y: topOffset}, "", mediumButtonSize, primaryBG, false, false, false, labelFont);

	this.dottedLabels = [
		labels["waiting"], 
		labels["searching"], 
		labels["betting"], 
		labels["chooseCards"], 
		labels["chooseTrumps"], 
		labels["playerChoosingCards"], 
		labels["playerChoosingTrumps"],
		labels['waitingToPlay'],
		labels['yourTurn']
	];
}

function animate() {
	requestAnimFrame(animate);
	draw();
}

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

// ---------------------------------------------------------------------
// -------------------------- Script -----------------------------------
// ---------------------------------------------------------------------

// Initialize
var canvas, 
	ctx, 
	cardWidth, 
	cardHeight,
	aspect = 16 / 10,
	clickCursor = false,
	primaryColor = "#9a9a9a",
	secondaryColor = "#000000",
	labels = [],
	dottedLabels = [],
	labelFont = "Helvetica",
	team = undefined,
	handSlots = undefined, 
	handSlotsX = 0.05,
	handSlotsY = 0.775,
	handSlotsMulti = 1
	displayCardSlots = false,
	chooseSlots = undefined, 
	chooseSlotsX = 0.28,
	chooseSlotsY = 0.2,
	chooseSlotsMulti = 0.55,
	displayChooseSlots = false,
	displaySlot = undefined,
	trumps = 'None',
	selectedHandSlot = undefined,
	selectedChooseSlot = undefined,
	circuitPileX = 0.35,
	circuitPileY = 0.2,
	circuitPileMulti = 0.55,
	displayPile = false,
	circuitPile = undefined;

init();
animate();

// Start up listeners
window.addEventListener("resize", handleResize, false);
canvas.addEventListener("mousemove", handleMouseMove, false);
canvas.addEventListener("mousedown", handleMouseDown, false);
canvas.addEventListener("mouseup", handleMouseUp, false);

// Set update interval
setInterval(animateLabels, 300);
