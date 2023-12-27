import * as PIXI from 'pixi.js';
import element from './element.js';

// 图片元素
export default class image extends element {
    constructor(option) {
        super(option);
        // 图片载体
        //this.sprite = new PIXI.Sprite();
        
        //this.addChild(this.sprite);

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

    // 重置大小
    resize(w, h) {
        if(typeof w === 'number') {
            //const rw = w / this.container.texture.width;
            //if(rw !== this.container.scale.x) this.container.scale.x = rw;
            this.width = w;
        }
        if(typeof h === 'number') {
            //const rh = h / this.container.texture.height;
            //if(rh !== this.container.scale.y) this.container.scale.y = rh;
            this.height = h;
        }
    }

    load(url) {
        return PIXI.Assets.load(url).then((texture) => {
            this.container.texture = texture;
            this.emit('load', texture);

            this.editor.sort();
            //this.zIndex = this.zIndex || 0;
        });
    }
}