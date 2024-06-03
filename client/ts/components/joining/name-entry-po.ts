import { Page } from 'puppeteer';
import { GameDisplayPageObject } from '../game/game-display-po';

export class NameEntryPageObject {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async ensureLoaded(): Promise<void> {
        await this.page.waitForSelector('::-p-text(Online Sequence)');
    }

    async enterName(name: string): Promise<void> {
        await this.page.type('>>> #name-input', name);
    }

    async selectColor(color: string): Promise<void> {
        await this.page.click(`>>> token-marker[color="${color}"]`);
    }

    async clickJoin(): Promise<void> {
        await this.page.click('::-p-text(Join)');
        await this.page.waitForNetworkIdle();
    }

    async clickStart(): Promise<GameDisplayPageObject> {
        await this.page.waitForSelector('::-p-text(Start)');
        await this.page.click('::-p-text(Start)');
        await this.page.waitForNetworkIdle();

        const gameDisplayPO = new GameDisplayPageObject(this.page);
        await gameDisplayPO.ensureLoaded();
        return gameDisplayPO;
    }

    /**
     * Assumes the game already switched to the game display page.
     */
    async assertSwitchedToGame(): Promise<GameDisplayPageObject> {
        await this.page.waitForNetworkIdle();
        const gameDisplayPO = new GameDisplayPageObject(this.page);
        await gameDisplayPO.ensureLoaded();
        return gameDisplayPO;
    }

    async assertHasPlayer(name: string): Promise<void> {
        await this.page.waitForSelector(`::-p-text(${name})`);
    }
}