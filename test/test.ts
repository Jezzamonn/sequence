import { ChildProcess, spawn } from 'child_process';
import puppeteer, { Browser } from 'puppeteer';
import { GameDisplayPageObject } from '../client/ts/components/game/game-display-po';
import { NameEntryPageObject } from '../client/ts/components/joining/name-entry-po';

const serverStartRegex = /Listening on port (\d+)/;

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
}
else {
    jest.setTimeout(60 * 1000); // 1 minute
}

const headless = true;


describe('Server Test', () => {
    let serverProcess: ChildProcess | undefined;
    let browsers: Browser[] = [];

    let port: number | undefined;

    async function newBrowser(): Promise<NameEntryPageObject> {
        const browser = await puppeteer.launch({headless});
        browsers.push(browser);

        const page = await browser!.newPage();
        page.setDefaultTimeout(5 * 1000); // 10 seconds

        await page.goto(`http://localhost:${port}`);

        const nameEntryPO = new NameEntryPageObject(page);
        await nameEntryPO.ensureLoaded();
        return nameEntryPO;
    }

    async function launchServer() {
        serverProcess = spawn(
            'npx',
            ['ts-node', 'server.ts', '--port', '0', '--randomSeed', 'test'],
            {
                cwd: '../server',
                shell: true,
            }
        );

        // Wait for the server to start
        const port = await new Promise<number>((resolve) => {
            serverProcess!.stdout!.on('data', (data: any) => {
                const match = serverStartRegex.exec(data.toString());
                if (match != null) {
                    resolve(parseInt(match[1]));
                }
            });
        });

        console.log(`Server started on port ${port}`);

        return port;
    }

    async function shutdownServer() {
        serverProcess?.kill();
        await new Promise<void>((resolve) => {
            serverProcess!.on('close', () => {
                resolve();
            });
        });
    }

    beforeEach(async () => {
        // Start the server process
        port = await launchServer();
    });

    afterEach(async () => {
        // Close Puppeteer
        for (const browser of browsers) {
            await browser.close();
        }

        await shutdownServer();

        port = undefined;
    });

    it('should open to the name entry page', async () => {
        const nameEntryPO = await newBrowser();

        await nameEntryPO.ensureLoaded();
    });

    describe('with a single player when the game is started', () => {
        let gamePO: GameDisplayPageObject;

        beforeEach(async () => {
            let nameEntryPO = await newBrowser();

            await nameEntryPO.enterName('test player');
            await nameEntryPO.selectColor('blue');

            await nameEntryPO.clickJoin();
            gamePO = await nameEntryPO.clickStart();
        });

        it('allows the game to be stopped', async () => {
            let settingsPO = await gamePO.openSettings();
            await settingsPO.endGame();
        });

        it('has cards', async () => {
            let cards = await gamePO.getPlayerCards();
            expect(cards.length).toBeGreaterThan(0);
        });

        it(`still has cards after network reconnect`, async () => {
            await gamePO.page.setOfflineMode(true);
            await gamePO.page.setOfflineMode(false);
            await gamePO.page.waitForNetworkIdle();

        });
    });

    it(`should show first joined player on each player's screen`, async () => {
        var nameEntryPO1 = await newBrowser();
        var nameEntryPO2 = await newBrowser();

        await nameEntryPO1.enterName('test player 1');
        await nameEntryPO1.selectColor('blue');
        await nameEntryPO1.clickJoin();

        await nameEntryPO1.page.waitForNetworkIdle();

        await nameEntryPO1.assertHasPlayer('test player 1');
        await nameEntryPO2.assertHasPlayer('test player 1');
    });

    it(`should show second joined player on each player's screen`, async () => {
        var nameEntryPO1 = await newBrowser();
        var nameEntryPO2 = await newBrowser();

        await nameEntryPO1.enterName('test player 1');
        await nameEntryPO1.selectColor('blue');
        await nameEntryPO1.clickJoin();

        await nameEntryPO2.enterName('test player 2');
        await nameEntryPO2.selectColor('red');
        await nameEntryPO2.clickJoin();

        await nameEntryPO1.page.waitForNetworkIdle();
        await nameEntryPO2.page.waitForNetworkIdle();

        await nameEntryPO1.assertHasPlayer('test player 2');
        await nameEntryPO2.assertHasPlayer('test player 2');
    });

    it(`should show all joined players when a new player joins`, async () => {
        var nameEntryPO1 = await newBrowser();
        var nameEntryPO2 = await newBrowser();

        await nameEntryPO1.enterName('test player 1');
        await nameEntryPO1.selectColor('blue');
        await nameEntryPO1.clickJoin();

        await nameEntryPO2.enterName('test player 2');
        await nameEntryPO2.selectColor('red');
        await nameEntryPO2.clickJoin();

        var nameEntryPO3 = await newBrowser();
        await nameEntryPO3.assertHasPlayer('test player 1');
        await nameEntryPO3.assertHasPlayer('test player 2');
    });

    describe('with two player started game', () => {

        let gamePO1: GameDisplayPageObject;
        let gamePO2: GameDisplayPageObject;

        beforeEach(async () => {
            var nameEntryPO1 = await newBrowser();
            var nameEntryPO2 = await newBrowser();

            await nameEntryPO1.enterName('test player 1');
            await nameEntryPO1.selectColor('blue');
            await nameEntryPO1.clickJoin();

            await nameEntryPO2.enterName('test player 2');
            await nameEntryPO2.selectColor('red');
            await nameEntryPO2.clickJoin();

            gamePO1 = await nameEntryPO1.clickStart();
            gamePO2 = await nameEntryPO2.assertSwitchedToGame();
        });

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
});
