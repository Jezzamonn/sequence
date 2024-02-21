export interface Point {
    x: number;
    y: number;
}

// Helper functions for poitns
export const Points = {

    add(a: Point, b: Point): Point {
        return { x: a.x + b.x, y: a.y + b.y };
    },

    rotateRight(p: Point): Point {
        return { x: -p.y, y: p.x }
    },

    inRange(p: Point, min: Point, max: Point): boolean {
        return p.x >= min.x && p.y >= min.y && p.x <= max.x && p.y <= max.y;
    },

    toString(p: Point | undefined): string {
        if (p === undefined) {
            return 'undefined';
        }
        return `(${p.x}, ${p.y})`;
    }

};
