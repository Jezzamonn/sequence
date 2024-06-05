import { GameManager } from './game';

describe('GameManager', function () {
    describe('4 player game', function () {
        let gameManager: GameManager;

        beforeEach(function () {
            gameManager = new GameManager([
                {
                    id: 'Player 1',
                    name: 'Player 1',
                    color: 'red'
                },
                {
                    id: 'Player 2',
                    name: 'Player 2',
                    color: 'blue'
                },
                {
                    id: 'Player 3',
                    name: 'Player 3',
                    color: 'red'
                },
                {
                    id: 'Player 4',
                    name: 'Player 4',
                    color: 'blue'
                }
            ], () => 0);
        });

        it('should have 4 players', function () {
            expect(gameManager.state.players.length).toBe(4);
        });

        it('should have player 1 go first', function () {
            expect(gameManager.state.nextPlayerIndex).toBe(0);
        });

        it('should return player state for player 1', function () {
            const playerState = gameManager.getStateForPlayer(0);
            // Well pull from the end of the deck. With the shuffle as is, the
            // deck will end with a 2 of spades but otherwise match the allCards
            // order.
            expect(playerState.hand).toIncludeSameMembers([
                { suit: 'Hearts', rank: 'A' },
                { suit: 'Hearts', rank: 'K' },
                { suit: 'Hearts', rank: 'Q' },
                { suit: 'Hearts', rank: 'J' },
                { suit: 'Hearts', rank: '10' },
                { suit: 'Spades', rank: '2' },
            ]);
            expect(playerState.deckSize).toBe(52 + 52 - 6 * 4);
            expect(playerState.nextPlayerIndex).toBe(0);
            expect(playerState.gameWinner).toBeUndefined();
        });

        it('should allow player 1 to play a card', function () {
            gameManager.makeMove(
                0,
                { suit: 'Hearts', rank: 'A' },
                { x: 5, y: 1 }
            );
        });

        it('should complain if player 1 tries to play a card in the wrong place', function () {
            expect(() =>
                gameManager.makeMove(
                    0,
                    { suit: 'Hearts', rank: 'A' },
                    { x: 5, y: 2 }
                )
            ).toThrow(Error);
        });

        it("should complain if player 1 tries to play a card they don't have", function () {
            expect(() =>
                gameManager.makeMove(
                    0,
                    { suit: 'Clubs', rank: 'A' },
                    { x: 0, y: 8 }
                )
            ).toThrow(Error);
        });

        it('should complain if player 1 tries to discard a card they can play', function () {
            expect(() =>
                gameManager.makeMove(
                    0,
                    { suit: 'Hearts', rank: 'A' },
                    undefined
                )
            ).toThrow(Error);
        });

        it('should complain if player 2 tries to play', function () {
            expect(() =>
                gameManager.makeMove(
                    1,
                    { suit: 'Hearts', rank: '9' },
                    undefined
                )
            ).toThrow(Error);
        });
    });
});
