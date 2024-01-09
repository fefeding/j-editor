import * as PIXI from 'pixi.js';
import element from './element.js';

// font元素
export default class text extends element {
    constructor(option) {
        super(option);        

        this.style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            dropShadow: false,
            dropShadowAlpha: 0,
            dropShadowAngle: 0,
            dropShadowBlur: 0,
            dropShadowColor: 'transparent',
            dropShadowDistance: 0,
            align: 'left',
            fill: ['#ffffff'],
            stroke: 'transparent',
            fontSize: 22,
            fontWeight: 'normal',
            lineJoin: 'round',
            lineHeight: 1,
            strokeThickness: 1,
            miterLimit: 0,
            fontStyle: 'normal',
            //breakWords
            //wordWrap: true,
            //wordWrapWidth: 440,
            ...this.style
        });

        // 文字载体
        this.textSprite = new PIXI.Text('', this.style);   
        this.textSprite.anchor.set(0.5);

        this.text = option.text || '';

        if(this.option.width && this.option.width > 0) this.textSprite.width = this.option.width;
        if(this.option.height && this.option.height > 0) this.textSprite.height = this.option.height;
        
        this.addChild(this.textSprite);
        
        this.init();
    }
/*
    get width() {
        return this.textSprite.width;
    }
    set width(v) {
        this.textSprite.width = v;
    }

    get height() {
        return this.textSprite.height;
    }
    set height(v) {
        this.textSprite.height = v;
    }*/

    get text() {
        return this.textSprite.text;
    }
    set text(v) {
        this.textSprite.text = v;
    }
}