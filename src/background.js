
import image from './image.js';

// 画布背景
export default class background extends image {
    constructor(option) {
        super(option);

        this.on('load', () => {
            this.resize(this.editor.width, this.editor.height);
        })
    }

    // 重置大小
    resize(w, h) {
        const rw = w / this.sprite.texture.width;
        if(rw !== this.sprite.scale.x) this.sprite.scale.x = rw;
        const rh = h / this.sprite.texture.height;
        if(rh !== this.sprite.scale.y) this.sprite.scale.y = rh;
    }
}