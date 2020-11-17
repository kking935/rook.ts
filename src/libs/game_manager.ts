// This file handles all socket.io connections and manages the serverside game logic.

import { GOAL_POINTS } from '../GameConstants/Constants'
import { Match } from '../types/Match'
import { Player } from '../types/Player'
import { Card } from '../types/Card'
import { Round } from '../types/Round'
import { Team } from '../types/Team'
import { Circuit } from '../types/Circuit'
import { Socket } from 'socket.io'

const players: Player[] = []
const queueTwo: any[] = []
const queueFour: any[] = []
const queueSix: any[] = []
const matches: Match[] = []
// var rematchRequests = [];

const teamSize = 2
const numTeams = 2
// const handSize = 1;
let potSize = 5

const numbers = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 1]
const colors = ['Yellow', 'Green', 'Red', 'Black']
const rook = {
	number: 20,
	color: 'ROOK',
}

//////////  export consts  \\\\\\\\\\
// ------------------------------------------------------------------------------------------------------------------------------------------------------

export const playerConnect = (socket: Socket) => {
	players.push({
		socket: socket,
		turn: undefined,
		team: undefined,
		cards: undefined,
	})
}

/**
 * Disconnects a player from their match
 * @param socket 	The socket of the player to disconnect
 */
export const playerDisconnected = (io: any, socket: Socket) => {
	const player = findPlayerById(socket.id)
	const index = player ? players.indexOf(player) : -1
	if (index > -1) {
		leaveQueue(socket)
		leaveMatch(io, socket)
		players.splice(index, 1)
	}
}

/**
 * Finds a player by their socket's id
 * @param socketId	The socket id of the player
 */
export const findPlayerById = (socketId: any) => {
	for (let i = 0; i < players.length; i++) {
		if (players[i].socket.id === socketId) {
			return players[i]
		}
	}
	return undefined
}

/**
 * Handles the event when a new player enters the queue (clicks on the play button to join a lobby)
 * @param socket	The socket of the player who entered the queue
 */
export const enterQueueTwo = (io: any, socket: Socket) => {
	const player = findPlayerById(socket.id)
	if (queueTwo.indexOf(player) === -1) {
		queueTwo.push(player)
		socket.emit('queue entered')
		if (queueTwo.length >= 2) {
			const newPlayers = []
			const currentQueue = queueTwo.length
			for (let x = 0; x < currentQueue; x++) {
				newPlayers.push(queueTwo.shift())
			}
			createMatch(io, newPlayers, 5)
		}
	}
}

export const enterQueueFour = (io: any, socket: Socket) => {
	const player = findPlayerById(socket.id)
	if (queueFour.indexOf(player) === -1) {
		queueFour.push(player)
		socket.emit('queue entered')
		if (queueFour.length >= 4) {
			const newPlayers = []
			const currentQueue = queueFour.length
			for (let x = 0; x < currentQueue; x++) {
				newPlayers.push(queueFour.shift())
			}
			createMatch(io, newPlayers, 10)
		}
	}
}

export const enterQueueSix = (io: any, socket: Socket) => {
	const player = findPlayerById(socket.id)
	if (queueSix.indexOf(player) === -1) {
		queueSix.push(player)
		socket.emit('queue entered')
		if (queueSix.length >= 6) {
			const newPlayers = []
			const currentQueue = queueSix.length
			for (let x = 0; x < currentQueue; x++) {
				newPlayers.push(queueSix.shift())
			}
			createMatch(io, newPlayers, 7)
		}
	}
}

/**
 * Removes a player from the queue
 * @param socket 	The socket of the player to remove from the queue
 */
export const leaveQueue = (socket: Socket) => {
	const player = findPlayerById(socket.id)
	let index = queueTwo.indexOf(player)
	if (index > -1) {
		queueTwo.splice(index, 1)
		index = -1
	} else {
		index = queueFour.indexOf(player)
	}
	if (index > -1) {
		queueFour.splice(index, 1)
		index = -1
	} else {
		index = queueSix.indexOf(player)
	}
	if (index > -1) {
		queueSix.splice(index, 1)
		index = -1
	}
	socket.emit('queue left')
}

/**
 * Creates a new match for the teams of players passed in
 * @param  participants 	The participlants to create a match for
 */
export const createMatch = (io: any, participants: Player[], handSize: number) => {
	if (participants.length === 6) {
		potSize = 3
	} else {
		potSize = 5
	}

	const id = createId()
	const newDeck: Card[] = shuffleDeck(generateDeck())
	const newPlayers: Player[] = []
	const newTeams: Team[] = []
	for (let team = 0; team < numTeams; team++) {
		newTeams.push({
			id: team,
			points: 0,
			matchPoints: 0,
			roundPoints: 0,
		})
	}

	for (
		let participant = 0;
		participant < participants.length;
		participant++
	) {
		const playerObject = {
			socket: participants[participant].socket,
			team: newTeams[Math.floor(participant % numTeams)],
			turn: participant,
			cards: dealHand(newDeck, handSize),
		}

		newPlayers.push(playerObject)
		participants[participant].socket.emit(
			'update cards',
			playerObject.cards
		)
	}

	const round: Round = createRound(0, newDeck, newPlayers)

	const match: Match = {
		matchId: id,
		deck: newDeck,
		round: round,
		players: newPlayers,
		teams: newTeams,
		isOver: false,
		gameSize: participants.length,
		handSize: handSize,
		rematch: 0
	}

	for (let z = 0; z < participants.length; z++) {
		participants[z].socket.join(id)
	}

	matches.push(match)

	for (let x = 0; x < match.players.length; x++) {
		match.players[x].socket.emit('enter match', match.players[x].team)
	}

	let slot = 0
	if (match.players.length === 6) {
		slot = -1
	}

	io.to(match.matchId).emit('update choose cards', match.round.pot, slot)

	newPlayers.map((newPlayer: Player) => {
		players.map((curPlayer: Player) => {
			if (newPlayer.socket.id == curPlayer.socket.id) {
				curPlayer = newPlayer
			}
		})
	})

	callBet(io, match)
}

export const createRound = (
	roundNumber: number,
	deck: Card[],
	roundPlayers: Player[]
) => {
	const newRound: Round = {
		number: roundNumber,
		pot: dealHand(deck, potSize),
		turnToBet: 0,
		bet: 0,
		roundBetter: undefined,
		currentBetters: roundPlayers.slice(0),
		trumps: undefined,
		circuit: createCircuit(),
		turnToPlay: 0
	}
	return newRound
}

const createCircuit = () => {
	const newCircuit: Circuit = {
		number: 0,
		cardPile: [],
		bestCard: { number: -1, color: 'none' },
		currentLeader: undefined,
		turnToPlay: 0,
		endTurn: 0,
	}
	return newCircuit
}

/**
 * Creates an unique ID for a new match
 */
export const createId = () => {
	let id = ''
	const charset =
		'ABCDEFGHIJKLMNOPQRSTUCWXYZabcdefghijklmnopqrtsuvwxyz1234567890'
	for (let i = 0; i < 16; i++) {
		id += charset.charAt(Math.floor(Math.random() * charset.length))
	}
	return id
}

//////////////////////////// DECK export constS /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

/**
 * Generates a new deck (for a new match)
 * @return deck	The newly generated deck of cards
 */
export const generateDeck = () => {
	const deck = []
	for (let color = 0; color < colors.length; color++) {
		for (let number = 0; number < numbers.length; number++) {
			deck.push({
				color: colors[color],
				number: numbers[number],
			})
		}
	}
	deck.push(rook)
	return deck
}

/**
 * Deals a player's initial hand
 * @param deck 	The deck to deal from
 */
export const dealHand = (deck: any, numCards: number) => {
	const hand = []
	for (let card = 0; card < numCards; card++) {
		hand.push(drawCard(deck))
	}
	return hand
}

/**
 * Draws a card from this deck
 * @param deck 	The deck to draw a card from
 */
export const drawCard = (deck: any[]) => {
	return deck.shift()
}

/**
 * Shuffles the deck
 * @param deck	The deck of cards to shuffle
 * @return deckCopy 	The shuffled copy of the original deck of cards
 */
export const shuffleDeck = (deck: Card[]) => {
	const deckCopy = deck.slice()
	for (let i = deckCopy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const temp = deckCopy[i]
		deckCopy[i] = deckCopy[j]
		deckCopy[j] = temp
	}
	return deckCopy
}

/**
 * Finds a player's match based on their socket's id
 * @param socketId 	The id of the socket of the player whos match we're looking for
 */
export const findMatchBySocketId = (socketId: any) => {
	for (let i = 0; i < matches.length; i++) {
		for (let j = 0; j < matches[i].players.length; j++) {
			if (matches[i].players[j].socket.id === socketId) {
				return matches[i]
			}
		}
	}
	return undefined
}

/**
 * Tells the next player in the match to bet,
 * or starts the round if the
 * @param match
 */
export const callBet = (io: any, match: Match) => {
	const turn = match.round.turnToBet
	if (
		turn < match.round.currentBetters.length &&
		match.round.currentBetters.length != 1
	) {
		console.log('the turn is ', turn)
		match.round.currentBetters[turn].socket.emit('turn on bet')
	} else if (match.round.currentBetters.length > 1) {
		match.round.turnToBet = 0
		console.log('reseting turn to bet back to 0')

		callBet(io, match)
	} else {
		console.log('here')
		match.round.roundBetter = match.round.currentBetters[0]
		console.log('round better : ', match.round.roundBetter?.socket.id)
		// console.log(match.round.roundBetter?)
		io.to(match.matchId).emit('end betting')
		startRound(match)
	}
}

export const handleBet = (io: any, socket: Socket, bet: number) => {
	const match: Match | undefined = findMatchBySocketId(socket.id)
	if (match) {
		const player = findPlayerById(socket.id)
		if (player && player.team) {

			io.to(match.matchId).emit('update current bet', bet, player.team.id)
			if (bet > match.round.bet) {
				match.round.bet = bet
				match.round.roundBetter = player
			} else {
				handlePass(io, socket)
			}
			
			match.round.turnToBet++
			callBet(io, match)
		} else {
			console.log('error in handleBet')
		}
	} else {
		console.log('error in handleBet')
	}
}

export const handlePass = (io: any, socket: Socket) => {
	const match = findMatchBySocketId(socket.id)
	if (match) {
		const player = findPlayerById(socket.id)
		if (player) {
			console.log('passing: ', socket.id)
			console.log('current betters : ', match.round.currentBetters)
			match.round.currentBetters.splice(
				match.round.currentBetters.indexOf(player),
				1
			)
			console.log('current betters : ', match.round.currentBetters)
			callBet(io, match)
		}  else {
			console.log('error in handle pass')
		}
	} else {
		console.log('error in handle pass')
	}
}

export const startRound = (match: Match) => {
	for (let i = 0; i < match.players.length; i++) {
		// console.log(match.players[i])
		if (match.players[i] === match.round.roundBetter) {
			match.round.roundBetter.socket.emit('turn on choose cards')
		} else {
			match.players[i].socket.emit(
				'waiting on bet winner to choose cards'
			)
		}
	}
}

export const updateChosenCards = (socket: Socket, cards: any) => {
	const match = findMatchBySocketId(socket.id)
	if (match) {
		const player = findPlayerById(socket.id)

		for (let i = 0; i < match.players.length; i++) {
			console.log(i)
			if (match.players[i].socket == socket) {
				console.log('calling turn on choose trumps')
				match.players[i].socket.emit('turn on choose trumps')
			} else {
				// console.log('emitting waitingo on better to choose trumps')
				match.players[i].socket.emit(
					'waiting on bet winner to choose trumps'
				)
			}
		}
		player ? (player.cards = cards) : ''
	}
}

export const setTrumps = (io: any, socket: Socket, newTrumps: string) => {
	const match = findMatchBySocketId(socket.id)
	const player = findPlayerById(socket.id)

	if (match && player) {
		match.round.trumps = newTrumps

		io.to(match.matchId).emit(
			'start round with trumps',
			newTrumps,
			match.gameSize
		)

		console.log('player is ', player.turn)

		setTurns(match, player)
	}

	// handleTurn(match);
}

export const setTurns = (match: Match, player: Player) => {
	console.log('player is ', player.turn)
	match.round.circuit.currentLeader = player
	player.socket.emit('turn play on')
	const circuit = match.round.circuit
	if (circuit) {
		circuit.turnToPlay = player.turn
		console.log('setting turn to ', player.turn)
		match.round.circuit.endTurn = match.players.length
	}
}

/**
 * Handles when a player wants to play their currently selected card
 * @param socket 	The socket of the player to play a card for
 * @param index 	The index in the card array of the player's hand
 */
export const playCard = (io: any, socket: Socket, card: Card) => {
	// console.log('here')
	// if (logFull) // console.log("%s(%j)", arguments.callee.name, Array.prototype.slice.call(arguments).sort());
	// console.lo('playing card')
	const match = findMatchBySocketId(socket.id)
	console.log('playing card')
	const player = findPlayerById(socket.id)
	if (match && player) {
		const isTurn = player.turn === match.round.circuit.turnToPlay
		const cardExists = card !== undefined

		if (isTurn && cardExists) {
			console.log('about to fight cards')
			// console.log('at line 468')

			if (fightCards(match, card)) {
				// console.log('at 471')
				match.round.circuit.bestCard = card
				match.round.circuit.currentLeader = player
			}

			io.to(match.matchId).emit(
				'play card',
				card,
				match.round.circuit.cardPile.length
			)

			match.round.circuit.cardPile.push(card)

			const circuit = match.round.circuit
			if (circuit && circuit.turnToPlay) {
				circuit.turnToPlay++
			}
			match.round.circuit.endTurn--

			// console.log('about to handle turn', match.round.circuit.turnToPlay)
			handleTurn(io, match)
		}
	}
}

export const handleTurn = (io: any, match: Match) => {
	console.log('in handle turn')
	// console.log(match.round)
	// console.log('turn to play: ', match.round.circuit.turnToPlay )

	const playerTurn: number | undefined = match.round.circuit.turnToPlay
	if (match.round.circuit.endTurn > 0) {
		if (playerTurn) {
			if (playerTurn >= match.players.length) {
				match.round.circuit.turnToPlay = 0
			}
			console.log(
				'telling player to play ',
				match.round.circuit.turnToPlay
			)
			match.players[playerTurn].socket.emit(
				'turn play on'
			)
		}
	} else {
		processCircuit(io, match)
	}
}

export const fightCards = (match: Match, newCard: Card) => {
	console.log('new card: ', newCard)
	console.log('current best: ', match.round.circuit.bestCard)
	// console.log('inside fight card')
	let newCardWins = false
	if (
		(match.round.circuit.bestCard &&
			match.round.circuit.bestCard.number !== 1 &&
			newCard.number > match.round.circuit.bestCard.number) ||
		newCard.number === 1
	) {
		newCardWins = true
	}

	const newCardIsTrumps =
		newCard.color === match.round.trumps || newCard.color === 'ROOK'
	const currCardIsTrumps =
		match.round.circuit.bestCard.color === match.round.trumps ||
		match.round.circuit.bestCard.color === 'ROOK'

	if (currCardIsTrumps && !newCardIsTrumps) {
		newCardWins = false
	} else if (!currCardIsTrumps && newCardIsTrumps) {
		newCardWins = true
	} else if (!currCardIsTrumps && !newCardIsTrumps) {
		if (
			match.round.circuit.bestCard.color != 'none' &&
			match.round.circuit.bestCard.color != newCard.color
		) {
			newCardWins = false
		}
	}

	return newCardWins
}

/**
 * Processes the end of each round, determining who won
 * @param {} match
 * @param {*} tied
 * @param {*} winner 	The winning team's number
 */
export const processCircuit = (io: any, match: Match) => {
	console.log('processing circuit')
	let totalPoints = 0
	for (let card = 0; card < match.round.circuit.cardPile.length; card++) {
		switch (match.round.circuit.cardPile[card].number) {
		case 20:
			totalPoints += 20
			break
		case 1:
			totalPoints += 15
			break
		case 5:
			totalPoints += 5
			break
		case 10:
			totalPoints += 10
			break
		case 14:
			totalPoints += 10
			break
		}
	}

	const leader: Player | undefined = match.round.circuit.currentLeader
	// console.log('curr leader: ',match.round.circuit.currentLeader)
	if (leader && leader.team) {
		leader.team.points += totalPoints
	} else {
		console.log('something fishys up, the leader object is incorrect')
	}

	console.log('circuit winners')
	if (match.round.circuit.currentLeader?.team) {
		io.to(match.matchId).emit(
			'circuit winners',
			match.round.circuit.currentLeader.team,
			totalPoints
		)
	}
	match.round.circuit.number++

	console.log(
		'circuit number  : ',
		match.round.circuit.number,
		' handsize ',
		match.handSize
	)
	setTimeout(() => {
		if (match.round.circuit.number == match.handSize) {
			processRound(io, match)
		} else {
			nextCircuit(io, match)
		}
	}, 5000)
}

export const nextCircuit = (io: any, match: Match) => {
	io.to(match.matchId).emit('new circuit')
	match.round.circuit.bestCard = { number: -1, color: 'none' }
	match.round.circuit.cardPile = [] // Reset card pile
	const leader = match.round.circuit.currentLeader
	if (leader) {
		console.log('player is ', leader.turn)
		setTurns(match, leader)
	} else {
		console.log('error in nextCircuit()')
	}
}

/**
 * Processes the end of each round, determining who won
 * @param {} match
 * @param {*} tied
 * @param {*} winner 	The winning team's number
 */
export const processRound = (io: any, match: Match) => {
	console.log('processing round')
	const better = match.round.roundBetter
	if (better && better.team) {
		if (match.round.bet <= better.team.roundPoints) {
			better.team.matchPoints += better.team.roundPoints
		} else {
			better.team.matchPoints -= better.team.roundPoints
		}

		if (better.team.points >= GOAL_POINTS) {
			endMatch(io, match, better.team, 'set')
		} else {
			console.log('next round')
			io.to(match.matchId).emit(
				'round winners',
				match.round.roundBetter?.team
			)
			nextRound(io, match)
		}
	}
}

/**
 * Prepares each player in the match for the next round
 * @param {Prep} match
 */
export const nextRound = (io: any, match: Match) => {
	setTimeout(() => io.to(match.matchId).emit('new round'), 5000)

	io.to(match.matchId).emit('new circuit')
	setTimeout(() => {
		match.deck = shuffleDeck(generateDeck())
		match.round = createRound(
			match.round.number + 1,
			match.deck,
			match.players
		)

		for (let i = 0; i < match.players.length; i++) {
			match.players[i].cards = dealHand(match.deck, match.handSize)
			match.players[i].socket.emit(
				'update cards',
				match.players[i].cards
			)
		}

		let slot = 0
		if (match.players.length === 6) {
			slot = -1
		}
		io.to(match.matchId).emit('update choose cards', match.round.pot, slot)
		callBet(io, match)
	}, 6000)
}

/**
 * Handles when a player tries to leave a match
 * @param socket
 */
export const leaveMatch = (io: any, socket: Socket) => {
	const match = findMatchBySocketId(socket.id)
	if (match) {
		if (!match.isOver) {
			abbortMatch(io, match)
		} else {
			io.to(match.matchId).emit('no rematch')
		}
		removeMatch(match)
	}
}

export const abbortMatch = (io: any, match: Match) => {
	io.to(match.matchId).emit('abbort match', 'player left')
	match.isOver = true
}

/**
 * Ends a match for all of the players invovled
 * @param match 	The match to end
 * @param {*} winner 	The winners of the match (an array of players)
 * @param {*} reason 	The reason they won
 */
export const endMatch = (io: any, match: Match, winningTeam: any, reason: string) => {
	io.to(match.matchId).emit('end match', winningTeam, reason)
	match.isOver = true
}

/**
 * Removes a match from the array of matches that are being tracked
 * @param match	The match to remove
 */
export const removeMatch = (match: any) => {
	const index = matches.indexOf(match)
	if (index > -1) {
		matches.splice(index, 1)
	}
}

/**
 * Updates a player's cards based on their socket id and its corresponding match
 * @param {*} socket
 */
export const updateCardsRequested = (socket: Socket) => {
	const match: Match | undefined = findMatchBySocketId(socket.id)
	const player: Player | undefined = findPlayerById(socket.id)
	if (match && player) {
		player.socket.emit('update cards', player.cards)
	}
}

/**
 * Handles when a player requests a rematch
 * @param {*} socket
 */
export const rematchRequested = (io: any, socket: Socket) => {
	const match : Match | undefined = findMatchBySocketId(socket.id)
	if (match) {
		match.rematch += 1
		if (match.rematch == match.players.length) {
			removeMatch(match)
			createMatch(io, match.players, match.handSize)
		}
	}	
}
