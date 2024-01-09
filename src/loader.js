
import * as PIXI from 'pixi.js';

export default class loader {

    get assets() {
        return PIXI.Assets;
    }

    // 加载静态资源
    async load(urls, progress) {
        return PIXI.Assets.load(urls, progress);
    }

    addBundle(name, objs) {
        // Load from any font file!
        PIXI.Assets.addBundle(name, objs);
    }

    // 加载
    async loadBundle(name, objs, progress) {
        this.addBundle(name, objs);

        const res = await PIXI.Assets.loadBundle(name, function (e) {
            progress && progress(e);
        });
        return res;
    }

    // 加载字体
    async loadFont(objs, progress) {
        return this.loadBundle('fonts', objs, progress);
    }
}
    