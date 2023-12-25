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

    get width() {
        return this.sprite.width;
    }
    set width(v) {
        this.sprite.width = v;;
    }

    get height() {
        return this.sprite.height;
    }
    set height(v) {
        this.sprite.height = v;
    }

    // 重置大小
    resize(w, h) {
        if(typeof w === 'number') {
            //const rw = w / this.sprite.texture.width;
            //if(rw !== this.sprite.scale.x) this.sprite.scale.x = rw;
            this.width = w;
        }
        if(typeof h === 'number') {
            //const rh = h / this.sprite.texture.height;
            //if(rh !== this.sprite.scale.y) this.sprite.scale.y = rh;
            this.height = h;
        }
    }

    load(url) {
        return PIXI.Assets.load(url).then((texture) => {
            this.sprite.texture = texture;
            this.emit('load', texture);
        });
    }
}