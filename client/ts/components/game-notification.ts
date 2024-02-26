import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("game-notification")
export class GameNotification extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: fixed;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #fff;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 5px black;
            animation: slide-down 0.5s ease-out forwards;
            font-size: 18px;
        }

        @keyframes slide-down {
            0% {
                top: -100px;
            }
            100% {
                top: 20px;
            }
        }
    `;

    connectedCallback() {
        super.connectedCallback();
        setTimeout(() => {
            this.remove();
        }, 5000);
    }

    render() {
        return html`
            <slot></slot>
        `;
    }
}
