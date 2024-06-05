import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Color } from '../../../../common/ts/board';

@customElement('joined-player')
export class JoinedPlayer extends LitElement {
    static styles = css`
        :host {
            display: flex;
            background-color: white;
            padding: 5px;
            border-radius: 10px;
        }

        token-marker {
            width: 20px;
            height: 20px;
            margin-right: 5px;
            margin-top: 5px;
        }

        .player-text {
            display: flex;
            flex-direction: column;
            margin-right: 8px;
        }

        h3 {
            margin: 0;
            margin-bottom: 5px;
        }

        h3,
        p {
            margin: 0;
        }

        p {
            font-size: 12px;
        }

        @media (max-aspect-ratio: 1/1) {
            .quest-collapsible {
                display: none;
            }
        }

        .remove-button {
            border: none;
            background: none;
            padding: 0;
            align-self: start;
            margin-left: auto;
        }

        .remove-button-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    `;

    @property({ type: String })
    accessor name: string = '';

    @property({ type: String })
    accessor quest: string | undefined = '';

    @property({ type: String })
    accessor color: Color | undefined;

    @property({ type: Boolean })
    accessor canCollapse: boolean = false;

    @property({ type: Boolean })
    accessor canRemove: boolean = false;

    get questOrDefault() {
        if (this.quest != undefined && this.quest.trim() != '') {
            return this.quest;
        }
        return 'To play sequence';
    }

    render() {
        const questClass = this.canCollapse ? 'quest-collapsible' : nothing;
        return html`
            <token-marker .color=${this.color}></token-marker>
            <div class="player-text">
                <h3>${this.name}</h3>
                <p class=${questClass}>Quest: ${this.questOrDefault}</p>
            </div>
            ${this.canRemove
                ? html`
                      <button
                          class="remove-button"
                          @click=${() => {
                              this.dispatchEvent(
                                  new CustomEvent<string>('remove-player', {
                                      detail: this.name,
                                      bubbles: true,
                                      composed: true,
                                  })
                              );
                          }}
                      >
                          <img
                              class="remove-button-image"
                              src="/img/delete.svg"
                          />
                      </button>
                  `
                : nothing}
        `;
    }
}

declare global {
    interface HTMLElementEventMap {
        'remove-player': CustomEvent<string>;
    }
}
