import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [{
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            include: [
                path.join(__dirname, 'ts'),
                path.join(__dirname, '../common/ts'),
            ],
            loader: 'babel-loader',
        }]
    },
    stats: {
        colors: true
    },
    mode: 'development',
    entry: './ts/client.ts',
    output: {
        path: path.resolve(__dirname, 'build/js'),
        filename: 'main.bundle.js'
    },
    devtool: 'source-map',
}
