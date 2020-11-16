import { Card } from "./Card";
import { Circuit } from "./Circuit";
import { Player } from "./Player";

export type Round = {
    number: number;
    pot: Card[];
    turnToBet: number;
    turnToPlay: number;
    bet: number;
    roundBetter: Player | undefined;
    currentBetters: Player[];
    trumps: string | undefined;
    circuit: Circuit
  }