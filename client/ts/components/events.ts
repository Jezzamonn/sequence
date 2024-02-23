import { Card } from '../../../common/ts/cards';
import { Point } from '../../../common/ts/point';

// Make this a module, needed for the global augmentation to work.
export {};

export interface HandClickEventParams {
    card: Card;
    index: number;
    sourceEvent: MouseEvent;
}

export interface BoardClickEventParams {
    position: Point;
    sourceEvent: MouseEvent;
}

export interface MakeMoveEventParams {
    card: Card;
    position: Point | undefined;
}

// Following https://github.com/microsoft/TypeScript/issues/28357
declare global {
    interface HTMLElementEventMap {
        'card-click': CustomEvent<HandClickEventParams>;
        'board-position-click': CustomEvent<BoardClickEventParams>;
        'discard-click': CustomEvent<MouseEvent>;
        'make-move': CustomEvent<MakeMoveEventParams>;
        'notify': CustomEvent<string>;
    }
}

