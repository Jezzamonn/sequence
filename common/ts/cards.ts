export type Suit = 'Spades' | 'Diamonds' | 'Clubs' | 'Hearts' | 'Joker';
export type Rank =
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | 'J'
    | 'Q'
    | 'K'
    | 'A'
    | 'Joker';

export interface Card {
    suit: Suit;
    rank: Rank;
}

export function cardsAreEqual(card1: Card, card2: Card) {
    return card1.suit == card2.suit && card1.rank == card2.rank;
}

export function isOneEyedJack(card: Card) {
    return card.rank == 'J' && (card.suit == 'Hearts' || card.suit == 'Spades');
}

export const allSuits: Suit[] = ['Spades', 'Diamonds', 'Clubs', 'Hearts'];
export const allRanks: Rank[] = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
];
export const allCards: Card[] = allSuits.flatMap((suit) =>
    allRanks.map((rank) => ({ suit, rank }))
);

export function compareCards(card1: Card, card2: Card): number {
    // Doesn't handle jokers but those aren't actual cards.
    if (card1.suit != card2.suit) {
        return allSuits.indexOf(card1.suit) - allSuits.indexOf(card2.suit);
    }
    return allRanks.indexOf(card1.rank) - allRanks.indexOf(card2.rank);
}

export const rankToFullName: Map<Rank, string> = new Map([
    ['2', '2'],
    ['3', '3'],
    ['4', '4'],
    ['5', '5'],
    ['6', '6'],
    ['7', '7'],
    ['8', '8'],
    ['9', '9'],
    ['10', '10'],
    ['J', 'Jack'],
    ['Q', 'Queen'],
    ['K', 'King'],
    ['A', 'Ace'],
    ['Joker', 'Joker'],
]);

export const suitToSymbol: Map<Suit, string> = new Map([
    ['Clubs', '♣'],
    ['Diamonds', '♦'],
    ['Hearts', '♥'],
    ['Spades', '♠'],
]);

export const suitToColor: Map<Suit, 'black' | 'red'> = new Map([
    ['Clubs', 'black'],
    ['Diamonds', 'red'],
    ['Hearts', 'red'],
    ['Spades', 'black'],
]);

export function cardToShortString(card: Card): string {
    if (card.suit == 'Joker') {
        return '★';
    }
    return card.rank + suitToSymbol.get(card.suit);
}

export const cardBackAssetName = 'img/English_pattern_card_back.svg';

export function cardAssetName(card: Card): string {
    if (card.suit == 'Joker') {
        return cardBackAssetName;
    }
    const fullRank = rankToFullName.get(card.rank)!.toLowerCase();
    const suit = card.suit.toLowerCase();
    return `img/English_pattern_${fullRank}_of_${suit}.svg`;
}

export function cardToDescription(card: Card): string {
    return `${rankToFullName.get(card.rank)} of ${card.suit}`;
}
