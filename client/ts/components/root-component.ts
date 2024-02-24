import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StartGameEventParams } from './joining/name-entry';
import { connection } from '../connection';

@customElement('root-component')
export class RootComponent extends LitElement {
    static styles = css`
        :host {
            height: 100vh;
            width: 100vw;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    `;

    @state()
    private _state: 'nameEntry' | 'game' = 'nameEntry';

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    render() {
        let mainElem: TemplateResult;
        if (this._state === 'nameEntry') {
            mainElem = html`<name-entry
                @start-game=${(event: CustomEvent<StartGameEventParams>) => 
                    this.startGame(event.detail.name, event.detail.color)}
            >
            </name-entry>`;
        } else {
            mainElem = html`<game-display
                @notify=${(event: CustomEvent<string>) => this.notify(event.detail)}
            ></game-display>`;
        }
        return html`
            ${mainElem}
            <div class="notification-container"></div>
        `;
    }

    async startGame(name: string, color: string) {
        await connection.startGame(2, 2);
        this._state = 'game';
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
