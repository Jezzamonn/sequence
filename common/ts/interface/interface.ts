export interface CommandResult {
    error?: string;
}

export const Command = {
    join: 'join',
    start: 'start',
    makeMove: 'makeMove',
    gameState: 'gameState',
    playersState: 'playersState',
    // Forces the client to refresh the page.
    refresh: 'refresh',
    endGame: 'endGame',
};

export type CommandCallback = (result: CommandResult) => void;
