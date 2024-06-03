import { ChildProcess, spawn } from 'child_process';
import portFilter from 'portfinder';
import puppeteer, { Browser, ConsoleMessage, Page } from 'puppeteer';
import { NameEntryPageObject } from '../../client/ts/components/joining/name-entry-po';

const serverStartRegex = /Listening on port (\d+)/;
const proxyStartRegex = /Started proxy on port (\d+)/;

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
} else {
    jest.setTimeout(30 * 1000); // 30 seconds
}

const headless = true;

export class TestCommon {
    serverProcess: ChildProcess | undefined;
    proxyProcess: ChildProcess | undefined;
    browsers: Browser[] = [];
    serverPort: number | undefined;
    proxyPort: number | undefined;

    async newBrowser(): Promise<NameEntryPageObject> {
        const port = this.proxyPort ?? this.serverPort;
        if (!port) {
            throw new Error('Server or proxy not started');
        }

        const browser = await puppeteer.launch({ headless });
        this.browsers.push(browser);

        const page = await browser!.newPage();
        page.setDefaultTimeout(5 * 1000); // 10 seconds

        await page.goto(`http://localhost:${port}`);

        const nameEntryPO = new NameEntryPageObject(page);
        await nameEntryPO.ensureLoaded();
        return nameEntryPO;
    }

    async startServer() {
        this.serverProcess = spawn(
            'npx',
            ['ts-node', 'server.ts', '--port', '0', '--randomSeed', 'test'],
            {
                cwd: '../server',
                shell: true,
            }
        );

        // Wait for the server to start
        const serverPort = await new Promise<number>((resolve) => {
            const listener = (data: any) => {
                const match = serverStartRegex.exec(data.toString());
                if (match != null) {
                    resolve(parseInt(match[1]));
                    this.serverProcess!.stdout!.removeListener(
                        'data',
                        listener
                    );
                }
            };
            this.serverProcess!.stdout!.on('data', listener);
        });
        this.serverPort = serverPort;

        // console.log(`Server started on port ${this.port}`);
    }

    async shutdownServer() {
        if (this.serverProcess == undefined) {
            return;
        }
        this.serverProcess.kill();

        await new Promise<void>((resolve) => {
            this.serverProcess!.on('close', () => {
                resolve();
            });
        });

        this.serverProcess = undefined;
    }

    async startProxy() {
        if (this.serverPort == undefined) {
            throw new Error('Server not started');
        }
        if (this.proxyProcess) {
            throw new Error('Proxy already started');
        }

        let proxyPort = this.proxyPort;
        if (proxyPort == undefined) {
            proxyPort = await portFilter.getPortPromise();
        }

        this.proxyProcess = spawn(
            'npx',
            [
                'ts-node',
                'ts/proxy.ts',
                '--serverPort',
                this.serverPort.toString(),
                '--proxyPort',
                proxyPort.toString(),
            ],
            {
                shell: true,
            }
        );

        await new Promise<void>((resolve) => {
            const listener = (data: any) => {
                const match = proxyStartRegex.exec(data.toString());
                if (match != null) {
                    resolve();
                    this.proxyProcess!.stdout!.removeListener(
                        'data',
                        listener
                    );
                }
            };
            this.proxyProcess!.stdout!.on('data', listener);
        });

        this.proxyPort = proxyPort;
    }

    async shutdownProxy() {
        if (this.proxyProcess == undefined) {
            return;
        }
        this.proxyProcess.kill();

        await new Promise<void>((resolve) => {
            this.proxyProcess!.on('close', () => {
                resolve();
            });
        });

        this.proxyProcess = undefined;
    }

    async cleanUp() {
        for (const browser of this.browsers) {
            await browser.close();
        }

        await this.shutdownProxy();
        await this.shutdownServer();
    }
}


export function waitForConnect(page: Page): Promise<void> {
    // Wait for "Connected to server" to be logged in the console
    return new Promise((resolve) => {
        const listener = (msg: ConsoleMessage) => {
            if (msg.text() === 'Connected to server') {
                page.off('console', listener);
                resolve();
            }
        };
        page.on('console', listener);
    });
}

export function waitForDisconnect(page: Page): Promise<void> {
    // Wait for "Disconnected from server" to be logged in the console
    return new Promise((resolve) => {
        const listener = (msg: ConsoleMessage) => {
            if (msg.text() === 'Disconnected from server') {
                page.off('console', listener);
                resolve();
            }
        };
        page.on('console', listener);
    });
}