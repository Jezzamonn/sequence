import {
    Card,
    allRanks,
    allSuits,
    cardToShortString,
    cardsAreEqual,
    isOneEyedJack,
    suitToColor,
} from './cards';
import { Point, Points } from './point';

// TODO: Deal with color blindness.
export type Color = 'Blue' | 'Green' | 'Red';
export const allColors: Color[] = ['Blue', 'Green', 'Red'];
export type Token = Color | undefined;

export const boardSize = 10;

const allPositions = Array(boardSize)
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
                case 'Blue':
                    highlightColor = '\x1b[44m';
                    break;
                case 'Green':
                    highlightColor = '\x1b[42m';
                    break;
                case 'Red':
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
    const tokenAtPosition = placedTokens[position.y][position.x];
    const cardAtPosition = boardLayout[position.y][position.x];

    // Can't place tokens on the wild spaces.
    if (cardAtPosition.rank == 'Joker') {
        return false;
    }

    // Jacks, as wilds, have their own rules.
    if (card.rank == 'J') {
        if (isOneEyedJack(card)) {
            // Can only remove opponent's tokens.
            if (
                tokenAtPosition == playerColor ||
                tokenAtPosition == undefined
            ) {
                return false;
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
            const newSequences = [
                ...countSequences(placedTokens).values(),
            ].reduce((a, b) => a + b, 0);
            placedTokens[position.y][position.x] = prevValue;

            return newSequences == sequenceCount;
        } else {
            // Only restriction is that the spot is free.
            return tokenAtPosition == undefined;
        }
    }

    // Otherwise, the cards need to match, and the spot must be free.
    return (
        cardsAreEqual(cardAtPosition, card) &&
        tokenAtPosition == undefined
    );
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
): [Card, Point | undefined][] {
    return cards.flatMap((card) => {
        const moves = getMovesForCard(
            placedTokens,
            sequenceCount,
            playerColor,
            card
        );
        if (moves.length == 0 && canDiscard) {
            return [[card, undefined]] as [Card, Point | undefined][];
        }
        return moves.map((point) => [card, point]) as [Card, Point][];
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

function* allRows(): Generator<Point[], void, undefined> {
    yield* horizontalRows();
    yield* verticalRows();
    yield* increasingDiagonalRows();
    yield* decreasingDiagonalRows();
}

export function countSequences(placedTokens: Token[][]): Map<Color, number> {
    // Loop through rows, columns, and diagonals for lines of 5.
    const sequences: Map<Color, number> = new Map();

    for (const row of allRows()) {
        let count = 0;
        let lastWasJoker = false;
        let lastColor: Token = undefined;
        for (const { x, y } of row) {
            const card = boardLayout[y][x];
            const color = placedTokens[y][x];
            if (color !== undefined && (color == lastColor || lastWasJoker)) {
                count++;
                // Update this variable in case the last card was a joker.
                lastColor = color;

                if (count == 5) {
                    sequences.set(
                        lastColor,
                        (sequences.get(lastColor) ?? 0) + 1
                    );
                    // We're allowed to start a new sequence from here,
                    // reusing only one token of the previous sequence.
                    count = 1;
                }
            } else {
                // This also runs when we encounter a joker, treating it as the
                // start of a sequence as desired.
                count = 1;
                lastColor = color;
            }
            lastWasJoker = card.rank === 'Joker';
        }
    }

    return sequences;
}
