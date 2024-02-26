export interface CommandResult {
    error?: string;
}

export const Command = {
    join: 'join',
    start: 'start',
    makeMove: 'makeMove',
    gameState: 'gameState',
};

export type CommandCallback = (result: CommandResult) => void;
