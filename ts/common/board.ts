import {
    Card,
    allRanks,
    allSuits,
    cardsAreEqual,
    isOneEyedJack,
} from './cards';
import { Point } from './point';

// TODO: Deal with color blindness.
export type Color = 'Blue' | 'Green' | 'Red';
export const allColors: Color[] = ['Blue', 'Green', 'Red'];
export type Token = Color | undefined;

export const boardSize = 10;

const allPositions = Array(boardSize).fill(0).flatMap((_, y) =>
    Array(boardSize).fill(0).map((_, x) =>
        new Point(x, y)
    )
);

function* positionsInSpiralOrder(
    size: number
): Generator<Point, void, undefined> {
    const visited: Boolean[][] = [];
    for (let i = 0; i < size; i++) {
        visited[i] = [];
        for (let j = 0; j < size; j++) {
            visited[i][j] = false;
        }
    }

    // Start at the top left
    let p: Point = new Point(0, 0);
    // Moving right
    let dir: Point = new Point(1, 0);
    const min = new Point(0, 0);
    const max = new Point(boardSize - 1, boardSize - 1);
    while (true) {
        console.log(`p: ${p.x}, ${p.y}`);
        if (visited[p.y][p.x]) {
            break;
        }

        yield p;

        visited[p.y][p.x] = true;

        const nextForward = p.add(dir);
        if (
            nextForward.inRange(min, max) &&
            !visited[nextForward.y][nextForward.x]
        ) {
            p = nextForward;
        } else {
            dir = dir.rotateRight();
            p = p.add(dir);
        }
    }
}

export function createBoard(): Card[][] {
    const board: Card[][] = [];

    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            board[i][j] = { suit: 'Joker', rank: 'Joker' };
        }
    }

    const withoutJacks = allRanks.filter((rank) => rank != 'J');
    const withoutJacksReversed = withoutJacks.slice().reverse();

    const cardOrder: Card[] = [];
    for (const suit of allSuits) {
        const inReverse = allSuits.indexOf(suit) >= 2;
        const ranks = inReverse ? withoutJacksReversed : withoutJacks;
        for (const rank of ranks) {
            cardOrder.push({ suit, rank });
        }
    }

    let cardIndex = 0;
    // Loop around in a spiral and add the cards in order.
    for (const p of positionsInSpiralOrder(boardSize)) {
        // Skip the corners because they're meant to contain Jokers.
        if (
            (p.x == 0 || p.x == boardSize - 1) &&
            (p.y == 0 || p.y == boardSize - 1)
        ) {
            continue;
        }

        board[p.y][p.x] = cardOrder[cardIndex % cardOrder.length];
        cardIndex++;
    }

    return board;
}

export function isValidPlacement(
    placedTokens: Token[][],
    playerColor: Color,
    card: Card,
    position: Point
) {
    const tokenAtPosition = placedTokens[position.y][position.x];

    // Jacks, as wilds, have their own rules.
    if (card.rank == 'J') {
        if (isOneEyedJack(card)) {
            // Can only remove opponent's tokens.
            // TODO: Prevent removing from sequences.
            return (
                tokenAtPosition != playerColor && tokenAtPosition != undefined
            );
        } else {
            // Only restriction is that the spot is free.
            return tokenAtPosition == undefined;
        }
    }

    // Otherwise, the cards need to match, and the spot must be free.
    return (
        cardsAreEqual(boardLayout[position.y][position.x], card) &&
        tokenAtPosition == undefined
    );
}

export function cardHasPossibleMove(
    placedTokens: Token[][],
    playerColor: Color,
    card: Card
) {
    return allPositions.some((p) => isValidPlacement(placedTokens, playerColor, card, p));
}

export function playerHasPossibleMove(
    placedTokens: Token[][],
    playerColor: Color,
    cards: Card[]
) {
    return cards.some((card) => cardHasPossibleMove(placedTokens, playerColor, card));
}

export function isValidDiscard(placedTokens: Token[][], playerColor: Color, card: Card) {
    // For a discard to be valid, there must be no space on the board for this card.
    return !cardHasPossibleMove(placedTokens, playerColor, card);
}

export function getMovesForCard(
    placedTokens: Token[][],
    playerColor: Color,
    card: Card
): Point[] {
    return allPositions.filter((p) => isValidPlacement(placedTokens, playerColor, card, p));
}

export function getMovesForPlayer(
    placedTokens: Token[][],
    playerColor: Color,
    cards: Card[]
): Map<Card, Point[]> {
    return new Map(
        cards.map((card) => [card, getMovesForCard(placedTokens, playerColor, card)])
    );
}

export function countSequences(placedTokens: Token[][]): Map<Color, number> {
    // Loop through rows, columns, and diagonals for lines of 5.
    const sequences: Map<Color, number> = new Map();

    for (let y = 0; y < boardSize; y++) {
        let count = 0;
        let lastColor: Token = undefined;
        for (let x = 0; x < boardSize; x++) {
            const color = placedTokens[y][x];
            if (color !== undefined && color == lastColor) {
                count++;
                if (count == 5) {
                    sequences.set(color, (sequences.get(color) ?? 0) + 1);
                    // We're allowed to start a new sequence from here,
                    // reusing only one token of the previous sequence.
                    count = 1;
                }
            } else {
                count = 1;
                lastColor = color;
            }
        }
    }

    for (let x = 0; x < boardSize; x++) {
        let count = 0;
        let lastColor: Token = undefined;
        for (let y = 0; y < boardSize; y++) {
            const color = placedTokens[y][x];
            if (color !== undefined && color == lastColor) {
                count++;
                if (count == 5) {
                    sequences.set(color, sequences.get(color)! + 1);
                    // We're allowed to start a new sequence from here,
                    // reusing only one token of the previous sequence.
                    count = 1;
                }
            } else {
                count = 1;
                lastColor = color;
            }
        }
    }

    // Diagonals where x and y both increase (diagonally down and to the right).
    for (let diag = -boardSize + 1; diag < boardSize; diag++) {
        let count = 0;
        let lastColor: Token = undefined;
        // x - y is constant for each diagonal.
        // x - y = diag
        for (
            let x = Math.max(0, diag), y = Math.max(0, -diag);
            x < boardSize && y < boardSize;
            x++, y++
        ) {
            const color = placedTokens[y][x];
            if (color !== undefined && color == lastColor) {
                count++;
                if (count == 5) {
                    sequences.set(color, sequences.get(color)! + 1);
                    // We're allowed to start a new sequence from here,
                    // reusing only one token of the previous sequence.
                    count = 1;
                }
            } else {
                count = 1;
                lastColor = color;
            }
        }
    }

    // Diagonals where x increases and y decreases (diagonally up and to the right).
    for (let diag = -boardSize + 1; diag < boardSize; diag++) {
        let count = 0;
        let lastColor: Token = undefined;
        // Just do what we did above, and then flip the y coordinate.
        // fy is the flipped y coordinate.
        for (
            let x = Math.max(0, diag), fy = Math.max(0, -diag);
            x < boardSize && fy < boardSize;
            x++, fy++
        ) {
            const y = (boardSize - 1) - fy;

            const color = placedTokens[y][x];
            if (color !== undefined && color == lastColor) {
                count++;
                if (count == 5) {
                    sequences.set(color, sequences.get(color)! + 1);
                    // We're allowed to start a new sequence from here,
                    // reusing only one token of the previous sequence.
                    count = 1;
                }
            } else {
                count = 1;
                lastColor = color;
            }
        }
    }

    return sequences;
}

export const boardLayout = createBoard();
