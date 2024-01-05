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

    get width() {
        return this.sprite.width;
    }
    set width(v) {
        this.sprite.width = v;
        super.width = v;
    }

    get height() {
        return this.sprite.height;
    }
    set height(v) {
        this.sprite.height = v;
        super.height = v;
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

            //this.editor.sort();
            //this.zIndex = this.zIndex || 0;
        });
    }
}