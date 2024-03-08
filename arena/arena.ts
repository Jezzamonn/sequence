import { Glicko2, Player as GlickoPlayer } from 'glicko2';
import { AIInterface } from '../common/ts/ai/ai-interface';
import { allAIs } from '../common/ts/ai/ais';
import { GameManager } from '../common/ts/game';

enum GameWinner {
    First = 1,
    Second = 0,
    Tie = 0.5,
}

function playGame(ai1: AIInterface, ai2: AIInterface): GameWinner {
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

const ratings = new Glicko2({
    tau: 0.5,
    rating: 1500,
    rd: 200,
    vol: 0.06,
});

const players = allAIs.map((aiClass) => ({
    name: aiClass.name,
    factory: aiClass.factory,
    glickoPlayer: ratings.makePlayer(),
}));

const matches: [GlickoPlayer, GlickoPlayer, number][] = [];
const numPairs = (allAIs.length * (allAIs.length - 1)) / 2;
const numPairsStr = numPairs.toString();

const totalMatches = 1000;
const numMatchesPerPair = Math.ceil(totalMatches / numPairs);
console.log(`Matches per pair: ${numMatchesPerPair}`);

let matchNum = 1;
for (let i = 0; i < allAIs.length; i++) {
    for (let j = i + 1; j < allAIs.length; j++) {
        const aiInfo1 = players[i];
        const aiInfo2 = players[j];
        const matchStr = matchNum.toString().padStart(numPairsStr.length);
        console.log(
            `[${matchStr}/${numPairsStr}] Playing ${aiInfo1.name} vs ${aiInfo2.name}`
        );
        for (let k = 0; k < numMatchesPerPair; k++) {
            const winner = playGame(
                aiInfo1.factory(),
                aiInfo2.factory()
            );
            matches.push([
                aiInfo1.glickoPlayer,
                aiInfo2.glickoPlayer,
                winner,
            ]);
        }
        matchNum++;
    }
}
ratings.updateRatings(matches);

// Print out all the ratings in a nice ASCII table.

const rankingLength = 'Rank'.length;
const nameLength = players
    .map((p) => p.name.length)
    .reduce((a, b) => Math.max(a, b), 0);
const ratingLength = 6;
const rdLength = 6;

const header = [
    'Rank'.padEnd(rankingLength),
    'Name'.padEnd(nameLength),
    'Rating'.padEnd(ratingLength),
    'RD'.padEnd(rdLength),
].join(' | ');

const divider = '-'.repeat(header.length);

console.log('Ratings:');
console.log(divider);
console.log(header);
console.log(divider);

const aisByRating = players
    .slice()
    .sort((a, b) => b.glickoPlayer.getRating() - a.glickoPlayer.getRating());
for (const [i, { name, glickoPlayer }] of aisByRating.entries()) {
    console.log(
        [
            (i + 1).toString().padStart(rankingLength),
            name.padEnd(nameLength),
            glickoPlayer.getRating().toFixed(0).padStart(ratingLength),
            glickoPlayer.getRd().toFixed(1).padStart(rdLength),
        ].join(' | ')
    );
}
console.log(divider);
