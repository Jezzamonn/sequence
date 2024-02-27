import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PlayerVisibleGameState } from '../../../common/ts/game';
import { connection } from '../connection';

@customElement('root-component')
export class RootComponent extends LitElement {
    static styles = css`
        :host {
            min-height: 100vh;
            width: 100vw;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    `;

    @state()
    private _state: 'nameEntry' | 'game' = 'nameEntry';

    @state()
    private _gameState: PlayerVisibleGameState | undefined;

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        connection.onGameState = (state: PlayerVisibleGameState) => {
            this._gameState = state;
            this._state = 'game';
        };
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        connection.onGameState = undefined;
    }

    render() {
        let mainElem: TemplateResult;
        if (this._state === 'nameEntry') {
            mainElem = html`<name-entry
                @notify=${(event: CustomEvent<string>) =>
                    this.notify(event.detail)}
            >
            </name-entry>`;
        } else {
            mainElem = html`<game-display
                .gameState=${this._gameState}
                @notify=${(event: CustomEvent<string>) =>
                    this.notify(event.detail)}
            ></game-display>`;
        }
        return html`
            ${mainElem}
            <div class="notification-container"></div>
        `;
    }

    notify(message: string) {
        const container = this.shadowRoot?.querySelector(
            '.notification-container'
        );
        if (!container) {
            return;
        }
        const notification = document.createElement('game-notification');
        notification.innerText = message;
        container.appendChild(notification);
    }
}
