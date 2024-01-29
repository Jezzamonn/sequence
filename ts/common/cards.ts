export type Suit = "Spades" | "Diamonds" | "Clubs" | "Hearts" | "Joker";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A" | "Joker";

export interface Card {
    suit: Suit;
    rank: Rank;
}

export const allSuits: Suit[] = ["Spades", "Diamonds", "Clubs", "Hearts"];
export const allRanks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export const rankToFullName: Map<Rank, string> = new Map([
    ["2", "2"],
    ["3", "3"],
    ["4", "4"],
    ["5", "5"],
    ["6", "6"],
    ["7", "7"],
    ["8", "8"],
    ["9", "9"],
    ["10", "10"],
    ["J", "Jack"],
    ["Q", "Queen"],
    ["K", "King"],
    ["A", "Ace"],
    ["Joker", "Joker"],
]);

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

export function cardToShortString(card: Card): string {
    if (card.suit == "Joker") {
        return "★";
    }
    return card.rank + suitToSymbol.get(card.suit);
}

export function cardAssetName(card: Card): string {
    if (card.suit == "Joker") {
        return "img/English_pattern_card_back.svg";
    }
    const fullRank = rankToFullName.get(card.rank)!.toLowerCase();
    const suit = card.suit.toLowerCase();
    return `img/English_pattern_${fullRank}_of_${suit}.svg`;
}

export function cardToLabel(card: Card): string {
    return `${rankToFullName.get(card.rank)} of ${card.suit}`;
}