export interface CommandResult {
    error?: string;
}

// Sent from client -> server
export enum ClientCommand {
    joinRoom = 'joinRoom',
    joinGame = 'joinGame',
    start = 'start',
    makeMove = 'makeMove',
    endGame = 'endGame',
    removePlayer = 'removePlayer',
};

// Sent from server -> client
export enum ServerCommand {
    gameState = 'gameState',
    playersState = 'playersState',
    // Forces the client to refresh the page.
    refresh = 'refresh',
}


export type CommandCallback = (result: CommandResult) => void;
