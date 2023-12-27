import EventEmiter from 'eventemitter3';
import * as PIXI from 'pixi.js';

export default class element extends EventEmiter {

    constructor(option) {
        super();
        this.container = new PIXI.Container();
        this.container.zIndex = option.zIndex || 1;
        this.editor = option.editor;
        this.option = option || {};
        this.style = this.option.style || {};
    }

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

    // 旋转角度
    set rotation(v) {
        this.container.rotation = v;
    }
    get rotation() {
        return this.container.rotation;
    }

    get visible() {
        return this.container.visible;
    }
    set visible(v) {
        this.container.visible = v;
        //this.editor.sort();
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
        return this._selected = v;
    }

    // 新增子元素
    addChild(child) {
        if(Array.isArray(child)) {
            for(const c of child) {
                this.addChild(c);
            }
            return this;
        }
        return this.container.addChild(child);
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