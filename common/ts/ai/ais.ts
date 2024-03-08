import { AIInterface } from './ai-interface';
import { ClusterAI } from './cluster';
import { MakeLinesAI } from './make-lines';
import { PreferCornersAI } from './prefer-corners';
import { PreferEdgesAI } from './prefer-edges';
import { PreferMiddleAI } from './prefer-middle';
import { RandomAI } from './random';
import { SaveOneEyedJackAI } from './save-one-eyed';
import { SaveTwoEyedJackAI } from './save-two-eyed';

interface AIInfo {
    name: string;
    factory: () => AIInterface;
}

interface CompositeAIInfo {
    name: string;
    factory: (fallback: AIInterface) => AIInterface;
}

const baseAIs: AIInfo[] = [
    { name: 'Random', factory: () => new RandomAI() },
    { name: 'Cluster', factory: () => new ClusterAI() },
    { name: 'PreferEdges', factory: () => new PreferEdgesAI() },
    { name: 'PreferMiddle', factory: () => new PreferMiddleAI() },
    { name: 'PreferCorners', factory: () => new PreferCornersAI() },
];

const compositeAIs: CompositeAIInfo[] = [
    { name: 'MakeLines', factory: (fallback) => new MakeLinesAI(fallback) },
    { name: 'SaveTwoEyed', factory: (fallback) => new SaveTwoEyedJackAI(fallback) },
    { name: 'SaveOneEyed', factory: (fallback) => new SaveOneEyedJackAI(fallback) },
];

export const allAIs: AIInfo[] = [];

allAIs.push(...baseAIs);

for (const compositeAI of compositeAIs) {
    for (const baseAI of baseAIs) {
        allAIs.push({
            name: `${compositeAI.name}_${baseAI.name}`,
            factory: () => compositeAI.factory(baseAI.factory()),
        });
    }

    // // Also add two levels of composite AIs.
    // for (const compositeAI2 of compositeAIs) {
    //     if (compositeAI2 === compositeAI) {
    //         continue;
    //     }
    //     for (const baseAI of baseAIs) {
    //         allAIs.push({
    //             name: `${compositeAI2.name}_${compositeAI.name}_${baseAI.name}`,
    //             factory: () => compositeAI2.factory(compositeAI.factory(baseAI.factory())),
    //         });
    //     }
    // }
}
