import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Color, allColors } from '../../../../common/ts/board';
import { Player } from '../../../../common/ts/players';
import { connection } from '../../connection';

const localStoragePrefix = 'sequence';

@customElement('name-entry')
export class NameEntry extends LitElement {
    @property({ type: String })
    accessor name = '';

    @property({ type: String })
    accessor quest = '';

    @property({ type: String })
    accessor color: Color | undefined;

    @property({ type: Array })
    accessor joinedPlayers: Player[] = [];

    @property({ type: Boolean })
    accessor joined = false;

    @property({ type: Boolean })
    accessor autoJoin = false;

    @state()
    private _nameValid = true;
    @state()
    private _colorValid = true;

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
    `;

    constructor() {
        super();

        this.loadFromLocalStorage();
    }

    updated() {
        if (this.autoJoin && !this.joined) {
            this.handleJoinGame();
        }
    }

    render() {
        const joinedPlayers = this.joinedPlayers.map(
            (player) => html`
                <joined-player
                    name=${player.name}
                    quest=${player.quest}
                    color=${player.color}
                ></joined-player>
            `
        );

        return html`
            <h1>Online Sequence</h1>
            <label
                class="label ${this._nameValid ? '' : 'invalid'}"
                for="name-input"
                >What is your name:</label
            >
            <input
                id="name-input"
                class="input"
                type="text"
                .disabled=${this.joined}
                .value=${this.name}
                @input=${(event: Event) => {
                    const input = event.target as HTMLInputElement;
                    this.name = input.value;
                    this.saveToLocalStorage();
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
                        this.color = 'blue'
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
                            this.color = 'green'
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
                            this.color = 'red'
                            this.saveToLocalStorage();
                            this.updateIfJoined();
                        }}
                >
                    <token-marker color="red"></token-marker>
                </button>
            </div>
            <hr />
            <button
                class="large-button"
                @click=${this.handleJoinGame}
            >
                Join
            </button>
            <hr />
            <h2>Joined players:</h2>
            <div class="joined-players">
                ${joinedPlayers}
            </div>
            <button
                class="large-button"
                .disabled=${!this.joined}
                @click=${this.handleStartGame}>
                Start
            </button>
        `;
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
        }
        else {
            this.color = undefined;
        }
    }

    validateInput() {
        this._nameValid = this.name.trim() !== '';
        this._colorValid = this.color !== undefined;
    }

    async handleJoinGame() {
        this.validateInput();
        if (this.name.trim() === '' || this.color === undefined) {
            return;
        }

        const result = await connection.join({
            name: this.name,
            quest: this.quest.trim() == '' ? undefined : this.quest.trim(),
            color: this.color,
        });
        if (result.error != undefined) {
            this.dispatchEvent(
                new CustomEvent<string>('notify', {
                    detail: result.error,
                })
            );
            return;
        }

        this.joined = true;
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

        const result = await connection.startGame();
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
