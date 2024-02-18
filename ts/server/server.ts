import { boardToString, getMovesForPlayer } from "../common/board";
import { Card, cardToDescription } from "../common/cards";
import { GameManager } from "../common/game";
import { Server, Socket } from "socket.io";
import { Point, Points } from "../common/point";
import { MoveResult } from "../common/move-result";
import { validatePlayers } from "../common/players";
import { AIInterface } from "../common/ai/ai-interface";
import { RandomAI } from "../common/ai/random";
import { wait } from "../common/util";

console.log('Server <( Hello World! )');

const io = new Server();

type GameState = "joining" | "game";

let gameState: GameState = "joining";
let players: Socket[] = [];
let gameManager: GameManager | undefined = undefined;
let aiPlayers: (AIInterface | undefined)[] = [];

io.on("connection", (socket: Socket) => {
    console.log("A client has connected");

    if (gameState !== "joining") {
        socket.emit("error", "Game already started");
        socket.disconnect();
        return;
    }

    const playerIndex = players.length;
    players.push(socket);
    aiPlayers.push(undefined);

    // ----- Pre-joining commands -----

    function start(numPlayers: number, numTeams: number): MoveResult {
        if (gameState !== "joining") {
            console.error("Received start command when game already started");
            return { error: "Game already started" };
        }
        try {
            validatePlayers(numPlayers, numTeams);
            while (players.length < numPlayers) {
                aiPlayers.push(new RandomAI());
            }
            gameManager = new GameManager(numPlayers, numTeams, Math.random);
        }
        catch (e) {
            if (e instanceof Error) {
                return { error: e.message };
            }
            else {
                console.error(e);
                return { error: "An unknown error occurred" };
            }
        }
        return {};
    }

    socket.on("start", (numPlayers: number, numTeams: number, callback: (result: MoveResult) => null) => {
        callback(start(numPlayers, numTeams));
    });

    // TODO: Allow players to choose who is on what team.

    // TODO: Allow players to set their names.

    // In a separate function so we guarantee that MoveResult is returned.
    function makeMove(card: Card, position: Point | undefined): MoveResult {
        if (gameState !== "game") {
            return { error: "Game not started" };
        }
        if (gameManager === undefined) {
            return { error: "Internal error: game manager not initialized" };
        }

        try {
            gameManager.makeMove(playerIndex, card, position);
        }
        catch (e) {
            if (e instanceof Error) {
                return { error: e.message };
            }
            console.error(e);
            return { error: "An unknown error occurred" };
        }
        console.log(`Player ${playerIndex} made move: ${cardToDescription(card)} at ${position}`)
        console.log(boardToString(gameManager.state.placedTokens));

        // Do these asynchronously so that the result of the move is sent to the player first.
        wait(0).then(() => {
            sendGameState()
            // Not awaited.
            simulateAIPlayer();
        });

        return {};
    }

    socket.on("makeMove", (card: Card, position: Point | undefined, callback: (result: MoveResult) => void) => {
        callback(makeMove(card, position));
    });
});

function sendGameState() {
    if (gameManager === undefined) {
        throw new Error("Internal error: game manager not initialized");
    }
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const state = gameManager.getStateForPlayer(i);
        if (state === undefined) {
            continue;
        }
        player.emit("gameState", state);
    }
}

async function simulateAIPlayer() {
    if (gameManager === undefined) {
        throw new Error("Internal error: game manager not initialized");
    }

    const playerIndex = gameManager.state.nextPlayerIndex;
    const ai = aiPlayers[playerIndex];
    if (ai === undefined) {
        return;
    }

    await wait(1);

    const moves = gameManager.getMovesForPlayer(playerIndex);
    const state = gameManager.getStateForPlayer(playerIndex);
    const move = ai.makeMove(moves, state);
    gameManager.makeMove(playerIndex, move[0], move[1]);
    sendGameState()

    // Not awaited.
    simulateAIPlayer();
}

io.listen(3000);
console.log("Socket.io server listening on port 3000");