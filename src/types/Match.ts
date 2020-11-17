import { Card } from './Card'
import { Player } from './Player'
import { Round } from './Round'
import { Team } from './Team'

export type Match = {
  players: Player[]; 
  handSize: number;
  matchId: any; 
  deck: Card[]; 
  round: Round
  teams: Team[];
  isOver: boolean;
  gameSize: number;
  rematch: number
}
