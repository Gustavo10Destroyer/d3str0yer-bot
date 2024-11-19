import fs from 'fs';
import path from 'path';

export default class Loader {
    static loadPlugins(directory: string) {
        fs.readdirSync(directory).forEach(file => {
            if(!file.endsWith('.js')) return;
            require(path.join(directory, file));
        });
    }
}