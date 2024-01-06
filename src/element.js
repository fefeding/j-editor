import EventEmiter from 'eventemitter3';
import * as PIXI from 'pixi.js';

export default class element extends EventEmiter {

    constructor(option) {
        super();
        this.container = new PIXI.Container();
        this.editor = option.editor;
        this.option = option || {};
        this.style = this.option.style || {};


        this.bindEvent();
    }

    init() {
        this.zIndex = this.option.zIndex || 1;
        this.x = this.option.x || 0;
        this.y = this.option.y || 0;
        //this.width = this.option.width || 1;
        //this.height = this.option.height || 1;
    }

    type = '';

    children = []

    // 位置
    get x() {
        return this.container.x - this.editor.left;
    }
    set x(v) {
        this.container.x = v + this.editor.left;
    }
    get y() {
        return this.container.y - this.editor.top;
    }
    set y(v) {
        this.container.y = v + this.editor.top;
    }

    get width() {
        return this.container.width;
    }
    set width(v) {
        this.container.width = v;
        //this.pivot.x = v/2;
    }

    get height() {
        return this.container.height;
    }
    set height(v) {
        this.container.height = v;
        //this.pivot.y = v/2;
    }

    // 旋转角度
    set rotation(v) {
        this.container.rotation = v;
    }
    get rotation() {
        return this.container.rotation;
    }
    set angle(v) {
        this.container.angle = v;
    }
    get angle() {
        return this.container.angle;
    }
    
    get visible() {
        return this.container.visible;
    }
    set visible(v) {
        this.container.visible = v;
        //this.editor.sort();
    }
    get pivot() {
        return this.container.pivot;
    }
    set pivot(v) {
        this.container.pivot = v;
    }
    get position() {
        return this.container.position;
    }
    set position(v) {
        this.container.position = v;
    }

    get zIndex() {
        return this.container.zIndex;
    }
    set zIndex(v) {
        this.container.zIndex = v;
    }

    // 是否可以编辑
    editable = true;

    // 被选中
    get selected() {
        return this._selected;
    }
    set selected(v) {
        if(v) this.editor.controlElement.bind(this);
        else {
            this.editor.controlElement.unbind(this);
        }
        this._selected = v;
        this.emit('selectedChange', v);
    }

    bindEvent() {
        this.container.eventMode = 'static';
        this.container.cursor = 'pointer';
        this.container.on('pointerdown', function(event) {
            this.emit('pointerdown', event);
        }, this);
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

    // 新增子元素
    addChild(child) {
        if(Array.isArray(child)) {
            for(const c of child) {
                this.addChild(c);
            }
            return this;
        }
        if(child instanceof element) {
            this.container.addChild(child.container);
            this.children.push(child);
        }
        else {
            this.container.addChild(child);
        }
    }

    

    // 把渲染层坐标转为控制层
    toControlPosition(p) {
        return {
            x: p.x + this.editor.left,
            y: p.y + this.editor.top
        };
    }
    // 把控制层坐标转为渲染层
    toRenderPosition(p) {
        return {
            x: p.x - this.editor.left,
            y: p.y - this.editor.top
        };
    }

    toJSON() {
        return JSON.stringify(this);
    }
}