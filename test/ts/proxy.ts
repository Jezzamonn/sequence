import { program } from 'commander';
import httpProxy from 'http-proxy';


program
    .option('--serverPort <port>', 'Port to listen on', '')
    .option('--proxyPort <port>', 'Port to use for the server', '')
    .parse(process.argv);

const options = program.opts();

const serverPort = parseInt(options.serverPort);
const proxyPort = parseInt(options.proxyPort);

httpProxy.createProxyServer({target: `http://localhost:${serverPort}`, ws: true}).listen(proxyPort);
console.log(`Started proxy on port ${proxyPort} to forward to server on port ${serverPort}`);