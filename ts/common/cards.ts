export type Suit = "Clubs" | "Diamonds" | "Spades" | "Hearts" | "Joker";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A" | "Joker";

export interface Card {
    suit: Suit;
    rank: Rank;
}

export const allSuits: Suit[] = ["Clubs", "Diamonds", "Spades", "Hearts"];
export const allRanks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export const suitToSymbol: Map<Suit, string> = new Map([
    ["Clubs", "♣"],
    ["Diamonds", "♦"],
    ["Hearts", "♥"],
    ["Spades", "♠"],
]);

export const suitToColor: Map<Suit, string> = new Map([
    ["Clubs", "black"],
    ["Diamonds", "red"],
    ["Hearts", "red"],
    ["Spades", "black"],
]);
