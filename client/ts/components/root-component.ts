import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PlayerVisibleGameState } from '../../../common/ts/game';
import { Player } from '../../../common/ts/players';
import { toSentenceCase, wait } from '../../../common/ts/util';
import { connection } from '../connection';
import { NameEntry } from './joining/name-entry';

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
                const nameEntry = this.shadowRoot?.querySelector(
                    'name-entry'
                ) as NameEntry | undefined;

                // If we were on the name entry page, switch to the game UI when we receive the
                // game state. Exceptions:
                // - If we haven't joined yet (so we're not part of the game).
                // - If the game is over, stay there too so a new game can be started.
                if (
                    state.gameWinner == undefined &&
                    nameEntry &&
                    nameEntry.joined
                ) {
                    this._state = 'game';
                }

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
                            audio.volume = 0.1;
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
        // Only show on going players if the game isn't won.
        const ongoingPlayers =
            this._gameState?.gameWinner == undefined
                ? this._gameState?.players ?? []
                : [];

        if (this._state === 'nameEntry') {
            mainElem = html`<name-entry
                .joinedPlayers=${this._players}
                .ongoingGamePlayers=${ongoingPlayers}
                .autoJoin=${this._gameState != undefined &&
                this._gameState.gameWinner == undefined}
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
