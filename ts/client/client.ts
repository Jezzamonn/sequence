import { Card, allRanks, allSuits, suitToSymbol } from "../common/cards";
import { Point } from "../common/point";
import "./components/board-card";

console.log("Client <( Hello World! )");

// 10x10 2D array of cards
const board: (Card | undefined)[][] = createBoard();

// Now add the cards to the DOM
const boardElement = document.querySelector(".board")!;
for (const card of board.flat()) {
  const cardElement = document.createElement("board-card");
  cardElement.setAttribute("rank", card?.rank ?? "?");
  cardElement.setAttribute("suit", card?.suit ?? "?");
  boardElement.appendChild(cardElement);
}


function createBoard(): (Card | undefined)[][]{
  const board: (Card | undefined)[][] = [];

  for (let i = 0; i < 10; i++) {
    board[i] = [];
    for (let j = 0; j < 10; j++) {
      board[i][j] = undefined;
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

  // Add wilds in the corners
  board[0][0] = { suit: "Joker", rank: "Joker" };
  board[0][9] = { suit: "Joker", rank: "Joker" };
  board[9][9] = { suit: "Joker", rank: "Joker" };
  board[9][0] = { suit: "Joker", rank: "Joker" };

  const visited: Boolean[][] = [];
  for (let i = 0; i < 10; i++) {
    visited[i] = [];
    for (let j = 0; j < 10; j++) {
      visited[i][j] = false;
    }
  }

  // Loop around in a spiral and add the cards in order.
  let p: Point = new Point(0, 0);
  // Moving left
  let dir: Point = new Point(1, 0);
  let cardIndex = 0;
  const min = new Point(0, 0);
  const max = new Point(9, 9);
  while (true) {
    console.log(`p: ${p.x}, ${p.y}`)
    if (visited[p.y][p.x]) {
      break;
    }
    visited[p.y][p.x] = true;
    if (board[p.y][p.x] == undefined) {
      board[p.y][p.x] = cardOrder[cardIndex % cardOrder.length];
      cardIndex++;
    }

    const nextForward = p.add(dir);
    if (nextForward.inRange(min, max) && !visited[nextForward.y][nextForward.x]) {
      p = nextForward;
    } else {
      dir = dir.rotateRight();
      p = p.add(dir);
    }
  }

  console.log(board);

  return board;
}


