import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Color, allColors } from '../../../../common/ts/board';
import { Player } from '../../../../common/ts/players';
import { connection, localStoragePrefix } from '../../connection';

@customElement('name-entry')
export class NameEntry extends LitElement {
    static styles = css`
        :host {
            background: #ffffff99;
            border-radius: 20px;
            padding: 20px 50px;
            margin: 20px;
        }

        .token-row {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .token-button {
            width: 50px;
            height: 50px;
            cursor: pointer;
            border: none;
            margin: 0 5px;
            padding: 0;
            background: none;
        }

        .token-button.selected {
            outline: 3px solid black;
            transform: scale(1.1);
        }

        .label {
            display: block;
            text-align: center;
            margin-top: 30px;
            margin-bottom: 7px;
        }

        .label.invalid {
            color: red;
        }

        .input {
            display: block;
            margin: auto;
        }

        hr {
            border: 0;
            height: 1px;
            margin: 30px 0;
            background: #00000033;
        }

        .large-button {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            font-size: 18px;
        }

        joined-player {
            margin: 10px 0;
        }
    `;

    @property({ type: String })
    accessor name = '';

    @property({ type: String })
    accessor quest = '';

    @property({ type: String })
    accessor color: Color | undefined;

    @property({ type: Array })
    accessor joinedPlayers: Player[] = [];

    @property({ type: Array })
    accessor ongoingGamePlayers: Player[] = [];

    @property({ type: Boolean })
    accessor joined = false;

    @property({ type: Boolean })
    accessor autoJoin = false;

    @state()
    private _nameValid = true;
    @state()
    private _colorValid = true;

    get inputsValid(): boolean {
        return this.name.trim() !== '' && this.color != undefined;
    }

    constructor() {
        super();

        this.loadFromLocalStorage();
    }

    updated() {
        this.calculateJoinedState();
        if (this.autoJoin && !this.joined && this.inputsValid) {
            this.handleJoinGame();
        }
    }

    render() {
        const sections: TemplateResult[] = [];

        const entry = html` <h1>Online Sequence</h1>
            <label
                class="label ${this._nameValid ? '' : 'invalid'}"
                for="name-input"
                >What is your name:</label
            >
            <input
                id="name-input"
                class="input"
                type="text"
                .value=${this.name}
                @input=${(event: Event) => {
                    const input = event.target as HTMLInputElement;
                    this.name = input.value;
                    this.saveToLocalStorage();
                    this.updateIfJoined();
                }}
            />
            <label class="label" for="quest-input">What is your quest:</label>
            <input
                id="quest-input"
                class="input"
                type="text"
                placeholder="To play sequence"
                .value=${this.quest}
                @input=${(event: Event) => {
                    const input = event.target as HTMLInputElement;
                    this.quest = input.value;
                    this.saveToLocalStorage();
                    this.updateIfJoined();
                }}
            />
            <label class="label ${this._colorValid ? '' : 'invalid'}"
                >What is your favourite color:</label
            >
            <div class="token-row">
                <button
                    class="token-button ${this.color === 'blue'
                        ? 'selected'
                        : ''}"
                    @click=${() => {
                        this.color = 'blue';
                        this.saveToLocalStorage();
                        this.updateIfJoined();
                    }}
                >
                    <token-marker color="blue"></token-marker>
                </button>

                <button
                    class="token-button ${this.color === 'green'
                        ? 'selected'
                        : ''}"
                    @click=${() => {
                        this.color = 'green';
                        this.saveToLocalStorage();
                        this.updateIfJoined();
                    }}
                >
                    <token-marker color="green"></token-marker>
                </button>
                <button
                    class="token-button ${this.color === 'red'
                        ? 'selected'
                        : ''}"
                    @click=${() => {
                        this.color = 'red';
                        this.saveToLocalStorage();
                        this.updateIfJoined();
                    }}
                >
                    <token-marker color="red"></token-marker>
                </button>
            </div>`;
        sections.push(entry);
        if (!this.joined) {
            const joinButton = html`
                <hr />
                <button class="large-button" @click=${this.handleJoinGame}>
                    Join
                </button>
            `;
            sections.push(joinButton);
        }

        if (this.ongoingGamePlayers.length > 0) {
            const ongoingGame = html`
                <hr />
                <h2>Ongoing game:</h2>
                <div class="joined-players">
                    ${this.ongoingGamePlayers.map(
                        (player) => html`
                            <joined-player
                                name=${player.name}
                                quest=${player.quest}
                                color=${player.color}
                            ></joined-player>
                        `
                    )}
                </div>
            `;
            sections.push(ongoingGame);
        }

        if (this.joinedPlayers.length > 0) {
            const joinedPlayers = html`
                <hr />
                <h2>Joined players:</h2>
                <div class="joined-players">
                    ${this.joinedPlayers.map(
                        (player) => html`
                            <joined-player
                                @remove-player=${() => {
                                    connection.removePlayer(player.id);
                                }}
                                name=${player.name}
                                quest=${player.quest}
                                color=${player.color}
                                canRemove
                            ></joined-player>
                        `
                    )}
                </div>
                <button
                    class="large-button"
                    .disabled=${!this.joined}
                    @click=${this.handleStartGame}
                >
                    Start game with ${this.joinedPlayers.length}
                    player${this.joinedPlayers.length == 1 ? '' : 's'}
                </button>
            `;
            sections.push(joinedPlayers);
        }
        return sections;
    }

    saveToLocalStorage() {
        localStorage.setItem(`${localStoragePrefix}-name`, this.name);
        localStorage.setItem(`${localStoragePrefix}-quest`, this.quest);
        localStorage.setItem(`${localStoragePrefix}-color`, this.color ?? '');
    }

    loadFromLocalStorage() {
        this.name = localStorage.getItem(`${localStoragePrefix}-name`) ?? '';
        this.quest = localStorage.getItem(`${localStoragePrefix}-quest`) ?? '';
        const savedColor = localStorage.getItem(`${localStoragePrefix}-color`);
        if (allColors.includes(savedColor as any)) {
            this.color = savedColor as Color;
        } else {
            this.color = undefined;
        }

        this.calculateJoinedState();
    }

    validateInput() {
        this._nameValid = this.name.trim() !== '';
        this._colorValid = this.color != undefined;
    }

    calculateJoinedState() {
        this.joined = this.joinedPlayers.some(
            (player) => player.id == connection.id
        );
    }

    async handleJoinGame() {
        this.validateInput();
        if (!this.inputsValid) {
            return;
        }

        const result = await connection.joinGame({
            id: 'Unused',
            name: this.name,
            quest: this.quest.trim() == '' ? undefined : this.quest.trim(),
            color: this.color!,
        });
        if (result.error != undefined) {
            this.dispatchEvent(
                new CustomEvent<string>('notify', {
                    detail: result.error,
                })
            );
            return;
        }

        this.calculateJoinedState();
    }

    async updateIfJoined() {
        if (!this.joined) {
            return;
        }
        await this.handleJoinGame();
    }

    async handleStartGame() {
        if (!this.joined) {
            return;
        }

        const result = await connection.startGame(true);
        if (result.error != undefined) {
            this.dispatchEvent(
                new CustomEvent<string>('notify', {
                    detail: result.error,
                })
            );
            return;
        }
    }
}

export interface StartGameEventParams {
    name: string;
    color: string;
}
