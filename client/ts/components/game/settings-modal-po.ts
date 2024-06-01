import { Page } from 'puppeteer';
import { NameEntryPageObject } from '../joining/name-entry-po';

export class SettingsModalPageObject {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async ensureLoaded(): Promise<void> {
        await this.page.waitForSelector('::-p-text(End game for all players)');
    }

    async endGame(): Promise<NameEntryPageObject> {
        await this.page.click('::-p-text(End game for all players)');
        const nameEntryPO = new NameEntryPageObject(this.page);
        await nameEntryPO.ensureLoaded();
        return nameEntryPO;
    }
}
