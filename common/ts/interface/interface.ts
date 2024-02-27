export interface CommandResult {
    error?: string;
}

export const Command = {
    join: 'join',
    start: 'start',
    makeMove: 'makeMove',
    gameState: 'gameState',
    playersState: 'playersState',
};

export type CommandCallback = (result: CommandResult) => void;
