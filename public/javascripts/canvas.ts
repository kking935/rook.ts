// This file manages the game's logic for most visual things and contains various export consts
// for drawing on and manipulating the canvas, used by the game client.

import { CardPosition } from "../Types/Card";
import { LabelType } from "../Types/Label";

/////  Label Constructor  \\\\
// ------------------------- \\ 
export const CreateLabel = (label: LabelType) => {
	 //  // if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	label.down = false;
	return label
}

/////  Label Helpers  \\\\\\\\
// ------------------------- \\
export const turnOnClickableLabels = (labelsList) => {
	for (var i in labelsList) {
		// console.log('Turning on clickable label: ', labels[`${labelsList[i]}`])
		labels[`${labelsList[i]}`].visible = true;
		labels[`${labelsList[i]}`].clickable = true;
		labels[`${labelsList[i]}`].disabled = false;
	}
}

export const addToCircuitPile = (card, slot) => {
	console.log(circuitPile)
	turnOnLabels(['waitingToPlay'])
	circuitPile[slot].number = card.number;
	circuitPile[slot].color = card.color

	console.log(circuitPile)
	// handleResize();
}

export const turnOnLabels = (labelsList) => {
	// console.log('-------------- Turning on labels -----------------')

	for (var i in labelsList) {
		// console.log('Turning on label: ', labels[`${labelsList[i]}`])
		labels[`${labelsList[i]}`].visible = true;
	}
}

export const disableLabels = (labelsList) => {
	// console.log('-------------- Disabling labels -----------------')

	for (var i in labelsList) {
		// console.log("Disabling labels: ", labels[`${labelsList[i]}`])
		labels[`${labelsList[i]}`].disabled = true;
		labels[`${labelsList[i]}`].clickable = false;
	}
}

export const enableLabels = (labelsList) => {

	for (var i in labelsList) {
		labels[`${labelsList[i]}`].disabled = false;
		labels[`${labelsList[i]}`].clickable = true;
	}
}

export const turnOffLabels = (labelsList) => {
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
export const toColor = (colorStr) => {
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

export const drawEmptyPileSlot = (position: Position) => {
	ctx.fillStyle = "#a0a0a0";
	ctx.fillRect(position.x, position.y, cardWidth, cardHeight);
	ctx.strokeStyle = "#000000";
	ctx.strokeRect(position.x, position.y, cardWidth, cardHeight);
}

export const drawCard = (card: CardPosition, scale: number) => {
	if (!scale) {
		scale = 1;
	}

	if (card.number === undefined)
	console.log('drawing card ', card)

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

export const drawUnknownCard = (position: CardPosition, scale: number) => {
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

export const drawEmptySlot = (slotNum: string | number, x: number, y: number, slots: string | any[]) => {
	var x = canvas.width * x + canvas.width / slots.length * slotNum - cardWidth / 2;
	var y = canvas.height * y;

	ctx.fillStyle = "#a0a0a0";
	ctx.fillRect(x, y, cardWidth, cardHeight);
	ctx.strokeStyle = "#000000";
	ctx.strokeRect(x, y, cardWidth, cardHeight);
}

export const drawLabel = (label: any) => {
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

export const draw = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	if (displayPile) {
		for (var i in circuitPile) {
			if (circuitPile[i] && circuitPile[i].number && circuitPile[i].color) {
				// console.log('drawing play card', i)
				drawCard(circuitPile[i], 1)
			} else {
				// console.log('drawing empty slot for play cards')
				drawEmptyPileSlot(circuitPile[i].position, 1)
			}
		}
	}

	 // console.log('displayCardSlots ',  displayCardSlots)
	if (displayCardSlots) {
		for (var i in handSlots) {
			if (handSlots[i] && handSlots[i].number && handSlots[i].color) { 
				 // console.log('drawing handslot ', handSlots[i]);
				drawCard(handSlots[i], 1) 
			} else {
				drawEmptySlot(i, handSlotsX, handSlotsY, handSlots)
			}
		}
		// console.log('here')

		if (selectedHandSlot && selectedHandSlot.card) { 
			// console.log('inside 177')

			// console.log(selectedHandSlot)
			if (selectedHandSlot.card.position.y > canvas.height * 0.7)
				selectedHandSlot.card.position.y -= canvas.height * 0.01;
			 // console.log('drawing selectedHandSlot.card ', selectedHandSlot.card);
			drawCard(selectedHandSlot.card, 1) 
		}
	}

	 // console.log('displayChooseSlots ',  displayChooseSlots)
	if (displayChooseSlots) {
		for (var i in chooseSlots) {
			// console.log('is display slot equal to i ', displaySlot === i)
			if (canChooseCards || (displaySlot == i)) {
				// console.log('also at choose slot ', i)

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

	// if (circuitPile) {
	// 	for (var i in circuitPile) {
	// 		 // console.log('drawing circuitPile[i] ', circuitPile[i])
	// 		drawCard(circuitPile[i], 1);
	// 	}
	// }

	for (var i in labels) {
		if (labels[i].visible) {
			drawLabel(labels[i]);
		}
	}
}

/////////  Resizing  \\\\\\\\\
// ------------------------- \
export const setSlotsPosition = (slots, x, y, multiplyer) => {
	// console.log('slot length : ', slots.length)
	for (var i in slots) {
		 // console.log('setting x ',canvas.width * x + canvas.width / slots.length * i * multiplyer - cardWidth / 2 )
		 slots[i].position = {
			x: canvas.width * x + canvas.width / slots.length * i * multiplyer - cardWidth / 2,
			y: canvas.height * y
		};
	}
}

export const handleResize = () => {
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

	if (handSlots) { 
		console.log('handslots') 
		setSlotsPosition(handSlots, handSlotsX, handSlotsY, handSlotsMulti) 
	};
	if (chooseSlots) { 
		console.log('chooseSLots') 
		setSlotsPosition(chooseSlots, chooseSlotsX, chooseSlotsY, chooseSlotsMulti) 
	};
	if (selectedHandSlot) { 
		console.log('selectedhand') 

		setSlotsPosition(selectedHandSlot.card, handSlotsX, handSlotsY, selectedHandSlot.slotNum) 
	};
	if (selectedChooseSlot) {
		console.log('selected choose') 
 
		setSlotsPosition(selectedChooseSlot.card, chooseSlotsX, chooseSlotsY, selectedChooseSlot.slotNum) 
	};
	if (circuitPile) { 
		console.log('cirucit pule') 

		setSlotsPosition(circuitPile, circuitPileX, circuitPileY, circuitPileMulti)
	}
}

///////  isOn Helpers  \\\\\\\
// ------------------------- \\ 
export const isOnSlot = (event, slot) => {
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

export const checkSlots = (slots) => {
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

export const isOnLabel = (event, label) => {
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
export const handleMouseMove = (event) => {

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

export const handleMouseDown = (event) => {
	 //  // if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	for (i in labels) {
		if (isOnLabel(event, labels[i]) && labels[i].clickable && !labels[i].disabled) {
			labels[i].down = true;
			return;
		}
	}
}

export const handleMouseUp = (event) => {
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
export const updateCurrentBet = (newBet, bettingTeamId) => {
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
export const updateSubmitTrumps = () => {
	labels["submitTrumps"].text = "Choose " + trumps;
	labels["submitTrumps"].color2 = toColor(trumps);
}

export const updateTrumps = () => {
	labels["trumps"].text = 'Trumps: ' + trumps;
	labels["trumps"].color2 = toColor(trumps);
}

export const chooseYellowTrumps = () => {
	chooseTrumps("Yellow")
}

export const chooseRedTrumps = () => {
	chooseTrumps("Red")
}

export const chooseBlackTrumps = () => {
	chooseTrumps("Black")
}

export const chooseGreenTrumps = () => {
	chooseTrumps("Green")
}

//////////  Canvas  \\\\\\\\\\
// ------------------------- \\ 
export const init = () => {
	 // if (logFull) console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	
	canvas = document.getElementById("game-canvas");
	ctx = canvas.getContext("2d");
	handleResize();

	labels["logo"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.3}, "ROOK", 192, true, false, false, "Arial");
	labels["twoPlayers"] = new Label(primaryColor, secondaryColor, {x: 0.2, y: 0.6}, "Two Players", 50, true, true, false, labelFont, enterQueueTwo);
	labels["fourPlayers"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.8}, "Four Players", 50, true, true, false, labelFont, enterQueueFour);
	labels["sixPlayers"] = new Label(primaryColor, secondaryColor, {x: 0.8, y: 0.6}, "Six Players", 50, true, true, false, labelFont, enterQueueSix);

	labels["waiting"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.62}, "Waiting   ", 128, false, false, false, labelFont);
	labels["searching"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.7}, "Searching   ", 144, false, false, false, labelFont);
	
	labels["result"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.3}, "", 192, false, false, false, labelFont);
	labels["rematch"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.62}, "Rematch", 128, false, false, false, labelFont, requestRematch);
	labels["main menu"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.78}, "Main Menu", 128, false, false, false, labelFont, exitMatch);
	labels["reason"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.25}, "", 128, false, false, false, labelFont);

	labels["currentBet"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Current Bet: 0", 70, false, false, false, labelFont);
	labels["bet"] = new Label(secondaryColor, toColor("Green"), {x: 0.875, y: 0.45}, "Bet", 70, false, true, false, labelFont, handleBet);
	labels["pass"] = new Label(secondaryColor, toColor("Red"), {x: 0.125, y: 0.45}, "Pass", 70, false, true, false, labelFont, handlePass);
	labels["betting"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.25}, "Waiting for other players to bet   ", 40, false, false, false, labelFont);
	
	labels["chooseCards"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Choose which cards to discard   ", 50, false, false, false, labelFont);
	labels["submitCards"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.675}, "Choose Cards", 50, false, true, false, labelFont, submitChosenCards)
	
	labels["chooseTrumps"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Choose trumps color   ", 50, false, true, false, labelFont);
	labels["Yellow"] = new Label(secondaryColor, toColor("Yellow"), {x: 0.2, y: 0.3}, "Yellow", 50, false, true, false, labelFont, chooseYellowTrumps);
	labels["Red"] = new Label(secondaryColor, toColor("Red"), {x: 0.4, y: 0.3}, "Red", 50, false, true, false, labelFont, chooseRedTrumps);
	labels["Green"] = new Label(secondaryColor, toColor("Green"), {x: 0.6, y: 0.3}, "Green", 50, false, true, false, labelFont, chooseGreenTrumps);
	labels["Black"] = new Label(secondaryColor, toColor("Black"), {x: 0.8, y: 0.3}, "Black", 50, false, true, false, labelFont, chooseBlackTrumps);
	labels["submitTrumps"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.675}, "Choose Trumps", 50, false, false, false, labelFont, submitTrumps)
	labels["trumps"] = new Label(secondaryColor, secondaryColor, {x: 0.5, y: 0.175}, `Trumps: ${trumps}`, 30, false, false, false, labelFont);

	labels["playerChoosingCards"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Bet winner is choosing their cards   ", 50, false, false, false, labelFont);
	labels["playerChoosingTrumps"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Bet winner is choosing trumps   ", 50, false, false, false, labelFont);

	labels["waitingToPlay"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Waiting to play   ", 55, false, false, false, labelFont);
	labels["yourTurn"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.1}, "Your Turn   ", 55, false, false, false, labelFont);
	labels["submitSelectedCard"] = new Label(primaryColor, secondaryColor, {x: 0.87, y: 0.65}, "Play Card", 40, false, false, false, labelFont, submitSelectedCard);
	
	labels['totalTeamPoints'] = new Label(secondaryColor, toColor("Green"), {x: 0.93, y: 0.03}, "Total Points: 0", 20, false, false, false, labelFont)
	labels['roundTeamPoints'] = new Label(secondaryColor, toColor("Green"), {x: 0.925, y: 0.06}, "Round Points: 0", 20, false, false, false, labelFont)
	
	labels['totalOpponentPoints'] = new Label(secondaryColor, toColor("Red"), {x: 0.072, y: 0.03}, "Total Points: 0", 20, false, false, false, labelFont)
	labels['roundOpponentPoints'] = new Label(secondaryColor, toColor("Red"), {x: 0.072, y: 0.06}, "Round Points: 0", 20, false, false, false, labelFont)

	labels["circuitResult"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.175}, "", 80, false, false, false, labelFont);
	labels["roundResult"] = new Label(primaryColor, secondaryColor, {x: 0.5, y: 0.175}, "", 80, false, false, false, labelFont);


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

export const animate = () => {
	requestAnimFrame(animate);
	draw();
}

// ---------------------------------------------------------------------
// -------------------------- Script -----------------------------------
// ---------------------------------------------------------------------

//////////  Initialize  \\\\\\\\\\
window.requestAnimFrame = () => {
	return window.requestAnimationFrame ||
		   window.webkitRequestAnimationFrame ||
		   window.mozRequestAnimationFrame ||
		   window.oRequestAnimationFrame ||
		   window.msRequestAnimationFrame ||
		   function (callback, element) {
			   window.setTimeout(callback, 1000 / 60);
		   };
}

// Initialize hand variables
var canvas, 
	ctx, 
	cardWidth, 
	cardHeight,
	aspect = 16 / 10,
	clickCursor = false,

	primaryColor = "#9a9a9a",
	secondaryColor = "#000000",

	labels: LabelType[] = [],
	dottedLabels = [],
	labelFont = "RagingRedLotusBB",
	
	team = undefined,

	handSlots = undefined, 
	handSlotsX = 0.05,
	handSlotsY = 0.775,
	handSlotsMulti = 1
	displayCardSlots = false,

	chooseSlots = undefined, 
	chooseSlotsX = 0.28,
	chooseSlotsY = 0.35,
	chooseSlotsMulti = 0.55,
	displayChooseSlots = false,

	displaySlot = undefined,
	trumps = 'None',

	selectedHandSlot = undefined,
	selectedChooseSlot = undefined,

	circuitPileX = 0.35,
	circuitPileY = 0.35,
	circuitPileMulti = 0.55,
	displayPile = false,
	circuitPile = undefined;

init();
animate();

window.addEventListener("resize", handleResize, false);
canvas.addEventListener("mousemove", handleMouseMove, false);
canvas.addEventListener("mousedown", handleMouseDown, false);
canvas.addEventListener("mouseup", handleMouseUp, false);
setInterval(animateLabels, 300);
