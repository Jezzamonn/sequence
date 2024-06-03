import { GameDisplayPageObject } from '../../client/ts/components/game/game-display-po';
import { TestCommon, waitForConnect, waitForDisconnect } from './test-common';


describe('with a single player when game has started', () => {
    const common = new TestCommon();

    let gamePO: GameDisplayPageObject;


    beforeEach(async () => {
        await common.startServer();
        await common.startProxy();

        let nameEntryPO = await common.newBrowser();

        await nameEntryPO.enterName('test player');
        await nameEntryPO.selectColor('blue');

        await nameEntryPO.clickJoin();
        gamePO = await nameEntryPO.clickStart();
    });

    afterEach(() => common.cleanUp());

    it('allows the game to be stopped', async () => {
        let settingsPO = await gamePO.openSettings();
        await settingsPO.endGame();
    });

    it('has cards', async () => {
        let cards = await gamePO.getPlayerCards();
        expect(cards.length).toBeGreaterThan(0);
    });

    it(`still has cards after network reconnect`, async () => {
        const disconnectPromise = waitForDisconnect(gamePO.page);
        await common.shutdownProxy();
        await disconnectPromise;

        const reconnectPromise = waitForConnect(gamePO.page);
        await common.startProxy();
        await reconnectPromise;

        let cards = await gamePO.getPlayerCards();
        expect(cards.length).toBeGreaterThan(0);
    });
});
