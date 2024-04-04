import { countSequences, isValidPlacement, makeEmptyPlacedTokens } from './board';
import { Card, cardToDescription } from './cards';
import { Point, Points } from './point';

const emptyPlacedTokens = makeEmptyPlacedTokens();

describe('isValidPlacement', function () {
    const expectedAllowedPositions: [Card, Point][] = [
        [
            { rank: '2', suit: 'Spades' },
            { x: 1, y: 0 },
        ],
        [
            { rank: '2', suit: 'Spades' },
            { x: 6, y: 8 },
        ],
        [
            { rank: 'A', suit: 'Spades' },
            { x: 1, y: 2 },
        ],
        [
            { rank: 'A', suit: 'Spades' },
            { x: 9, y: 4 },
        ],
        [
            { rank: 'K', suit: 'Hearts' },
            { x: 6, y: 1 },
        ],
        [
            { rank: '5', suit: 'Hearts' },
            { x: 4, y: 4 },
        ],
    ];

    for (const [card, position] of expectedAllowedPositions) {
        const cardDesc = cardToDescription(card);
        const pointDesc = Points.toString(position);
        it(`with empty board, should allow ${cardDesc} at (${pointDesc})`, function () {
            expect(
                isValidPlacement(emptyPlacedTokens, 0, 'red', card, position)
            ).toBe(true);
        });
    }

    it('should not allow placement on top of existing token', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[4][4] = 'red';
        expect(
            isValidPlacement(
                placedTokens,
                0,
                'red',
                { rank: '5', suit: 'Hearts' },
                { x: 4, y: 4 }
            )
        ).toBe(false);
    });

    const testTwoEyedJackPositions = [
        { x: 1, y: 0 },
        { x: 6, y: 8 },
        { x: 1, y: 2 },
        { x: 9, y: 4 },
        { x: 6, y: 1 },
        { x: 4, y: 4 },
    ];

    for (const position of testTwoEyedJackPositions) {
        const pointDesc = Points.toString(position);
        it(`should allow a two-eyed jack to be placed at (${pointDesc})`, function () {
            expect(
                isValidPlacement(
                    emptyPlacedTokens,
                    0,
                    'red',
                    { rank: 'J', suit: 'Diamonds' },
                    position
                )
            ).toBe(true);
        });
    }

    it('should not allow a two-eyed jack to be placed on top of an existing token', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[4][4] = 'red';
        expect(
            isValidPlacement(
                placedTokens,
                0,
                'red',
                { rank: 'J', suit: 'Diamonds' },
                { x: 4, y: 4 }
            )
        ).toBe(false);
    });

    const wildCardPositions = [
        { x: 0, y: 0 },
        { x: 9, y: 9 },
        { x: 0, y: 9 },
        { x: 9, y: 0 },
    ];

    for (const position of wildCardPositions) {
        const pointDesc = Points.toString(position);
        it(`should not allow a two-eyed jack to be placed over the wild square at (${pointDesc})`, function () {
            expect(
                isValidPlacement(
                    emptyPlacedTokens,
                    0,
                    'red',
                    { rank: 'J', suit: 'Diamonds' },
                    position
                )
            ).toBe(false);
        });
    };

    it('should now allow a two-eyed jack to be placed over a wild square', function () {
        expect(
            isValidPlacement(
                emptyPlacedTokens,
                0,
                'red',
                { rank: 'J', suit: 'Diamonds' },
                { x: 0, y: 0 }
            )
        ).toBe(false);
    });

    it('should not allow a one-eyed jack to be placed', function () {
        expect(
            isValidPlacement(
                emptyPlacedTokens,
                0,
                'red',
                { rank: 'J', suit: 'Hearts' },
                { x: 4, y: 4 }
            )
        ).toBe(false);
    });

    it('should allow a one-eyed jack to remove a token of another color', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[4][4] = 'green';
        expect(
            isValidPlacement(
                placedTokens,
                0,
                'red',
                { rank: 'J', suit: 'Hearts' },
                { x: 4, y: 4 }
            )
        ).toBe(true);
    });

    it('should not allow a one-eyed jack to remove a token of the same color', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[4][4] = 'red';
        expect(
            isValidPlacement(
                placedTokens,
                0,
                'red',
                { rank: 'J', suit: 'Hearts' },
                { x: 4, y: 4 }
            )
        ).toBe(false);
    });
});

describe('countSequences', function () {
    it('should count no sequences on an empty board', function () {
        const placedTokens = makeEmptyPlacedTokens();
        expect(countSequences(placedTokens)).toEqual(new Map());
    });

    it('should count a vertical sequence', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[0][1] = 'red';
        placedTokens[1][1] = 'red';
        placedTokens[2][1] = 'red';
        placedTokens[3][1] = 'red';
        placedTokens[4][1] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count a horizontal sequence', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[1][0] = 'red';
        placedTokens[1][1] = 'red';
        placedTokens[1][2] = 'red';
        placedTokens[1][3] = 'red';
        placedTokens[1][4] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count an increasing diagonal sequence', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[2][2] = 'red';
        placedTokens[3][3] = 'red';
        placedTokens[4][4] = 'red';
        placedTokens[5][5] = 'red';
        placedTokens[6][6] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count a decreasing diagonal sequence', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[6][2] = 'red';
        placedTokens[5][3] = 'red';
        placedTokens[4][4] = 'red';
        placedTokens[3][5] = 'red';
        placedTokens[2][6] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count multiple sequences of the same color', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[0][1] = 'red';
        placedTokens[1][1] = 'red';
        placedTokens[2][1] = 'red';
        placedTokens[3][1] = 'red';
        placedTokens[4][1] = 'red';

        placedTokens[0][3] = 'red';
        placedTokens[1][3] = 'red';
        placedTokens[2][3] = 'red';
        placedTokens[3][3] = 'red';
        placedTokens[4][3] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 2]]));
    });

    it('should count multiple sequences of different colors', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[0][1] = 'red';
        placedTokens[1][1] = 'red';
        placedTokens[2][1] = 'red';
        placedTokens[3][1] = 'red';
        placedTokens[4][1] = 'red';

        placedTokens[0][3] = 'green';
        placedTokens[1][3] = 'green';
        placedTokens[2][3] = 'green';
        placedTokens[3][3] = 'green';
        placedTokens[4][3] = 'green';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1], ['green', 1]]));
    });

    it('should count top left vertical sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[1][0] = 'red';
        placedTokens[2][0] = 'red';
        placedTokens[3][0] = 'red';
        placedTokens[4][0] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count top right vertical sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[1][9] = 'red';
        placedTokens[2][9] = 'red';
        placedTokens[3][9] = 'red';
        placedTokens[4][9] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count bottom left vertical sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[8][0] = 'red';
        placedTokens[7][0] = 'red';
        placedTokens[6][0] = 'red';
        placedTokens[5][0] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count bottom right vertical sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[8][9] = 'red';
        placedTokens[7][9] = 'red';
        placedTokens[6][9] = 'red';
        placedTokens[5][9] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count top left horizontal sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[0][1] = 'red';
        placedTokens[0][2] = 'red';
        placedTokens[0][3] = 'red';
        placedTokens[0][4] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count top right horizontal sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[0][8] = 'red';
        placedTokens[0][7] = 'red';
        placedTokens[0][6] = 'red';
        placedTokens[0][5] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count bottom left horizontal sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[9][1] = 'red';
        placedTokens[9][2] = 'red';
        placedTokens[9][3] = 'red';
        placedTokens[9][4] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count bottom right horizontal sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[9][8] = 'red';
        placedTokens[9][7] = 'red';
        placedTokens[9][6] = 'red';
        placedTokens[9][5] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count top left diagonal sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[1][1] = 'red';
        placedTokens[2][2] = 'red';
        placedTokens[3][3] = 'red';
        placedTokens[4][4] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count bottom right diagonal sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[5][5] = 'red';
        placedTokens[6][6] = 'red';
        placedTokens[7][7] = 'red';
        placedTokens[8][8] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count bottom left diagonal sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[8][1] = 'red';
        placedTokens[7][2] = 'red';
        placedTokens[6][3] = 'red';
        placedTokens[5][4] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count top right decreasing diagonal sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[1][8] = 'red';
        placedTokens[2][7] = 'red';
        placedTokens[3][6] = 'red';
        placedTokens[4][5] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 1]]));
    });

    it('should count sequences that intersect', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[2][1] = 'red';
        placedTokens[3][2] = 'red';
        placedTokens[4][3] = 'red';
        placedTokens[5][4] = 'red';
        placedTokens[6][5] = 'red';

        placedTokens[2][4] = 'red';
        placedTokens[3][4] = 'red';
        placedTokens[4][4] = 'red';
        // 5, 4 handled above
        placedTokens[6][4] = 'red';

        expect(countSequences(placedTokens)).toEqual(new Map([['red', 2]]));
    });

    it('should count the line 9 tile sequence as two', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[0][2] = 'red';
        placedTokens[1][2] = 'red';
        placedTokens[2][2] = 'red';
        placedTokens[3][2] = 'red';
        placedTokens[4][2] = 'red';
        placedTokens[5][2] = 'red';
        placedTokens[6][2] = 'red';
        placedTokens[7][2] = 'red';
        placedTokens[8][2] = 'red';
        expect(countSequences(placedTokens)).toEqual(new Map([['red', 2]]));
    });
});