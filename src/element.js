import EventEmiter from 'eventemitter3';
import * as PIXI from 'pixi.js';
import { v4 as uuidv4 } from 'uuid';

export default class element extends EventEmiter {

    constructor(option) {
        super();
        this.container = new PIXI.Container();
        this.editor = option.editor;
        this.option = option || {};
        this.style = this.option.style || {};

        this.id = option.id || uuidv4().replace(/-/g, '');

        this.type = option.type || '';
        this.bindEvent();
    }

    init(option=this.option) {
        this.zIndex = option.zIndex || 1;
        this.x = option.x || 0;
        this.y = option.y || 0;
        this.rotation = option.rotation || 0;
        this.visible = typeof option.visible === 'boolean'? option.visible: true;

        if(option.width && option.width > 0) this.width = option.width;
        if(option.height && option.height > 0) this.height = option.height;

        if(option.skew) {
            this.skew = option.skew;
        }
        if(option.style) {
            this.style = Object.assign(this.style, option.style);
        }
    }

    type = '';

    children = []

    // 位置
    get x() {
        return this.container.x - this.editor.left;
    }
    set x(v) {
        v += this.editor.left;
        this.propertyChange('x', v, this.container.x);
        this.container.x = v;
    }
    get y() {
        return this.container.y - this.editor.top;
    }
    set y(v) {
        v += this.editor.top;
        this.propertyChange('y', v, this.container.y);
        this.container.y = v;
    }

    get width() {
        return this.container.width;
    }
    set width(v) {
        this.propertyChange('width', v, this.container.width);
        this.container.width = v;
        //this.pivot.x = v/2;
    }

    get height() {
        return this.container.height;
    }
    set height(v) {
        this.propertyChange('height', v, this.container.height);
        this.container.height = v;
        //this.pivot.y = v/2;
    }

    // 旋转角度
    set rotation(v) {
        this.propertyChange('rotation', v, this.container.rotation);
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
        this.propertyChange('visible', v, this.container.visible);
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
    get skew() {
        return {
            x: this.container.skew.x,
            y: this.container.skew.y
        };
    }
    set skew(v) {
        if(!v) return;
        if(typeof v.x !== 'undefined') this.container.skew.x = v.x;
        if(typeof v.y !== 'undefined') this.container.skew.y = v.y;
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
        this.propertyChange('selected', v, this._selected);
        this._selected = v;
    }

    // 属性变化事件
    propertyChange(name, newValue, oldValue) {
        try {
            this.emit('propertyChange', name, newValue, oldValue);
        }
        catch(e) {
            console.error('propertyChange',name, e);
        }
    }

    bindEvent() {
        this.container.eventMode = 'static';
        this.container.cursor = 'pointer';
        
        this.container.on('pointerdown', function(event) {
            this.emit('pointerdown', event);
        }, this);
        this.container.on('pointerup', function(event) {
            this.emit('pointerup', event);
        }, this);
        this.container.on('pointerenter', function(event) {
            this.emit('pointerenter', event);
        }, this);
        this.container.on('pointerleave', function(event) {
            this.emit('pointerleave', event);
        }, this);
        this.container.on('pointerout', function(event) {
            this.emit('pointerout', event);
        }, this);
    }   
    
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
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

    // 移除自已
    remove() {
        this.editor.removeChild(this);
    }

    // 把渲染层坐标转为控制层
    toControlPosition(p) {
        if(Array.isArray(p)) {
            const res = [];
            for(const point of p) {
                res.push(this.toControlPosition(point));
            }
            return res;
        }
        return {
            ...p,
            x: p.x + this.editor.left,
            y: p.y + this.editor.top
        };
    }
    // 把控制层坐标转为渲染层
    toRenderPosition(p) {
        if(Array.isArray(p)) {
            const res = [];
            for(const point of p) {
                res.push(this.toRenderPosition(point));
            }
            return res;
        }
        return {
            ...p,
            x: p.x - this.editor.left,
            y: p.y - this.editor.top
        };
    }

    // 把原点转回0，0坐标
    toElementAnchorPosition(p) {
        if(Array.isArray(p)) {
            const res = [];
            for(const point of p) {
                res.push(this.toElementAnchorPosition(point));
            }
            return res;
        }
        return {
            ...p,
            x: p.x - this.width/2,
            y: p.y - this.height/2
        };
    }

    toJSON() {
        const fields = ['x', 'y', 'width', 'height', 'url', 'text', 'rotation', 'type', 'style', 'id', 'skew', 'points', 'isClosed'];
        const obj = {};
       
        for(const k of fields) {
            if(typeof this[k] !== 'undefined') {
                obj[k] = this[k];
            }
        }
        return obj;
    }

    toString() {
        const obj = this.toJSON();
        return JSON.stringify(obj);
    }
}