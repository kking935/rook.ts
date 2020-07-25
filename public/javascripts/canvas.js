// This file manages the game's logic for most visual things and contains various functions
// for drawing on and manipulating the canvas, used by the game client.

/////  Label Constructor  \\\\
// ------------------------- \\ 
function Label(color1, color2, position, text, size, visible, clickable, disabled, font, callback) {
	 //  // if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
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
	this.color1 = color1;
	this.color2 = color2;
}

/////  Label Helpers  \\\\\\\\
// ------------------------- \\
function turnOnClickableLabels(labelsList) {
	for (var i in labelsList) {
		// console.log('Turning on clickable label: ', labels[`${labelsList[i]}`])
		labels[`${labelsList[i]}`].visible = true;
		labels[`${labelsList[i]}`].clickable = true;
		labels[`${labelsList[i]}`].disabled = false;
	}
}

function turnOnLabels(labelsList) {
	// console.log('-------------- Turning on labels -----------------')

	for (var i in labelsList) {
		// console.log('Turning on label: ', labels[`${labelsList[i]}`])
		labels[`${labelsList[i]}`].visible = true;
	}
}

function disableLabels(labelsList) {
	// console.log('-------------- Disabling labels -----------------')

	for (var i in labelsList) {
		// console.log("Disabling labels: ", labels[`${labelsList[i]}`])
		labels[`${labelsList[i]}`].disabled = true;
		labels[`${labelsList[i]}`].clickable = false;
		labels[`${labelsList[i]}`].visible = true;
	}
}

function turnOffLabels(labelsList) {
	// console.log('-------------- Turning off labels -----------------')
	for (var i in labelsList) {
		// console.log('labelsList[i]: ', labelsList[i])
		// console.log('turning off label ',labelsList[i] )
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
		case "Blue":
			color = "#246acd";
			break;
		case "Black":
			color = "#000000";
			break;
		case "Red":
			color = "#e02929";
			break;
		case "ROOK":
			color = "#e02929"
			break;
		default:
			color = "#000000"
			break;
	}
	return color;
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
	ctx.fillStyle = toColor(card.color);
	ctx.font = "bold " + (50 * scale * r) + "px Arial";
	ctx.fillText(card.number, card.position.x + cardWidth * scale / 2, card.position.y + cardHeight * scale * 0.4);
	ctx.font = (20 * scale * r) + "px Arial";
	ctx.fillText(card.color, card.position.x + cardWidth * scale / 2, card.position.y + cardHeight * scale * 0.7);	
}

function drawUnknownCard(position, scale) {
	if (!scale) {
		scale = 1;
	}
	 // console.log('in unknow , positin is', position)
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

function drawEmptySlot(slot) {
	ctx.fillStyle = "#a0a0a0";
	ctx.fillRect(slot.position.x, slot.position.y, cardWidth, cardHeight);
	ctx.strokeStyle = "#000000";
	ctx.strokeRect(slot.position.x, slot.position.y, cardWidth, cardHeight);
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

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	 // console.log('displayCardSlots ',  displayCardSlots)
	if (displayCardSlots) {
		for (var i in handSlots) {
			if (handSlots[i]) { 
				 // console.log('drawing handslot ', handSlots[i]);
				drawCard(handSlots[i], 1) 
			} else {
				drawEmptySlot(i)
			}
		}
		console.log('here')

		if (selectedHandSlot && selectedHandSlot.card) { 
			console.log('inside 177')

			console.log(selectedHandSlot)
			if (selectedHandSlot.card.position.y > canvas.height * 0.7)
				selectedHandSlot.card.position.y -= canvas.height * 0.01;
			 // console.log('drawing selectedHandSlot.card ', selectedHandSlot.card);
			drawCard(selectedHandSlot.card, 1) 
		}
	}

	 // console.log('displayChooseSlots ',  displayChooseSlots)
	if (displayChooseSlots) {
		for (var i in chooseSlots) {
			console.log('is display slot equal to i ', displaySlot === i)
			if (canChooseCards || (displaySlot == i)) {
				console.log('also at choose slot ', i)

				 // console.log('drawing chooseSlots[i] ', chooseSlots[i]);
				drawCard(chooseSlots[i], 1);
			} else {
				 // console.log('drawing chooseSlots[i] ', chooseSlots[i]);

				drawUnknownCard(chooseSlots[i].position, 1);
			}
		}

		if (selectedChooseSlot && selectedChooseSlot.card) {
			if (selectedChooseSlot.card.position.y > canvas.height * 0.3)
				selectedChooseSlot.card.position.y -= canvas.height * 0.01;
			drawCard(selectedChooseSlot.card, 1)
		}
	}

	 // console.log('circuitPile ',  !!circuitPile)

	if (circuitPile) {
		for (var i in circuitPile) {
			 // console.log('drawing circuitPile[i] ', circuitPile[i])
			drawCard(circuitPile[i], 1);
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
		 // console.log('setting x ',canvas.width * x + canvas.width / slots.length * i * multiplyer - cardWidth / 2 )
		slots[i].position = {
			x: canvas.width * x + canvas.width / slots.length * i * multiplyer - cardWidth / 2,
			y: canvas.height * y
		};
	}
}

function handleResize() {
	 //  // if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
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

	if (handSlots) { setSlotsPosition(handSlots, handSlotsX, handSlotsY, handSlotsMulti) };
	if (chooseSlots) { setSlotsPosition(chooseSlots, chooseSlotsX, chooseSlotsY, chooseSlotsMulti) };
	if (selectedHandSlot) { setSlotsPosition(selectedHandSlot.card, handSlotsX, handSlotsY, selectedHandSlot.slotNum, 1) };
	if (selectedChooseSlot) { setSlotsPosition(selectedChooseSlot.card, chooseSlotsX, chooseSlotsY, selectedChooseSlot.slotNum, 1) };

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
	 //  // if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	for (i in labels) {
		if (isOnLabel(event, labels[i]) && labels[i].clickable && !labels[i].disabled) {
			labels[i].down = true;
			return;
		}
	}
}

function handleMouseUp(event) {
	 //  // if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
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
						console.log('swapping card ', swapCard)
						handSlots[i] = selectedChooseSlot.card
						console.log('replacing with card ', handSlots[i])
						chooseSlots[selectedChooseSlot.slotNum] = swapCard
						console.log('new choose slot ', chooseSlots[selectedChooseSlot.slotNum])
						selectedChooseSlot = undefined
					}
					else {
						selectedHandSlot = {
							slotNum: i,
							card: handSlots[i],
						}
					}
				} else {
					const swapCard = handSlots[i]
					handSlots[i] = selectedHandSlot.card;
					handSlots[selectedHandSlot.slotNum] = swapCard
					selectedHandSlot = undefined;
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
	labels["currentBet"].text = "Current Bet: " + currBet;
	labels["currentBet"].color1 = "#0f0f0f";

	if (team.id === bettingTeamId) {
		labels["currentBet"].color2 = "#52a546";
	}
	else {
		labels["currentBet"].color2 = "#e02929";
	}
}

/////////  Trumps  \\\\\\\\\\\
// ------------------------- \\
function updateSubmitTrumps() {
	labels["submitTrumps"].text = "Choose " + trumps;
	labels["submitTrumps"].color2 = toColor(trumps);
}

function updateTrumps() {
	labels["trumps"].text = 'Trumps: ' + trumps;
	labels["trumps"].color2 = toColor(trumps);
}

function chooseYellowTrumps() {
	chooseTrumps("Yellow")
}

function chooseBlueTrumps() {
	chooseTrumps("Blue")
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
	 // if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	canvas = document.getElementById("game-canvas");
	ctx = canvas.getContext("2d");
	handleResize();

	labels["logo"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.3}, "ROOK", 192, true, false, false, "Arial");
	labels["play"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.7}, "Play!", 144, true, true, false, labelFont, enterQueue);
	labels["waiting"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.62}, "Waiting   ", 128, false, false, false, labelFont);
	labels["searching"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.7}, "Searching   ", 144, false, false, false, labelFont);
	
	labels["result"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.3}, "", 192, false, false, false, labelFont);
	labels["rematch"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.62}, "Rematch", 128, false, false, false, labelFont, requestRematch);
	labels["main menu"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.78}, "Main Menu", 128, false, false, false, labelFont, exitMatch);
	labels["reason"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.25}, "", 128, false, false, false, labelFont);

	labels["currentBet"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Current Bet: 0", 100, false, false, false, labelFont);
	labels["bet"] = new Label(secondaryColor, toColor("Green"), {x: 0.875, y: 0.45}, "Bet", 70, false, true, false, labelFont, handleBet);
	labels["pass"] = new Label(secondaryColor, toColor("Red"), {x: 0.125, y: 0.45}, "Pass", 70, false, true, false, labelFont, handlePass);
	labels["betting"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.25}, "Waiting for other players to bet   ", 50, false, false, false, labelFont);
	
	labels["chooseCards"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Choose which cards to discard   ", 50, false, false, false, labelFont);
	labels["submitCards"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.675}, "Choose Cards", 50, false, true, false, labelFont, submitChosenCards)
	
	labels["chooseTrumps"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Choose trumps color   ", 50, false, true, false, labelFont);
	labels["Yellow"] = new Label(secondaryColor, toColor("Yellow"), {x: 0.2, y: 0.3}, "Yellow", 50, false, true, false, labelFont, chooseYellowTrumps);
	labels["Blue"] = new Label(secondaryColor, toColor("Blue"), {x: 0.4, y: 0.3}, "Blue", 50, false, true, false, labelFont, chooseBlueTrumps);
	labels["Green"] = new Label(secondaryColor, toColor("Green"), {x: 0.6, y: 0.3}, "Green", 50, false, true, false, labelFont, chooseGreenTrumps);
	labels["Black"] = new Label(secondaryColor, toColor("Black"), {x: 0.8, y: 0.3}, "Black", 50, false, true, false, labelFont, chooseBlackTrumps);
	labels["submitTrumps"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.675}, "Choose Trumps", 50, false, false, false, labelFont, submitTrumps)
	labels["trumps"] = new Label(secondaryColor, secondaryColor, {x: 0.9, y: 0.05}, `Trumps: ${trumps}`, 30, false, false, false, labelFont);

	labels["playerChoosingCards"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Bet winner is choosing their cards   ", 55, false, false, false, labelFont);
	labels["playerChoosingTrumps"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Bet winner is choosing trumps   ", 55, false, false, false, labelFont);

	labels["waitingToPlay"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Waiting to play   ", 55, false, false, false, labelFont);
	labels["yourTurn"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Your Turn   ", 55, false, false, false, labelFont);
	labels["submitSelectedCard"] = new Label(primaryColor, secondaryColor, {x: 0.87, y: 0.65}, "Play Card", 40, false, false, false, labelFont, submitSelectedCard);

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

// ---------------------------------------------------------------------
// -------------------------- Script -----------------------------------
// ---------------------------------------------------------------------

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

// Initialize hand variables
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
	labelFont = "RagingRedLotusBB",
	
	team = undefined,

	handSlots = [], 
	handSlotsX = 0.05,
	handSlotsY = 0.775,
	handSlotsMulti = 1
	displayCardSlots = false,

	chooseSlots = [], 
	chooseSlotsX = 0.28,
	chooseSlotsY = 0.35,
	chooseSlotsMulti = 0.55,
	displayChooseSlots = false,

	displaySlot = undefined,
	trumps = 'None',

	selectedHandSlot = undefined,
	selectedChooseSlot = undefined,

	circuitPile = undefined;

init();
animate();

window.addEventListener("resize", handleResize, false);
canvas.addEventListener("mousemove", handleMouseMove, false);
canvas.addEventListener("mousedown", handleMouseDown, false);
canvas.addEventListener("mouseup", handleMouseUp, false);
setInterval(animateLabels, 300);
