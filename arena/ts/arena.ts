import { AIInterface } from '../../common/ts/ai/ai-interface';
import { AIInfo, allAIs } from '../../common/ts/ai/ais';
import { GameManager } from '../../common/ts/game';

export enum GameWinner {
    First = 1,
    Second = 0,
    Tie = 0.5,
}

export function playGame(ai1: AIInterface, ai2: AIInterface): GameWinner {
    const aisByName: { [key: string]: AIInterface } = {
        AI1: ai1,
        AI2: ai2,
    };
    const game = new GameManager(
        [
            {
                name: 'AI1',
                color: 'red',
            },
            {
                name: 'AI2',
                color: 'blue',
            },
        ],
        Math.random
    );

    const maxMoves = 52 * 4;
    for (let i = 0; i < maxMoves && game.state.gameWinner == undefined; i++) {
        const playerIndex = game.state.nextPlayerIndex;
        const player = game.state.players[playerIndex];
        const ai = aisByName[player.name];
        const moves = game.getMovesForPlayer(playerIndex);
        const state = game.getStateForPlayer(playerIndex);
        const move = ai.makeMove(moves, state);
        game.makeMove(playerIndex, move.card, move.position);
    }

    if (game.state.gameWinner == 'red') {
        return GameWinner.First;
    }
    if (game.state.gameWinner == 'blue') {
        return GameWinner.Second;
    }
    return GameWinner.Tie;
}

export function playMatches(players: AIInfo[], onResult: (name1: string, name2: string, result: GameWinner) => void): void {
    const numPairs = (allAIs.length * (allAIs.length - 1)) / 2;
    // const numPairsStr = numPairs.toString();

    const matchesPerPlayer = 15;
    const totalMatches = players.length * matchesPerPlayer;
    const numMatchesPerPair = Math.ceil(totalMatches / numPairs);

    for (let i = 0; i < allAIs.length; i++) {
        for (let j = i + 1; j < allAIs.length; j++) {
            const aiInfo1 = players[i];
            const aiInfo2 = players[j];
            // const matchStr = matchNum.toString().padStart(numPairsStr.length);
            // `[${matchStr}/${numPairsStr}] Playing ${aiInfo1.name} vs ${aiInfo2.name}`
            for (let k = 0; k < numMatchesPerPair; k++) {
                const winner = playGame(
                    aiInfo1.factory(),
                    aiInfo2.factory()
                );
                onResult(aiInfo1.name, aiInfo2.name, winner);
            }
        }
    }
}
