import * as PIXI from 'pixi.js';

export default class element {

    constructor(option) {
        this.container = new PIXI.Container();
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

    // 宽度
    width = 0;
    // 高度
    height = 0;

    // 旋转角度
    set rotation(v) {
        this.container.rotation = v;
    }
    get rotation() {
        return this.container.rotation;
    }
}