import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('settings-modal')
export class SettingsModal extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #00000099;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .modal {
            background: #fff;
            border-radius: 20px;
            padding: 20px 50px;
            margin: 20px;
            position: relative;
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

        .danger-button {
            background-color: #ff7878;
            color: #500;
        }

        .close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            font-size: 20px;
        }
    `;

    render() {
        return html`
            <div class="modal">
                <h2>Settings</h2>
                <hr />
                <button
                    class="large-button danger-button"
                    @click=${() =>
                        this.dispatchEvent(new CustomEvent<void>('end-game'))}
                >
                    End game for all players
                </button>
                <button
                    class="close-button"
                    @click=${() =>
                        this.dispatchEvent(new CustomEvent<void>('close'))}
                >
                    x
                </button>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementEventMap {
        close: CustomEvent<void>;
        'end-game': CustomEvent<void>;
    }
}
