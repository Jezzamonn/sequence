import { ChildProcess, spawn } from 'child_process';
import puppeteer, { Browser } from 'puppeteer';

const serverStartRegex = /Listening on port (\d+)/;

describe('Server Test', () => {
    let serverProcess: ChildProcess | undefined;
    let browser: Browser | undefined;

    let port: number | undefined;

    beforeAll(async () => {
        // Start the server process

        serverProcess = spawn(
            'npx',
            ['ts-node', 'server.ts', '--port', '0', '--randomSeed', 'test'],
            {
                cwd: '../server',
                shell: true,
            }
        );

        // Wait for the server to start
        port = await new Promise<number>((resolve) => {
            serverProcess!.stdout!.on('data', (data: any) => {
                const match = serverStartRegex.exec(data.toString());
                if (match != null) {
                    resolve(parseInt(match[1]));
                }
            });
        });

        console.log(`Server started on port ${port}`);

        // Launch Puppeteer
        browser = await puppeteer.launch();
    });

    afterAll(async () => {
        // Close Puppeteer
        await browser?.close();

        // Stop the server process
        serverProcess?.kill();

        await new Promise<void>((resolve) => {
            serverProcess!.on('close', () => {
                resolve();
            });
        });

        port = undefined;
    });

    it('should open the page served by the server', async () => {
        const page = await browser!.newPage();

        await page.goto(`http://localhost:${port}`);
    });
});
