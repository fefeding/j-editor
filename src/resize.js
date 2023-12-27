
import * as PIXI from 'pixi.js';
import element from './element.js';

export default class resize extends element {

    constructor(option) {
        option.zIndex = 100000;
        super(option);
        this.editable = false;// 这个不可编辑
        this.style.itemFillColor = this.style.itemFillColor || '#fff';

        // 绑定拖放操作, 所有操作都放到control层  
        this.editor.app.stage.eventMode = 'static';
        this.editor.app.stage.hitArea = this.editor.app.screen;
        this.editor.app.stage.on('pointerup', this.onDragEnd, this);
        this.editor.app.stage.on('pointerupoutside', this.onDragEnd, this);

        // 其它区域点击则取消选择
        this.editor.app.stage.on('pointerdown', (event) => {
            if(event.target === this.editor.app.stage && this.target) this.target.selected = false;
        });
        this.init();
    }

    itemSize = 6;
    // 拖放位置
    dragStartPosition = {
        x: 0,
        y: 0
    };

    x = 0;
    y = 0;
    width = 1;
    height = 1;

    init() {
        

        this.graphics = new PIXI.Graphics();
        this.graphics.eventMode = 'none';
        this.addChild(this.graphics);

        // 改变大小的方块
        this.items = {
            l: new PIXI.Graphics(),
            lt: new PIXI.Graphics(),
            t: new PIXI.Graphics(),
            tr: new PIXI.Graphics(),
            r: new PIXI.Graphics(),
            rb: new PIXI.Graphics(),
            b: new PIXI.Graphics(),
            lb: new PIXI.Graphics(),
        };
        this.createItem('l', 'w-resize');
        this.createItem('lt', 'nw-resize');
        this.createItem('t', 'n-resize');
        this.createItem('tr', 'ne-resize');
        this.createItem('r', 'e-resize');
        this.createItem('rb', 'se-resize');
        this.createItem('b', 's-resize');
        this.createItem('lb', 'sw-resize');
    }

    createItem(id, cursor = 'pointer') {
        const g = new PIXI.Graphics();
        
        g.eventMode = 'static';
        g.cursor = cursor;
        g.dir = id;
        this.addChild(g);
        this.items[id] = g;

        const self = this;
        // 如果item进行了移动，则反应到控制的目标上
        g.move = function(offX, offY) {
            switch(this.dir) {
                case 'l': {
                    self.x += offX;
                    self.width -= offX;
                    break;
                }
                case 'lt':{
                    self.x += offX;
                    self.width -= offX;

                    self.y += offY;
                    self.height -= offY;
                    break;
                }
                case 't': {
                    self.y += offY;
                    self.height -= offY;
                    break;
                }
                case 'tr': {
                    self.width += offX;
                    self.y += offY;
                    self.height -= offY;
                    break;
                }
                case 'r': {
                    self.width += offX;
                    break;
                }
                case 'rb': {
                    self.width += offX;
                    self.height += offY;
                    break;
                }
                case 'b': {
                    self.height += offY;
                    break;
                }
                case 'lb': {
                    self.x += offX;
                    self.width -= offX;
                    self.height += offY;
                    break;
                }
            }

            if(self.width < self.itemSize) {
                self.width = self.itemSize;
                if(['l', 'lt', 'lb'].includes(this.dir)) self.x -= offX;
            }
            if(self.height < self.itemSize) {
                self.height = self.itemSize;
                if(['lt', 't', 'tr'].includes(this.dir)) self.y -= offY;
            }
        };

        g.on('pointerdown', (event) => {
            this.onDragStart(event, g);
        });
    }

    // 绘制
    draw() {
        let matrix = null;
        if(this.target.rotation) {
            matrix = new PIXI.Matrix();
            matrix.center = this.toControlPosition({
                x: this.target.x,
                y: this.target.y
            });
            matrix.rotate(this.target.rotation);
        }

        this.drawRect(this.graphics, this.x, this.y, this.width, this.height, matrix);

        const t = this.y - this.itemSize / 2;
        const l = this.x - this.itemSize/2;
        const mid = this.y + this.height/2 - this.itemSize/2;
        const cid = this.x + this.width/2 - this.itemSize/2;
        const r = this.x + this.width - this.itemSize/2;
        const b = this.y + this.height - this.itemSize/2;

        this.drawRect(this.items.l, l, mid, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items.lt, l, t, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items.t, cid, t, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items.tr, r, t, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items.r, r, mid, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items.rb, r, b, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items.b, cid, b, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items.lb, l, b, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
    }
    // 绘制方块
    drawRect(g, x, y, w, h, matrix = null, fill = null) {
        g.clear();
        g.lineStyle(1, this.style.lineColor || 'rgba(6,155,181,1)', 1);
        if(fill) g.beginFill(fill);
        g.points = [
            x, y, 
            x + w, y,
            x + w, y + h,
            x, y + h
        ];

        if(matrix) {
            for(let i=0; i<g.points.length; i+=2) {
                const p = matrix.apply({
                    x: g.points[i] - matrix.center.x, 
                    y: g.points[i+1] - matrix.center.y
                });
                g.points[i] = p.x + matrix.center.x;
                g.points[i+1] = p.y + matrix.center.y;
            }
        }

        g.drawPolygon(g.points);
        g.endFill();
    }

    // 绑到当前选中的元素
    bind(el) {
        this.target = el;
        this.visible = true;

        this.width = this.target.width;
        this.height = this.target.height;

        // 操作元素在控制层，需要转换坐标
        const pos = this.toControlPosition({
            x: this.target.x - this.width/2,
            y: this.target.y - this.height/2
        });   

        this.x = pos.x;
        this.y = pos.y;

        this.draw();
    }

    unbind(el) {
        this.target = null;
        this.visible = false;
        this.onDragEnd();
    }

    // 绑定操作事件
    bindEvent(el) {   
        el.container.eventMode = 'static';
        el.container.cursor = 'pointer';
        const self = this;
        el.container.on('pointerdown', function(event) {
            self.onDragStart(event, this);
        }, el);
    }

    // 同步位置和大小到控制的元素上
    resetTarget() {
        // 控制目标元素位置大大小
        if(this.target) {
            const pos = this.toRenderPosition({
                x: this.x,
                y: this.y
            });
            this.target.x = pos.x + this.width/2;
            this.target.y = pos.y + this.height/2;

            this.target.width = this.width;
            this.target.height = this.height;
        }
    }

    onDragMove(event) {
        if(!this.isMoving) return;

        const offX = (event.global.x - this.dragStartPosition.x);
        const offY = (event.global.y - this.dragStartPosition.y);

        if(this.moveItem) {
            this.moveItem.move(offX, offY);
        }
        else {
            this.x += offX;
            this.y += offY;
        }
        
        // 控制目标元素位置大大小
        this.resetTarget();
        
        // 选中的是渲染层的坐标，转为控制层的
        this.dragStartPosition = {
            x: event.global.x,
            y: event.global.y
        };
        this.draw();
    }
    
    onDragStart(event, target)   {
        // 操作元素，如果是其它的则表示不是移动目标
        if(target instanceof element) {
            if(this.target && this.target !== target) this.target.selected = false;
            target.selected = true;// 选中当前元素
            this.moveItem = null;
        }
        else {
            this.moveItem = target;
        }
        
        // 选中的是渲染层的坐标，转为控制层的
        this.dragStartPosition = event.global;
    
        this.editor.app.stage.off('pointermove', this.onDragMove);
        this.editor.app.stage.on('pointermove', this.onDragMove, this);

        this.isMoving = true;
    }
    
    onDragEnd(event)  {
        console.log('drag end', event);
        if (this.target) {
            this.editor.app.stage.off('pointermove', this.onDragMove);
            this.isMoving = false;
        }
    }
}