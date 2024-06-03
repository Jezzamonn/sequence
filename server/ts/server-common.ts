import { CommandResult } from "../../common/ts/interface/interface";

export function logIfError(result: CommandResult): CommandResult {
    if (result.error != undefined) {
        console.warn(result.error);
    }
    return result;
}
