import { ElementHandle, Page } from 'puppeteer';
import { NameEntryPageObject } from '../joining/name-entry-po';
import { SettingsModalPageObject } from './settings-modal-po';

export class GameDisplayPageObject {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async ensureLoaded(): Promise<void> {
        await this.page.waitForSelector('::-p-aria(Settings)');
    }

    async openSettings(): Promise<SettingsModalPageObject> {
        await this.page.click('::-p-aria(Settings)');
        const settingsModalPO = new SettingsModalPageObject(this.page);
        await settingsModalPO.ensureLoaded();
        return settingsModalPO;
    }

    async assertSwitchedToGame(): Promise<NameEntryPageObject> {
        const nameEntryPO = new NameEntryPageObject(this.page);
        await nameEntryPO.ensureLoaded();
        return nameEntryPO;
    }

    async getPlayerCards(): Promise<ElementHandle<Element>[]> {
        const cardElement = await this.page.$('>>> player-hand');
        const cards = cardElement?.$$('>>> .card-image');
        return cards ?? [];
    }
}
