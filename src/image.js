import * as PIXI from 'pixi.js';
import element from './element.js';

// 图片元素
export default class image extends element {
    constructor(option) {
        super(option);

        if(!this.sprite ) {
            this.sprite = new PIXI.Sprite();  
            this.anchor.set(0.5);
        }

        this.init(option);

        this.addChild(this.sprite);
    }

    init(option) {

        super.init(option);

        if(option.url) {
            this.url = option.url;
        }

        if(option.image) {
            this.texture = option.image;
        }
    }

    get anchor() {
        return this.sprite.anchor;
    }
    set anchor(v) {
        this.sprite.anchor = v;
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
        if(v) this.load(v);
        else {
            this.texture = null;
        }
        this.__url = v;
    }

    // 当前图片纹理
    get texture() {
        return  this.sprite.texture;
    }
    set texture(v) {
        if(v instanceof ImageData || v instanceof Image) {
          v = PIXI.Texture.from(v);     
        }
        else if(typeof v === 'string') {
            v = PIXI.Texture.from(v);
        }
        this.sprite.texture = v;
    }

    async load(url) {
        const texture = await this.editor.loader.load(url);
        this.texture = texture;

        this.width = this.width;
        this.height = this.height;

        this.emit('load', texture);
    }
}