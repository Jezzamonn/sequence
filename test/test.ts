import { ChildProcess, spawn } from 'child_process';
import puppeteer, { Browser } from 'puppeteer';
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

    it('allows a game with a single player to be started and stopped', async () => {
        var nameEntryPO = await newBrowser();

        await nameEntryPO.enterName('test player');
        await nameEntryPO.selectColor('blue');

        await nameEntryPO.clickJoin();
        var gamePO = await nameEntryPO.clickStart();
        var settingsPO = await gamePO.openSettings();
        var nameEntryPO = await settingsPO.endGame();
    });

    it('allow a game with two players to be started and stopped', async () => {
        var nameEntryPO1 = await newBrowser();
        var nameEntryPO2 = await newBrowser();

        await nameEntryPO1.enterName('test player 1');
        await nameEntryPO1.selectColor('blue');
        await nameEntryPO1.clickJoin();

        // Check that the player shows up on player 2's screen
        await nameEntryPO2.assertHasPlayer('test player 1');

        await nameEntryPO2.enterName('test player 2');
        await nameEntryPO2.selectColor('red');
        await nameEntryPO2.clickJoin();

        var gamePO2 = await nameEntryPO2.clickStart();

        var gamePO1 = await nameEntryPO1.assertSwitchedToGame();
        var settingsPO1 = await gamePO1.openSettings();
        var nameEntryPO1 = await settingsPO1.endGame();

        var nameEntryPO2 = await gamePO2.assertSwitchedToGame();

        await nameEntryPO1.assertHasPlayer('test player 1');
        await nameEntryPO1.assertHasPlayer('test player 2');
        await nameEntryPO2.assertHasPlayer('test player 1');
        await nameEntryPO2.assertHasPlayer('test player 2');

        // Starting the game again should start it for both players
        var gamePO1 = await nameEntryPO1.clickStart();
        var gamePO2 = await nameEntryPO2.assertSwitchedToGame();
    });
});
