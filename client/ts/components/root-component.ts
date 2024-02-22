import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Connection } from '../connection';
import { PlayerVisibleGameState } from '../../../common/ts/game';
import { Card } from '../../../common/ts/cards';
import { Point } from '../../../common/ts/point';
import { GameDisplay } from './game/game-display';
import { MakeMoveEventParams } from './events';
import { StartGameEventParams } from './name-entry';

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

    connection: Connection;

    @state()
    private _state: 'nameEntry' | 'game' = 'nameEntry';

    @state()
    private _gameState: PlayerVisibleGameState | undefined = undefined;

    constructor() {
        super();
        this.connection = new Connection();
        this.connection.onGameState = (state) => {
            console.log('Received game state:', state);
            this._gameState = state;

            if (state.gameWinner != undefined) {
                console.log('Game winner:', state.gameWinner);
                this.notify(`${state.gameWinner} wins!`);
            }
        };
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
                .gameState=${this._gameState}
                @make-move=${(event: CustomEvent<MakeMoveEventParams>) =>
                    this.makeMove(event.detail.card, event.detail.position)}
            >
            </game-display>`;
        }
        return html`
            ${mainElem}
            <div class="notification-container"></div>
        `;
    }

    async startGame(name: string, color: string) {
        await this.connection.startGame(2, 2);
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

    async makeMove(card: Card, position: Point | undefined) {
        if (this.connection.requestInProgress) {
            return;
        }

        const moveResult = await this.connection.makeMove(card, position);
        const gameElem = this.shadowRoot?.querySelector(
            'game-display'
        ) as GameDisplay;
        if (!gameElem) {
            throw new Error('Game display has disappeared??');
        }
        if (moveResult.error != undefined) {
            this.notify(moveResult.error);
            return;
        }

        gameElem.selectedCard = undefined;
        gameElem.selectedCardIndex = undefined;
    }
}
