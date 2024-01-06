import * as PIXI from 'pixi.js';
import element from './element.js';

// 图片元素
export default class image extends element {
    constructor(option) {
        super(option);

        this.sprite = new PIXI.Sprite();  
        this.sprite.anchor.set(0.5);

        this.addChild(this.sprite);

        if(option.url) {
            this.url = option.url;
        }

        this.init();
    }

    get width() {
        return this.sprite.width;
    }
    set width(v) {
        this.sprite.width = v;
        //super.width = v;
    }

    get height() {
        return this.sprite.height;
    }
    set height(v) {
        this.sprite.height = v;
        //super.height = v;
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

            this.width = this.width;
            this.height = this.height;

            this.emit('load', texture);

            //this.editor.sort();
            //this.zIndex = this.zIndex || 0;
        });
    }
}