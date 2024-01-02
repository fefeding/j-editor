
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

    itemSize = 8;
    // 拖放位置
    dragStartPosition = {
        x: 0,
        y: 0,
        offset: 0 // 离中心点距离
    };

    x = 0;
    y = 0;
    width = 1;
    height = 1;

    rotation = 0;
    angle = 0;

    init() {
        

        this.graphics = new PIXI.Graphics();
        this.graphics.eventMode = 'none';
        this.addChild(this.graphics);

        // 改变大小的方块
        this.items = [];
        this.cursors = {
            'l': 'w-resize',
            'lt': 'nw-resize',
            't': 'n-resize',
            'tr': 'ne-resize',
            'r': 'e-resize',
            'rb': 'se-resize',
            'b': 's-resize',
            'lb': 'sw-resize',
        };
        this.createItem('l');
        this.createItem('lt');
        this.createItem('t');
        this.createItem('tr');
        this.createItem('r');
        this.createItem('rb');
        this.createItem('b');
        this.createItem('lb');
    }

    createItem(id, cursor = this.cursors[id]) {
        const g = new PIXI.Graphics();
        
        g.eventMode = 'static';
        g.cursor = cursor;
        g.dir = id;
        this.addChild(g);
        this.items.push(g);

        const self = this;
        // 如果item进行了移动，则反应到控制的目标上
        g.dragMove = function(offX, offY, offset) {   

            switch(this.dir) {
                case 'l': {
                    self.graphicMove(this, offX, offY);
                    self.graphicMove(self.items[1], offX, offY);
                    self.graphicMove(self.items[7], offX, offY);
                    self.movePoints([
                        self.graphics.points[0], self.graphics.points[3]
                    ], offX, offY);
                    break;
                }
                case 't': {
                    self.graphicMove(this, offX, offY);
                    self.graphicMove(self.items[1], offX, offY);
                    self.graphicMove(self.items[3], offX, offY);
                    self.movePoints([
                        self.graphics.points[0], self.graphics.points[1]
                    ], offX, offY);
                    break;
                }
                case 'r': {
                    self.graphicMove(this, offX, offY);
                    self.graphicMove(self.items[3], offX, offY);
                    self.graphicMove(self.items[5], offX, offY);
                    self.movePoints([
                        self.graphics.points[1], self.graphics.points[2]
                    ], offX, offY);
                    break;
                }
                case 'b': {
                    self.graphicMove(this, offX, offY);
                    self.graphicMove(self.items[5], offX, offY);
                    self.graphicMove(self.items[7], offX, offY);
                    self.movePoints([
                        self.graphics.points[2], self.graphics.points[3]
                    ], offX, offY);
                    break;
                }
                case 'lt':{        
                    self.graphicMove(this, -dx, -dy);      
                    break;
                }
            }
        };

        g.on('pointerdown', (event) => {
            this.onDragStart(event, g);
        });
    }
    // 计算坐标等参数
    initRectPoints(g, x, y, w, h, matrix = null) {
        if(!g.points) {
            g.points = [
                {x, y}, 
                {x: x + w, y},
                {x: x + w, y: y + h},
                {x, y: y + h}
            ];
        }
        else {
            g.points[0].x = x;
            g.points[0].y = y;
            g.points[1].x = x + w;
            g.points[1].y = y;
            g.points[2].x = x + w;
            g.points[2].y = y + h;
            g.points[3].x = x;
            g.points[3].y = y + h;
        }

        this.rotatePoints(g, matrix);

        g.bounds = this.createRectBounds(g);

        return g.points;
    }

    // 初始化方块位置大小
    initRects() {
        const matrix = this.getMatrix(this.rotation);
        this.initRectPoints(this.graphics, this.x, this.y, this.width, this.height, matrix);

        const t = this.y - this.itemSize / 2;
        const l = this.x - this.itemSize/2;
        const mid = this.y + this.height/2 - this.itemSize/2;
        const cid = this.x + this.width/2 - this.itemSize/2;
        const r = this.x + this.width - this.itemSize/2;
        const b = this.y + this.height - this.itemSize/2;

        this.initRectPoints(this.items[0], l, mid, this.itemSize, this.itemSize, matrix);
        this.initRectPoints(this.items[1], l, t, this.itemSize, this.itemSize, matrix);
        this.initRectPoints(this.items[2], cid, t, this.itemSize, this.itemSize, matrix);
        this.initRectPoints(this.items[3], r, t, this.itemSize, this.itemSize, matrix);
        this.initRectPoints(this.items[4], r, mid, this.itemSize, this.itemSize, matrix);
        this.initRectPoints(this.items[5], r, b, this.itemSize, this.itemSize, matrix);
        this.initRectPoints(this.items[6], cid, b, this.itemSize, this.itemSize, matrix);
        this.initRectPoints(this.items[7], l, b, this.itemSize, this.itemSize, matrix);
    }

    // 旋转
    rotatePoints(g, matrix) {
        for(let i=0; i<g.points.length; i++) {
            if(matrix) {
                const p = matrix.apply({
                    x: g.points[i].x - matrix.center.x, 
                    y: g.points[i].y - matrix.center.y
                });
                g.points[i].x = p.x + matrix.center.x;
                g.points[i].y = p.y + matrix.center.y;
            }
        }
        return g;
    }

    createRectBounds(g) {
        const bounds = {
            left: undefined,
            top: undefined,
            right: 0,
            bottom: 0,
            width: 1,
            height: 1,
            center: {
                x: 0,
                y: 0
            }
        };
        for(let i=0; i<g.points.length; i++) {
            
            bounds.left = bounds.left === undefined? g.points[i].x : Math.min(bounds.left, g.points[i].x);
            bounds.top = bounds.top === undefined? g.points[i].y : Math.min(bounds.top, g.points[i].y);
            bounds.right = Math.max(bounds.right, g.points[i].x);
            bounds.bottom = Math.max(bounds.bottom, g.points[i].y);
        }
        bounds.width = bounds.right - bounds.left;
        bounds.height = bounds.bottom - bounds.top;
        bounds.center.x = bounds.left + bounds.width/2;
        bounds.center.y = bounds.top + bounds.height/2;

        // 是用于控制方法的方块
        if(g.dir) {
            const cx = bounds.center.x - this.graphics.bounds.center.x;
            const cy = bounds.center.y - this.graphics.bounds.center.y;
            const angle = Math.atan(cy / cx);// 与中心连线和x轴的夹角
            bounds.angle = angle;
            g.cursor = 'move';
        }

        g.bounds = bounds;

        return bounds;
    }

    // 整理移动
    move(dx, dy) {
        this.x += dx;
        this.y += dy;

        this.movePoints(this.graphics.points, dx, dy);
        for(const g of this.items) {
            this.movePoints(g.points, dx, dy);
        }
    }

    graphicMove(g, dx, dy) {
        this.movePoints(g.points, dx, dy);
    }

    // 把点位移
    movePoints(points, dx, dy) {
        for(const p of points) {
            p.x += dx;
            p.y += dy;
        }
        return points;
    }

    // 绘制
    draw() {

        this.drawPolygon(this.graphics, this.graphics.points);

        /*
        this.drawRect(this.items[0], this.style.itemFillColor);
        this.drawRect(this.items[1], this.style.itemFillColor);
        this.drawRect(this.items[2], this.style.itemFillColor);
        this.drawRect(this.items[3], this.style.itemFillColor);
        this.drawRect(this.items[4], this.style.itemFillColor);
        this.drawRect(this.items[5], this.style.itemFillColor);
        this.drawRect(this.items[6], this.style.itemFillColor);
        this.drawRect(this.items[7], this.style.itemFillColor);
        */
       for(const item of this.items) {
            this.drawPolygon(item, item.points, this.style.itemFillColor);
       }
    }

    // 绘制多边形
    drawPolygon(g, points, fill = null) {
        g.clear();
        g.lineStyle(1, this.style.lineColor || 'rgba(6,155,181,1)', 1);
        if(fill) g.beginFill(fill);

        g.drawPolygon(points);
        g.endFill();
    }

    // 获取旋转矩阵
    // 如果 没有更新rotaion，则还有上次生成的
    getMatrix(rotation = null) {
        if(rotation === null && this.matrix) return this.matrix;
        this.matrix = null;

        rotation = rotation === null? this.rotation : rotation;
        if(rotation) {
            this.matrix = new PIXI.Matrix();
            this.matrix.center = this.toControlPosition({
                x: this.target.x,
                y: this.target.y
            });
            this.matrix.rotate(rotation);
        }
        return this.matrix;
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

        this.rotation = el.rotation;
        
        this.initRects();

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
            const cx = event.global.x - this.graphics.bounds.center.x;
            const cy = event.global.y - this.graphics.bounds.center.y;

            const newOffset = Math.sqrt(cx * cx + cy * cy);
            const offset = Math.abs(newOffset - this.dragStartPosition.offset);

            const rotation = Math.abs(this.moveItem.bounds.angle);
            const ox = Math.cos(rotation) * offset * (offX<0? -1: 1);
            const oy = Math.sin(rotation) * offset * (offY<0? -1: 1);

            this.moveItem.dragMove(ox, oy, offset);

            this.dragStartPosition.offset = newOffset;
        }
        else {
            this.move(offX, offY);
        }
        
        // 控制目标元素位置大大小
        this.resetTarget();
        
        // 选中的是渲染层的坐标，转为控制层的
        this.dragStartPosition.x = event.global.x;
        this.dragStartPosition.y = event.global.y;

        this.draw();
    }
    
    onDragStart(event, target)   {
        
        // 选中的是渲染层的坐标，转为控制层的
        this.dragStartPosition = {
            x: event.global.x,
            y: event.global.y,
            offset: 0
        };

        // 操作元素，如果是其它的则表示不是移动目标
        if(target instanceof element) {
            if(this.target && this.target !== target) this.target.selected = false;
            target.selected = true;// 选中当前元素
            this.moveItem = null;
        }
        else {
            this.moveItem = target;
            const cx = this.dragStartPosition.x - this.graphics.bounds.center.x;
            const cy = this.dragStartPosition.y - this.graphics.bounds.center.y;
            
            // 离中心的距离
            // 计算手标点在操作方块与中心线上的投影距离
            this.dragStartPosition.offset = Math.sqrt(cx * cx + cy * cy);
        }
    
        this.editor.app.stage.off('pointermove', this.onDragMove);
        this.editor.app.stage.on('pointermove', this.onDragMove, this);

        this.isMoving = true;
    }
    
    onDragEnd(event)  {
        if (this.target) {
            this.editor.app.stage.off('pointermove', this.onDragMove);
            this.isMoving = false;
        }
    }
}