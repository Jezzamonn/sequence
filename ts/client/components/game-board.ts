import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { boardLayout } from "../../common/board";

@customElement("game-board")
export class GameBoardElement extends LitElement {
  // Styles
  static styles = [
    // language=CSS
    css`
      :host {
        max-width: 100%;
        max-height: 100%;

        display: grid;
        grid-template-columns: repeat(10, auto);
      }

      .card {
        position: relative;

        margin: 0.25cqw 0.25cqh;

        max-width: 9.5cqw;
        max-height: 9.5cqh;
      }
      `
    ];

  render() {
    return boardLayout.flat().map(c => html`<board-card class="card" rank="${c.rank}" suit="${c.suit}"></board-card>`)
  }
}
