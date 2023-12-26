import EventEmiter from 'eventemitter3';
import * as PIXI from 'pixi.js';

export default class element extends EventEmiter {

    constructor(option) {
        super();
        this.container = new PIXI.Container();
        
        this.editor = option.editor;
        this.option = option || {};
        this.style = this.option.style || {};
    }

    // 位置
    get x() {
        return this.container.x;
    }
    set x(v) {
        this.container.x = v;
    }
    get y() {
        return this.container.y;
    }
    set y(v) {
        this.container.y = v;
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
        return this.container.visible = v;
    }
    // 是否可以编辑
    editable = true;

    // 被选中
    select() {
        this.selected = true;
        this.editor.selectElement(this);
    }
    // 被取消选中
    unSelect() {
        this.selected = false;
        this.editor.selectElement(this, false);
    }

    // 新增子元素
    addChild(child) {
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