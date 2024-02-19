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
                isValidPlacement(emptyPlacedTokens, 0, 'Red', card, position)
            ).toBe(true);
        });
    }

    it('should not allow placement on top of existing token', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[4][4] = 'Red';
        expect(
            isValidPlacement(
                placedTokens,
                0,
                'Red',
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
                    'Red',
                    { rank: 'J', suit: 'Diamonds' },
                    position
                )
            ).toBe(true);
        });
    }

    it('should not allow a two-eyed jack to be placed on top of an existing token', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[4][4] = 'Red';
        expect(
            isValidPlacement(
                placedTokens,
                0,
                'Red',
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
                    'Red',
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
                'Red',
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
                'Red',
                { rank: 'J', suit: 'Hearts' },
                { x: 4, y: 4 }
            )
        ).toBe(false);
    });

    it('should allow a one-eyed jack to remove a token of another color', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[4][4] = 'Green';
        expect(
            isValidPlacement(
                placedTokens,
                0,
                'Red',
                { rank: 'J', suit: 'Hearts' },
                { x: 4, y: 4 }
            )
        ).toBe(true);
    });

    it('should not allow a one-eyed jack to remove a token of the same color', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[4][4] = 'Red';
        expect(
            isValidPlacement(
                placedTokens,
                0,
                'Red',
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

    it('should count a horizontal sequence', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[0][1] = 'Red';
        placedTokens[1][1] = 'Red';
        placedTokens[2][1] = 'Red';
        placedTokens[3][1] = 'Red';
        placedTokens[4][1] = 'Red';
        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 1]]));
    });

    it('should count a vertical sequence', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[1][0] = 'Red';
        placedTokens[1][1] = 'Red';
        placedTokens[1][2] = 'Red';
        placedTokens[1][3] = 'Red';
        placedTokens[1][4] = 'Red';
        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 1]]));
    });

    it('should count an increasing diagonal sequence', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[2][2] = 'Red';
        placedTokens[3][3] = 'Red';
        placedTokens[4][4] = 'Red';
        placedTokens[5][5] = 'Red';
        placedTokens[6][6] = 'Red';
        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 1]]));
    });

    it('should count a decreasing diagonal sequence', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[6][2] = 'Red';
        placedTokens[5][3] = 'Red';
        placedTokens[4][4] = 'Red';
        placedTokens[3][5] = 'Red';
        placedTokens[2][6] = 'Red';
        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 1]]));
    });

    it('should count multiple sequences of the same color', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[0][1] = 'Red';
        placedTokens[1][1] = 'Red';
        placedTokens[2][1] = 'Red';
        placedTokens[3][1] = 'Red';
        placedTokens[4][1] = 'Red';

        placedTokens[0][3] = 'Red';
        placedTokens[1][3] = 'Red';
        placedTokens[2][3] = 'Red';
        placedTokens[3][3] = 'Red';
        placedTokens[4][3] = 'Red';
        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 2]]));
    });

    it('should count multiple sequences of different colors', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[0][1] = 'Red';
        placedTokens[1][1] = 'Red';
        placedTokens[2][1] = 'Red';
        placedTokens[3][1] = 'Red';
        placedTokens[4][1] = 'Red';

        placedTokens[0][3] = 'Green';
        placedTokens[1][3] = 'Green';
        placedTokens[2][3] = 'Green';
        placedTokens[3][3] = 'Green';
        placedTokens[4][3] = 'Green';
        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 1], ['Green', 1]]));
    });

    it('should count a horizontal sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[1][0] = 'Red';
        placedTokens[2][0] = 'Red';
        placedTokens[3][0] = 'Red';
        placedTokens[4][0] = 'Red';
        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 1]]));
    });

    it('should count a vertical sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[0][1] = 'Red';
        placedTokens[0][2] = 'Red';
        placedTokens[0][3] = 'Red';
        placedTokens[0][4] = 'Red';
        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 1]]));
    });

    it('should count an increasing diagonal sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[1][1] = 'Red';
        placedTokens[2][2] = 'Red';
        placedTokens[3][3] = 'Red';
        placedTokens[4][4] = 'Red';
        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 1]]));
    });

    it('should count a decreasing diagonal sequence that uses wilds', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[8][1] = 'Red';
        placedTokens[7][2] = 'Red';
        placedTokens[6][3] = 'Red';
        placedTokens[5][4] = 'Red';
        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 1]]));
    });

    it('should count sequences that intersect', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[2][1] = 'Red';
        placedTokens[3][2] = 'Red';
        placedTokens[4][3] = 'Red';
        placedTokens[5][4] = 'Red';
        placedTokens[6][5] = 'Red';

        placedTokens[2][4] = 'Red';
        placedTokens[3][4] = 'Red';
        placedTokens[4][4] = 'Red';
        // 5, 4 handled above
        placedTokens[6][4] = 'Red';

        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 2]]));
    });

    it('should count the line 9 tile sequence as two', function () {
        const placedTokens = makeEmptyPlacedTokens();
        placedTokens[0][2] = 'Red';
        placedTokens[1][2] = 'Red';
        placedTokens[2][2] = 'Red';
        placedTokens[3][2] = 'Red';
        placedTokens[4][2] = 'Red';
        placedTokens[5][2] = 'Red';
        placedTokens[6][2] = 'Red';
        placedTokens[7][2] = 'Red';
        placedTokens[8][2] = 'Red';
        expect(countSequences(placedTokens)).toEqual(new Map([['Red', 2]]));
    });
});