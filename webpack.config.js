import path from 'path';
import nodeExternals from 'webpack-node-externals';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const common = {
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [{
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }]
    },
    stats: {
        colors: true
    },
    mode: 'development',
}


const client = {
    entry: './ts/client/client.ts',
    output: {
        path: path.resolve(__dirname, 'build/client/js'),
        filename: 'main.bundle.js'
    },
    devtool: 'source-map',
}

const server = {
    entry: './ts/server/server.ts',
    output: {
        path: path.resolve(__dirname, 'build/server'),
        filename: 'server.bundle.js'
    },
    externalsPresets: { node: true },
    externals: [nodeExternals()],
}

export default [
    Object.assign({}, common, client),
    Object.assign({}, common, server),
];
