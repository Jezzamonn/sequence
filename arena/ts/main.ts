import { Glicko2, Player as Glicko2Player } from 'glicko2';
import { AIInfo, allAIs } from '../../common/ts/ai/ais';
import { GameWinner, playMatches } from './arena';
import { AIInfoAndRating, printRankingsTable } from './rating';

interface ExtraInfo {
    glickoPlayer: Glicko2Player;
    totalMatches: number;
    totalWins: number;
    totalTies: number;
}

async function main() {
    // // Test creating a worker
    // const worker = new Worker('./worker.ts');
    // worker.on('message', (msg: any) => {
    //     console.log(`Worker said: ${msg}`);
    // });
    // worker.postMessage('Hello from the main thread');

    // await wait(1000);

    const ratings = new Glicko2({
        tau: 0.1, // Lowering this because this game as a lot randomness.
        rating: 1500,
        rd: 200,
        vol: 0.06,
    });

    const extraInfo: { [key: string]: ExtraInfo } = {};

    for (const player of allAIs) {
        extraInfo[player.name] = {
            glickoPlayer: ratings.makePlayer(),
            totalMatches: 0,
            totalWins: 0,
            totalTies: 0,
        };
    }

    printRankingsTable(generatePlayerInfo(allAIs, extraInfo));

    for (var i = 0; i < 100; i++) {
        const matches: [Glicko2Player, Glicko2Player, number][] = [];
        playMatches(
            allAIs,
            (name1: string, name2: string, result: GameWinner) => {
                matches.push([
                    extraInfo[name1].glickoPlayer,
                    extraInfo[name2].glickoPlayer,
                    result,
                ]);

                if (result == GameWinner.First) {
                    extraInfo[name1].totalWins++;
                }
                else if (result == GameWinner.Second) {
                    extraInfo[name2].totalWins++;
                }
                else if (result == GameWinner.Tie) {
                    extraInfo[name1].totalTies++;
                    extraInfo[name2].totalTies++;
                }

                extraInfo[name1].totalMatches++;
                extraInfo[name2].totalMatches++;

                printRankingsTable(generatePlayerInfo(allAIs, extraInfo));

                // // Clear the line and print the new message.
                // process.stdout.clearLine(0);
                // process.stdout.cursorTo(0);
                // process.stdout.write(s);
            }
        );

        ratings.updateRatings(matches);

        printRankingsTable(
            generatePlayerInfo(allAIs, extraInfo)
        );
    }
}

function generatePlayerInfo(
    allAIs: AIInfo[],
    extraInfo: { [key: string]: ExtraInfo }
): AIInfoAndRating[] {
    return allAIs.map((ai) => ({
        ...ai,
        ...extraInfo[ai.name],
        winRate: extraInfo[ai.name].totalWins / extraInfo[ai.name].totalMatches,
        tieRate: extraInfo[ai.name].totalTies / extraInfo[ai.name].totalMatches,
    }));
}

main();
