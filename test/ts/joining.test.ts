import { TestCommon } from './test-common';


describe('joining test', () => {
    const common = new TestCommon();

    beforeEach(async () => {
        await common.startServer();
    });
    afterEach(() => common.cleanUp());

    it(`should show joined player on each player's screen`, async () => {
        var nameEntryPO1 = await common.newBrowser();
        var nameEntryPO2 = await common.newBrowser();

        await nameEntryPO1.enterName('test player 1');
        await nameEntryPO1.selectColor('blue');
        await nameEntryPO1.clickJoin();

        await nameEntryPO1.page.waitForNetworkIdle();

        await nameEntryPO1.assertHasPlayer('test player 1');
        await nameEntryPO2.assertHasPlayer('test player 1');

        await nameEntryPO2.enterName('test player 2');
        await nameEntryPO2.selectColor('red');
        await nameEntryPO2.clickJoin();

        await nameEntryPO1.page.waitForNetworkIdle();
        await nameEntryPO2.page.waitForNetworkIdle();

        await nameEntryPO1.assertHasPlayer('test player 2');
        await nameEntryPO2.assertHasPlayer('test player 2');
    });

    it(`should show all joined players when a new player joins`, async () => {
        var nameEntryPO1 = await common.newBrowser();
        var nameEntryPO2 = await common.newBrowser();

        await nameEntryPO1.enterName('test player 1');
        await nameEntryPO1.selectColor('blue');
        await nameEntryPO1.clickJoin();

        await nameEntryPO2.enterName('test player 2');
        await nameEntryPO2.selectColor('red');
        await nameEntryPO2.clickJoin();

        var nameEntryPO3 = await common.newBrowser();
        await nameEntryPO3.assertHasPlayer('test player 1');
        await nameEntryPO3.assertHasPlayer('test player 2');
    });
});
