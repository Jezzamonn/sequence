import { css, html, LitElement } from 'lit-element';
import { customElement, property } from 'lit/decorators.js';
import { Token } from '../../../common/ts/board';

const blueColor = '#00f';
const greenColor = '#1a3';
const redColor = '#f51';

@customElement('token-marker')
export class TokenMarker extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }

        .shape {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    `;

    @property({ type: String })
    accessor color: Token = undefined;

    render() {
        let shape;

        // TODO: Round these, for aesthetics.
        switch (this.color) {
            case 'blue':
                shape = html` <svg
                    class="shape"
                    viewBox="-50 -50 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle r="45" fill="${blueColor}" />
                </svg>`;
                break;
            case 'green':
                shape = html` <svg
                    class="shape"
                    viewBox="-50 -50 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g
                        fill="${greenColor}"
                        stroke="${greenColor}"
                        stroke-width="10"
                        stroke-linejoin="round"
                    >
                        <path d="M -40 -20 L 20 40 L 40 20 L -20 -40 Z" />
                        <path d="M -40 20 L 20 -40 L 40 -20 L -20 40 Z" />
                    </g>
                </svg>`;
                break;
            case 'red':
                shape = html`<svg
                    class="shape"
                    viewBox="-50 -45 100 90"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g
                        fill="${redColor}"
                        stroke="${redColor}"
                        stroke-width="10"
                        stroke-linejoin="round"
                    >
                        <path d="M 0 -35 L 40 35 L -40 35 Z" />
                    </g>
                </svg>`;
                break;
            default:
                shape = html``;
                break;
        }

        return html`${shape}`;
    }
}
