import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('name-entry')
export class NameEntry extends LitElement {
    @property({ type: String })
    accessor name = '';
    @property({ type: String })
    accessor color = '';

    @state()
    private _nameValid = true;
    @state()
    private _colorValid = true;

    static styles = css`
        :host {
            background: #ffffff99;
            border-radius: 20px;
            padding: 20px 50px;
        }

        .color-row {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .color-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: inline-block;
            cursor: pointer;
            border: none;
            margin: 0 5px;
        }

        .color-icon.selected {
            border: 3px solid black;
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

        .start-button {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            font-size: 18px;
        }
    `;

    render() {
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
                .value=${this.name}
                @input=${this.handleNameChange}
            />
            <label class="label" for="quest-input">What is your quest:</label>
            <input
                id="quest-input"
                class="input"
                type="text"
                placeholder="To play sequence"
            />
            <label class="label ${this._colorValid ? '' : 'invalid'}"
                >What is your favourite color:</label
            >
            <div class="color-row">
                <button
                    class="color-icon ${this.color === 'red' ? 'selected' : ''}"
                    style="background-color: red"
                    @click=${() => this.handleColorChange('red')}
                ></button>
                <button
                    class="color-icon ${this.color === 'green'
                        ? 'selected'
                        : ''}"
                    style="background-color: green"
                    @click=${() => this.handleColorChange('green')}
                ></button>
                <button
                    class="color-icon ${this.color === 'blue'
                        ? 'selected'
                        : ''}"
                    style="background-color: blue"
                    @click=${() => this.handleColorChange('blue')}
                ></button>
            </div>
            <hr />
            <button class="start-button" @click=${this.handleStartGame}>
                Start Game
            </button>
        `;
    }

    handleNameChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.name = input.value;
        this.dispatchEvent(
            new CustomEvent('name-change', { detail: this.name })
        );
    }

    handleColorChange(color: string) {
        this.color = color;
        this.dispatchEvent(
            new CustomEvent('color-change', { detail: this.color })
        );
    }

    validateInput() {
        this._nameValid = this.name.trim() !== '';
        this._colorValid = this.color.trim() !== '';
    }

    handleStartGame() {
        this.validateInput();
        if (!this._nameValid || !this._colorValid) {
            return;
        }

        this.dispatchEvent(
            new CustomEvent<StartGameEventParams>('start-game', {
                detail: {
                    name: this.name,
                    color: this.color,
                },
            })
        );
    }
}

export interface StartGameEventParams {
    name: string;
    color: string;
}
