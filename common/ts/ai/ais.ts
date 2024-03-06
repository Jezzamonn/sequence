import { AIInterface } from './ai-interface';
import { ClusterAI } from './cluster';
import { MakeLinesAI } from './make-lines';
import { PreferCornersAI } from './prefer-corners';
import { PreferEdgesAI } from './prefer-edges';
import { PreferMiddleAI } from './prefer-middle';
import { RandomAI } from './random';

interface AIInfo {
    name: string;
    factory: () => AIInterface;
}

const baseAIs: AIInfo[] = [
    { name: 'Random', factory: () => new RandomAI() },
    { name: 'Cluster', factory: () => new ClusterAI() },
    { name: 'PreferEdges', factory: () => new PreferEdgesAI() },
    { name: 'PreferMiddle', factory: () => new PreferMiddleAI() },
    { name: 'PreferCorners', factory: () => new PreferCornersAI() },
];

export const allAIs: AIInfo[] = [];

allAIs.push(...baseAIs);

for (const baseAI of baseAIs) {
    allAIs.push({
        name: `MakeLines_${baseAI.name}`,
        factory: () => new MakeLinesAI(baseAI.factory()),
    });
}