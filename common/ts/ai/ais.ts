import { AIInterface } from "./ai-interface";
import { ClusterAI } from "./cluster";
import { MakeLinesAI } from "./make-lines";
import { PreferCornersAI } from "./prefer-corners";
import { PreferEdgesAI } from "./prefer-edges";
import { PreferMiddleAI } from "./prefer-middle";
import { RandomAI } from "./random";

export const allAIs:  (new () => AIInterface)[] = [
    RandomAI,
    ClusterAI,
    PreferEdgesAI,
    PreferMiddleAI,
    PreferCornersAI,
    MakeLinesAI,
];