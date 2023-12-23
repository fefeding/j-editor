import EventEmiter from 'eventemitter3';
import * as PIXI from 'pixi.js';

export default class element extends EventEmiter {

    constructor(option) {
        super();
        this.container = new PIXI.Container();

        this.editor = option.editor;
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

    // 新增子元素
    addChild(child) {
        return this.container.addChild(child);
    }

    toJSON() {
        return JSON.stringify(this);
    }
}