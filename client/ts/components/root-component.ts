import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PlayerVisibleGameState } from '../../../common/ts/game';
import { Player } from '../../../common/ts/players';
import { toSentenceCase, wait } from '../../../common/ts/util';
import { connection } from '../connection';

@customElement('root-component')
export class RootComponent extends LitElement {
    static styles = css`
        :host {
            min-height: 100vh;
            min-height: 100svh;
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

    @state()
    private _players: Player[] = [];

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        connection.onGameState = (
            state: PlayerVisibleGameState | undefined
        ) => {
            console.log('Game state:', state);

            if (state == undefined) {
                this._state = 'nameEntry';
            } else {
                // Switch to game state always.
                this._state = 'game';

                // Notifications and sound effects only happen when the game is
                // already going.
                if (this._gameState != undefined) {
                    if (
                        this._gameState.gameWinner == undefined &&
                        state.gameWinner != undefined
                    ) {
                        this.notify(
                            'Game over! ' +
                                toSentenceCase(state.gameWinner) +
                                ' wins!'
                        );
                    }

                    if (this._gameState.turnNumber != state.turnNumber) {
                        // Play sound effect.
                        const audio = new Audio('/sfx/chip1.mp3');
                        audio.play();
                    }

                    if (this._gameState.nextPlayerIndex != state.nextPlayerIndex &&
                        state.nextPlayerIndex == state.playerIndex) {
                        // Let the player know it's their time to shine
                        wait(0.8).then(() => {
                            const audio = new Audio('/sfx/ding.mp3');
                            audio.volume = 0.03;
                            audio.play();
                        });
                    }
                }
            }
            this._gameState = state;
        };
        connection.onPlayersState = (players: Player[]) => {
            this._players = players;
        };
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        connection.onGameState = undefined;
    }

    render() {
        let mainElem: TemplateResult;
        const ongoingPlayers = this._gameState?.players ?? [];

        if (this._state === 'nameEntry') {
            mainElem = html`<name-entry
                .joinedPlayers=${this._players}
                .ongoingGamePlayers=${ongoingPlayers}
                .autoJoin=${this._gameState != undefined}
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
