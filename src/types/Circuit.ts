import { Card } from './Card'
import { Player } from './Player'

export type Circuit = {
    number: number;
    cardPile: Card[];
    bestCard: Card;
    currentLeader: Player | undefined;
    turnToPlay: number | undefined;
    endTurn: number;
}