import { AIInterface } from './ai-interface';
import { BlockingAI } from './blocking';
import { ClusterAI } from './cluster';
import { MakeLinesAI } from './make-lines';
import { PreferEdgesAI } from './prefer-edges';
import { PreferMiddleAI } from './prefer-middle';
import { RandomAI } from './random';
import { SaveTwoEyedJackAI } from './save-two-eyed';

type BaseAIConstructor = new () => AIInterface;
type CompositeAIConstructor = new (fallback: AIInterface) => AIInterface;

export interface AIInfo {
    name: string;
    factory: () => AIInterface;
}

function makeAIInfo(...constructors: [...CompositeAIConstructor[], BaseAIConstructor]): AIInfo {
    const name = constructors.map((c) => c.name).join('_');
    const factory = () => {
        let baseConstructor = constructors[constructors.length - 1] as BaseAIConstructor;
        let ai = new baseConstructor();
        for (let i = 1; i < constructors.length; i++) {
            ai = new constructors[i](ai);
        }
        return ai;
    };
    return { name, factory };
}

export const allAIs: AIInfo[] = [
    makeAIInfo(RandomAI),
    makeAIInfo(ClusterAI),
    makeAIInfo(PreferEdgesAI),
    makeAIInfo(PreferMiddleAI),
    makeAIInfo(MakeLinesAI, PreferMiddleAI),
    makeAIInfo(BlockingAI, PreferMiddleAI),
    makeAIInfo(BlockingAI, MakeLinesAI, PreferMiddleAI),
    makeAIInfo(SaveTwoEyedJackAI, PreferMiddleAI),
    makeAIInfo(SaveTwoEyedJackAI, BlockingAI, PreferMiddleAI),
];
