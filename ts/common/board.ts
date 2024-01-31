import { Card, allRanks, allSuits } from "./cards";
import { Point } from "./point";

function* positionsInSpiralOrder(size: number): Generator<Point, void, undefined> {
  const visited: Boolean[][] = [];
  for (let i = 0; i < size; i++) {
    visited[i] = [];
    for (let j = 0; j < size; j++) {
      visited[i][j] = false;
    }
  }

  // Start at the top left
  let p: Point = new Point(0, 0);
  // Moving right
  let dir: Point = new Point(1, 0);
  const min = new Point(0, 0);
  const max = new Point(9, 9);
  while (true) {
    console.log(`p: ${p.x}, ${p.y}`)
    if (visited[p.y][p.x]) {
      break;
    }

    yield p

    visited[p.y][p.x] = true;

    const nextForward = p.add(dir);
    if (nextForward.inRange(min, max) && !visited[nextForward.y][nextForward.x]) {
      p = nextForward;
    } else {
      dir = dir.rotateRight();
      p = p.add(dir);
    }
  }
}

function createBoard(): Card[][]{
  const board: Card[][] = [];

  for (let i = 0; i < 10; i++) {
    board[i] = [];
    for (let j = 0; j < 10; j++) {
      board[i][j] = {suit: 'Joker', rank: 'Joker'};
    }
  }

  const withoutJacks = allRanks.filter(rank => rank != "J");
  const withoutJacksReversed = withoutJacks.slice().reverse();

  const cardOrder: Card[] = [];
  for (const suit of allSuits) {
    const inReverse = allSuits.indexOf(suit) >= 2;
    const ranks = inReverse ? withoutJacksReversed : withoutJacks;
    for (const rank of ranks) {
      cardOrder.push({ suit, rank });
    }
  }

  let cardIndex = 0;
  // Loop around in a spiral and add the cards in order.
  for (const p of positionsInSpiralOrder(10)) {
    // Skip the corners because they're meant to contain Jokers.
    if ((p.x == 0 || p.x == 9) && (p.y == 0 || p.y == 9)) {
      continue;
    }

    board[p.y][p.x] = cardOrder[cardIndex % cardOrder.length];
    cardIndex++;
  }

  return board;
}

export const boardLayout = createBoard();