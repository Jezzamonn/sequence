import {
    Card,
    allRanks,
    allSuits,
    cardToShortString,
    cardsAreEqual,
    isOneEyedJack,
} from './cards';
import { Point, Points } from './point';

// TODO: Deal with color blindness.
export type Color = 'blue' | 'green' | 'red';
export const allColors: Color[] = ['blue', 'green', 'red'];
export type Token = Color | undefined;

/**
 * A move and the color of token that changed (not necessarily the player that
 * made the move if a token was removed by a one-eyed joker)
 */
export interface MoveAndColor {
    card: Card;
    position: Point | undefined;
    color: Color;
}

export interface Move {
    card: Card;
    position: Point | undefined;
}

export interface Sequence {
    start: Point;
    end: Point;
    color: Color;
}

export const boardSize = 10;

export const allPositions = Array(boardSize)
    .fill(0)
    .flatMap((_, y) =>
        Array(boardSize)
            .fill(0)
            .map((_, x) => ({ x, y }))
    );

export function makeEmptyPlacedTokens(): Token[][] {
    return Array(boardSize)
        .fill(0)
        .map(() =>
            Array(boardSize)
                .fill(0)
                .map(() => undefined)
        );
}

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
    let p: Point = { x: 0, y: 0 };
    // Moving right
    let dir: Point = { x: 1, y: 0 };
    const min = { x: 0, y: 0 };
    const max = { x: boardSize - 1, y: boardSize - 1 };
    while (true) {
        if (visited[p.y][p.x]) {
            break;
        }

        yield p;

        visited[p.y][p.x] = true;

        const nextForward = Points.add(p, dir);
        if (
            Points.inRange(nextForward, min, max) &&
            !visited[nextForward.y][nextForward.x]
        ) {
            p = nextForward;
        } else {
            dir = Points.rotateRight(dir);
            p = Points.add(p, dir);
        }
    }
}

// For animation effects.
export const spiralPositionIndices: number[][] = Array(boardSize)
    .fill(0)
    .map(() => Array(boardSize).fill(0));

let spiralIndex = 0;
for (const p of positionsInSpiralOrder(boardSize)) {
    spiralPositionIndices[p.y][p.x] = spiralIndex;
    spiralIndex++;
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

export const boardLayout = createBoard();

/**
 * Returns a string with ansii color codes for the board.
 */
export function boardToString(placedTokens: Token[][]): string {
    let s = '';
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            const card = boardLayout[y][x];
            const token = placedTokens[y][x];
            const cardString = cardToShortString(card);
            let highlightColor = '';
            switch (token) {
                case 'blue':
                    highlightColor = '\x1b[44m';
                    break;
                case 'green':
                    highlightColor = '\x1b[42m';
                    break;
                case 'red':
                    highlightColor = '\x1b[41m';
                    break;
            }
            // If there's no highlight, color the card by its suit.
            let textColor = '';
            if (highlightColor == '') {
                if (card.suit == 'Hearts' || card.suit == 'Diamonds') {
                    textColor = '\x1b[31m';
                } else if (card.suit == 'Spades' || card.suit == 'Clubs') {
                    // Use a dark grey for black suits.
                    textColor = '\x1b[90m';
                }
            } else {
                // If there is a highlight, color the text black so we can see it. ?
                textColor = '\x1b[30m';
            }
            // s += color + cardString.padStart(3, ' ') + '\x1b[0m';
            s +=
                highlightColor +
                textColor +
                cardString.padEnd(2, ' ').padStart(3, ' ') +
                '\x1b[0m';
        }
        s += '\n';
    }
    return s;
}

export function isValidPlacement(
    placedTokens: Token[][],
    sequenceCount: number,
    playerColor: Color,
    card: Card,
    position: Point
) {
    return (
        getPlacementErrorMessage(
            placedTokens,
            sequenceCount,
            playerColor,
            card,
            position
        ) == undefined
    );
}

export function getPlacementErrorMessage(
    placedTokens: Token[][],
    sequenceCount: number,
    playerColor: Color,
    card: Card,
    position: Point
): string | undefined {
    const tokenAtPosition = placedTokens[position.y][position.x];
    const cardAtPosition = boardLayout[position.y][position.x];

    if (cardAtPosition.rank == 'Joker') {
        return "Can't place tokens on the corner spaces.";
    }

    // Jacks, as wilds, have their own rules.
    if (card.rank == 'J') {
        if (isOneEyedJack(card)) {
            // Can only remove opponent's tokens.
            if (tokenAtPosition == playerColor) {
                return "Can't remove your own tokens.";
            }
            if (tokenAtPosition == undefined) {
                return "Can't remove a token from an empty space.";
            }
            // Prevent removing sequences. Do this by removing the piece,
            // counting sequences, and seeing if the number is different.

            const prevValue = placedTokens[position.y][position.x];
            placedTokens[position.y][position.x] = undefined;
            // Note that this is a little inefficient as it scans the whole
            // board. Particularly given that we call this function for each
            // position on the board to see if there is a valid move, making
            // this O(n^4) in that context. But I think the board size is small
            // enough for that to be fine.
            const newSequences = getAllSequences(placedTokens).length;
            placedTokens[position.y][position.x] = prevValue;

            if (newSequences != sequenceCount) {
                return "Can't remove a token that breaks a sequence.";
            }
            return undefined;
        } else {
            // Only restriction is that the spot is free.
            if (tokenAtPosition != undefined) {
                return "Can't place a token on top of another token.";
            }
            return undefined;
        }
    }

    // Otherwise, the cards need to match, and the spot must be free.
    if (!cardsAreEqual(cardAtPosition, card)) {
        return `Can't place ${cardToShortString(
            card
        )} on top of ${cardToShortString(cardAtPosition)}.`;
    }
    if (tokenAtPosition != undefined) {
        return "Can't place a token on top of another token.";
    }
}

export function cardHasPossibleMove(
    placedTokens: Token[][],
    sequenceCount: number,
    playerColor: Color,
    card: Card
) {
    return allPositions.some((p) =>
        isValidPlacement(placedTokens, sequenceCount, playerColor, card, p)
    );
}

export function playerHasPossibleMove(
    placedTokens: Token[][],
    sequenceCount: number,
    playerColor: Color,
    cards: Card[]
) {
    return cards.some((card) =>
        cardHasPossibleMove(placedTokens, sequenceCount, playerColor, card)
    );
}

export function isValidDiscard(
    placedTokens: Token[][],
    sequenceCount: number,
    playerColor: Color,
    card: Card
) {
    // For a discard to be valid, there must be no space on the board for this card.
    return !cardHasPossibleMove(placedTokens, sequenceCount, playerColor, card);
}

export function getMovesForCard(
    placedTokens: Token[][],
    sequenceCount: number,
    playerColor: Color,
    card: Card
): Point[] {
    return allPositions.filter((p) =>
        isValidPlacement(placedTokens, sequenceCount, playerColor, card, p)
    );
}

export function getMovesForPlayer(
    placedTokens: Token[][],
    sequenceCount: number,
    playerColor: Color,
    cards: Card[],
    canDiscard: boolean
): Move[] {
    return cards.flatMap((card) => {
        const moves = getMovesForCard(
            placedTokens,
            sequenceCount,
            playerColor,
            card
        );
        if (moves.length == 0 && canDiscard) {
            return { card, position: undefined } as Move;
        }
        return moves.map((point) => ({ card, position: point }));
    });
}

function* horizontalRows(): Generator<Point[], void, undefined> {
    for (let y = 0; y < boardSize; y++) {
        const row: Point[] = [];
        for (let x = 0; x < boardSize; x++) {
            row.push({ x, y });
        }
        yield row;
    }
}

function* verticalRows(): Generator<Point[], void, undefined> {
    for (let x = 0; x < boardSize; x++) {
        const row: Point[] = [];
        for (let y = 0; y < boardSize; y++) {
            row.push({ x, y });
        }
        yield row;
    }
}

function* increasingDiagonalRows(): Generator<Point[], void, undefined> {
    // Diagonals where x and y both increase (diagonally down and to the right).
    for (let diag = -boardSize + 1; diag < boardSize; diag++) {
        const row: Point[] = [];
        // x - y is constant for each diagonal.
        // x - y = diag
        for (
            let x = Math.max(0, diag), y = Math.max(0, -diag);
            x < boardSize && y < boardSize;
            x++, y++
        ) {
            row.push({ x, y });
        }
        yield row;
    }
}

function* decreasingDiagonalRows(): Generator<Point[], void, undefined> {
    // Diagonals where x increases and y decreases (diagonally up and to the right).
    for (let diag = -boardSize + 1; diag < boardSize; diag++) {
        const row: Point[] = [];
        // Just do what we did above, and then flip the y coordinate.
        // fy is the flipped y coordinate.
        for (
            let x = Math.max(0, diag), fy = Math.max(0, -diag);
            x < boardSize && fy < boardSize;
            x++, fy++
        ) {
            const y = boardSize - 1 - fy;
            row.push({ x, y });
        }
        yield row;
    }
}

// Exported to be used by AIs and such.
export function* allRows(): Generator<Point[], void, undefined> {
    yield* horizontalRows();
    yield* verticalRows();
    yield* increasingDiagonalRows();
    yield* decreasingDiagonalRows();
}

function isWildPosition(point: Point): boolean {
    return (
        (point.x == 0 || point.x == boardSize - 1) &&
        (point.y == 0 || point.y == boardSize - 1)
    );
}

export function* allPossibleSequences(): Generator<Point[], void, undefined> {
    for (const row of allRows()) {
        let start = 0;
        // End of the loop, one past the last index.
        let end = row.length;
        // Skip the corners
        if (isWildPosition(row[0])) {
            start++;
        }
        if (isWildPosition(row[row.length - 1])) {
            end--;
        }

        // range = 0 - 10
        // i = 0, i+5 = 5, includes 0, 1, 2, 3, 4
        // i = 1, i+5 = 6, includes 1, 2, 3, 4, 5
        // i = 2, i+5 = 7, includes 2, 3, 4, 5, 6
        // i = 3, i+5 = 8, includes 3, 4, 5, 6, 7
        // i = 4, i+5 = 9, includes 4, 5, 6, 7, 8
        // i = 5, i+5 = 10, includes 5, 6, 7, 8, 9
        for (let i = start; i + 5 <= end; i++) {
            yield row.slice(i, i + 5);
        }
    }
}

export function countSequences(placedTokens: Token[][]): Map<Color, number> {
    // Loop through rows, columns, and diagonals for lines of 5.
    const sequenceMap: Map<Color, number> = new Map();
    const sequences = getAllSequences(placedTokens);
    for (const seq of sequences) {
        sequenceMap.set(seq.color, (sequenceMap.get(seq.color) ?? 0) + 1);
    }
    return sequenceMap;
}

export function getAllSequences(placedTokens: Token[][]): Sequence[] {
    // Loop through rows, columns, and diagonals for lines of 5.
    const sequences: Sequence[] = [];

    for (const row of allRows()) {
        let count = 0;
        let lastWasWild = false;
        let lastColor: Token = undefined;
        for (let i = 0; i < row.length; i++) {
            const p = row[i];
            const { x, y } = p;
            const isWild = isWildPosition(p);
            const color = placedTokens[y][x];
            if (isWild) {
                count++;
            } else if (color == undefined) {
                count = 0;
            }
            else {
                // isWild handles the possible start and end wild positions
                // lastWasWild handles the position after the wild
                // color == lastColor is the main check
                if (lastWasWild || color == lastColor) {
                    count++;
                }
                else {
                    count = 1;
                }
            }
            if (count == 5) {
                sequences.push({
                    start: row[i - 4],
                    end: p,
                    color: lastColor!
                });
                // We're allowed to start a new sequence from here,
                // reusing only one token of the previous sequence.
                count = 1;
            }
            lastWasWild = isWild;
            lastColor = color;
        }
    }

    return sequences;
}