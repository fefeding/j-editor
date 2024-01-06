import * as PIXI from 'pixi.js';
import element from './element.js';

// font元素
export default class text extends element {
    constructor(option) {
        super(option);
        PIXI.Assets.addBundle
        this.style = {
            fontFamily: 'Arial',
            dropShadow: true,
            dropShadowAlpha: 0.3,
            dropShadowAngle: 2.1,
            dropShadowBlur: 4,
            dropShadowColor: '0xeeeeee',
            dropShadowDistance: 10,
            fill: ['#ffffff'],
            stroke: '#004620',
            fontSize: 22,
            fontWeight: 'lighter',
            lineJoin: 'round',
            strokeThickness: 12,
            ...this.style
        };

        // 图片载体
        this.sprite = new PIXI.Text(option.text, new PIXI.TextStyle(this.style));   
        this.sprite.anchor.set(0.5);

        this.addChild(this.sprite);
        
        this.init();
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

    get text() {
        return this.sprite.text;
    }
    set text(v) {
        this.sprite.text = v;
    }
}