import * as PIXI from 'pixi.js';
import element from './element.js';

// 图片元素
export default class image extends element {
    constructor(option) {
        super(option);
        // 图片载体
        this.sprite = new PIXI.Sprite();
        this.addChild(this.sprite);

        if(option.url) {
            this.url = option.url;
        }
    }

    // 当前图片url
    get url() {
        return  this.__url;
    }
    set url(v) {
        this.load(v);
        this.__url = v;
    }

    load(url) {
        return PIXI.Assets.load(url).then((texture) => {
            this.sprite.texture = texture;
            this.emit('load', texture);
        });
    }
}