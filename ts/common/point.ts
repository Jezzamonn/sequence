export class Point {
    x: number = 0;
    y: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(other: Point) {
        return new Point(this.x + other.x, this.y + other.y);
    }

    rotateRight() {
        return new Point(-this.y, this.x);
    }

    inRange(min: Point, max: Point) {
        return this.x >= min.x && this.y >= min.y && this.x <= max.x && this.y <= max.y;
    }
}
