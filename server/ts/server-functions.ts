import { exec } from 'child_process';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { Server } from 'socket.io';
import { ServerCommand } from '../../common/ts/interface/interface';
import { buildDir } from './server-common';


// Watch the build directory for changes and tell clients to refresh when it
// changes.
export function watchForChangesToBuildDir(io: Server) {
    // Also want to debounce this so that we don't spam the clients with refreshes
    // and so that we wait for all the building to finish.
    let refreshTimeout: NodeJS.Timeout | undefined;
    const refreshDebounceTimeSec = 1;

    fs.watch(buildDir, { recursive: true }, (event, filename) => {
        console.log('File change detected:', event, filename);
        if (refreshTimeout != undefined) {
            clearTimeout(refreshTimeout);
        }

        refreshTimeout = setTimeout(() => {
            console.log('Refreshing clients');
            io.emit(ServerCommand.refresh);
            refreshTimeout = undefined;
        }, refreshDebounceTimeSec * 1000);
    });
}

export async function stopServer(server: http.Server | https.Server) {
    // Close the server
    server.close();
    // Wait for server to actually close, with a minute long timeout
    await new Promise<void>((resolve) => {
        let timeout = setTimeout(() => {
            console.error('Server did not close in time');
            resolve();
        }, 60_000);
        server.on('close', () => {
            clearTimeout(timeout);
            resolve();
        });
    });
}

/** Shutdown the VM this game is running on */
export async function shutdownVm() {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Not shutting down VM because not in production');
        return;
    }
    console.log('Shutting down VM');
    exec('sudo shutdown -h now', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error shutting down: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error shutting down: ${stderr}`);
            return;
        }
        console.log(`Shutdown command completed?? stdout: ${stdout}`);
    });
}

export class ResettableTimeout {
    private timeout: NodeJS.Timeout;
    private hadTimeout = false;

    constructor(private callback: () => void, private delayMs: number) {
        this.timeout = setTimeout(() => this.handleTimeout(), delayMs);
    }

    handleTimeout() {
        if (this.hadTimeout) {
            return;
        }
        this.callback();
        this.hadTimeout = true;
    }

    reset() {
        clearTimeout(this.timeout);
        if (this.hadTimeout) {
            return;
        }
        this.timeout = setTimeout(() => this.handleTimeout(), this.delayMs);
    }
}
