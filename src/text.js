import * as PIXI from 'pixi.js';
import element from './element.js';

// font元素
export default class text extends element {
    constructor(option) {
        super(option);        

        this.style = {
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
            //lineHeight: 1,
            strokeThickness: 1,
            miterLimit: 0,
            fontStyle: 'normal',
            //breakWords
            //wordWrap: true,
            //wordWrapWidth: 440,
            ...this.style
        };

        // 文字载体
        this.textSprite = new PIXI.Text('', new PIXI.TextStyle(this.style));   
        this.anchor.set(0.5);

        this.text = option.text || '';

        if(this.option.width && this.option.width > 0) this.textSprite.width = this.option.width;
        if(this.option.height && this.option.height > 0) this.textSprite.height = this.option.height;
        
        this.addChild(this.textSprite);
        
        this.init(option);
    }

    get anchor() {
        return this.textSprite.anchor;
    }
    set anchor(v) {
        this.textSprite.anchor = v;
    }

    get style() {
        return this._style;
    }
    set style(v) {
        this._style = v;
        if(this.textSprite) {
            Object.assign(this.textSprite.style, v);
        }
    }

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
    }

    get text() {
        return this.textSprite.text;
    }
    set text(v) {
        this.textSprite.text = v;
    }

    // 进入编辑状态
    edit() {
        this.editEl = this.editor.textEditElement;
        if(!this.editEl) return;
        this.selected = false;
        this.editEl.value = this.text;

        const w = this.width * 1.2;
        const h = this.height * 1.2;
        this.editEl.style.width = Math.max(w, 100) + 'px';
        this.editEl.style.height = Math.max(h, 100) + 'px';

        const pos = this.toControlPosition({
            x: this.x - this.width/2,
            y: this.y - this.height/2
        });
        this.editEl.style.top = pos.y + 'px';
        this.editEl.style.left = pos.x + 'px';
        this.editEl.style.fontSize = this.style.fontSize + 'px';
        this.editEl.style.display = 'inline-block';
        this.editEl.focus();// 进入控件
    }
    // 结束编辑
    closeEdit() {
        if(!this.editEl) return;
        this.text = this.editEl.value;
        this.editEl.style.display = 'none';
        delete this.editEl;
    }

    bindEvent() {
        super.bindEvent();

        // 结束编辑
        this.editor.on('textEditElementOnBlur', (e) => {
            this.closeEdit();
        });

        // 点击计数器
        this._pointerTimers = {
            lastTime: 0,
            position: {x: 0, y: 0}
        };
        // 双击进入编辑
        this.on('pointerup', function(e) {
            if(e.button === 2) return;

            if(this._pointerTimers.lastTime > 0) {
                const time = Date.now() - this._pointerTimers.lastTime;
                if(time < 250) {
                    const cx = e.global.x - this._pointerTimers.position.x;
                    const cy = e.global.y - this._pointerTimers.position.y;
                    const off = Math.abs(cx * cx + cy * cy);
                    if(off < 20) {
                        this.emit('doublepointer', e);
                        this._pointerTimers.lastTime = 0;
                        this.edit();
                        return;
                    }
                }
            }

            this._pointerTimers.lastTime = Date.now();     
            this._pointerTimers.position = {
                x: e.global.x,
                y: e.global.y
            };     
        });
    }
}