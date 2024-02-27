import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Color } from "../../../../common/ts/board";

@customElement("joined-player")
export class JoinedPlayer extends LitElement {

    static styles = css`
        :host {
            display: flex;
            background-color: white;
            padding: 5px;
            border-radius: 10px;
            margin: 10px 0;
        }

        token-marker {
            width: 20px;
            height: 20px;
            margin-right: 5px;
        }

        .player-text {
            display: flex;
            flex-direction: column;
        }

        h3 {
            margin: 0;
            margin-bottom: 5px;
        }

        h3, p {
            margin: 0;
        }
    `

    @property({ type: String })
    accessor name: string = "";

    @property({ type: String })
    accessor quest: string = "";

    @property({ type: String })
    accessor color: Color | undefined;

    render() {
        return html`
            <token-marker .color=${this.color}></token-marker>
            <div class="player-text">
                <h3>${this.name}</h3>
                <p>Quest: ${this.quest}</p>
            </div>
        `;
    }
}