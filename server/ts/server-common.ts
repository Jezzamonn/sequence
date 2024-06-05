import {
    CommandCallback,
    CommandResult,
} from '../../common/ts/interface/interface';

export function logIfError(result: CommandResult): CommandResult {
    if (result.error != undefined) {
        console.warn(result.error);
    }
    return result;
}

export function handleThrownError(e: unknown, callback: CommandCallback): void {
    if (e instanceof Error) {
        callback({ error: e.message });
        return;
    }
    console.error(e);
    callback({ error: `An unexpected error occurred: ${e}` });
}
