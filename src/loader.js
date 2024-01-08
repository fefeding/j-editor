
import * as PIXI from 'pixi.js';

export default class loader {

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

        return PIXI.Assets.loadBundle(name, function (e) {
            progress && progress(e);
        });
    }

    // 加载字体
    async loadFont(objs, progress) {
        return this.loadBundle('fonts', objs, progress);
    }
}
    