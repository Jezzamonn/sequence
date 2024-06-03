import { GameDisplayPageObject } from '../../client/ts/components/game/game-display-po';
import { TestCommon } from './test-common';


describe('with multiple players during game', () => {
    const common = new TestCommon();

    let gamePO1: GameDisplayPageObject;
    let gamePO2: GameDisplayPageObject;

    beforeEach(async () => {
        await common.startServer();

        var nameEntryPO1 = await common.newBrowser();
        var nameEntryPO2 = await common.newBrowser();

        await nameEntryPO1.enterName('test player 1');
        await nameEntryPO1.selectColor('blue');
        await nameEntryPO1.clickJoin();

        await nameEntryPO2.enterName('test player 2');
        await nameEntryPO2.selectColor('red');
        await nameEntryPO2.clickJoin();

        await nameEntryPO1.page.waitForNetworkIdle();
        gamePO1 = await nameEntryPO1.clickStart();

        await nameEntryPO2.page.waitForNetworkIdle();
        gamePO2 = await nameEntryPO2.assertSwitchedToGame();
    });

    afterEach(() => common.cleanUp());

    it('should allow the game to be stopped', async () => {
        let settingsPO1 = await gamePO1.openSettings();
        let secondNameEntryPO1 = await settingsPO1.endGame();
        let secondNameEntryPO2 = await gamePO2.assertSwitchedToGame();

        // After stopping, the players should still be joined.
        await secondNameEntryPO1.assertHasPlayer('test player 1');
        await secondNameEntryPO1.assertHasPlayer('test player 2');
        await secondNameEntryPO2.assertHasPlayer('test player 1');
        await secondNameEntryPO2.assertHasPlayer('test player 2');
    });

    it('should join the game for player players after stopping and starting', async () => {
        let settingsPO1 = await gamePO1.openSettings();
        let secondNameEntryPO1 = await settingsPO1.endGame();
        let secondNameEntryPO2 = await gamePO2.assertSwitchedToGame();

        // Starting the game again should start it for both players, without rejoining.
        let secondGamePO1 = await secondNameEntryPO1.clickStart();
        let secondGamePO2 = await secondNameEntryPO2.assertSwitchedToGame();
    });
});
