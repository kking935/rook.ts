import { Socket } from 'socket.io'
import { Card } from './Card'
import { Team } from './Team'

export type Player = {
    socket: Socket,
    turn: number | undefined,
    team: Team | undefined,
    cards: Card[] | undefined
}