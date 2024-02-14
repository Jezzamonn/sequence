import { Card } from '../../common/cards';
import { Point } from '../../common/point';

// Make this a module, needed for the global augmentation to work.
export {};

// Following https://github.com/microsoft/TypeScript/issues/28357
declare global {
    interface HTMLElementEventMap {
        'card-click': CustomEvent<[Card, number]>;
        'board-position-click': CustomEvent<Point>;
    }
}
