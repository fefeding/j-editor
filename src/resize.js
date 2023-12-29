
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
        g.move = function(offX, offY, oldOffset, newOffset) {
            for(let i=0; i<this.points.length; i+=2) {
                this.points[i] += offX;
                this.points[i+1] += offY;
            }
            self.drawPolygon(this, this.points, self.style.itemFillColor);
            return;

            console.log(offX, offY, oldOffset, newOffset)
            switch(this.dir) {
                case 'l': {
                    const cx = newOffset - oldOffset;
                    self.x -= cx;
                    self.width += cx;
                    break;
                }
                case 'lt':{
                    
                    self.x += offX;
                    self.width -= offX;

                    self.y += offY;
                    self.height -= offY;
                    break;
                }
                case self.cursors['t']: {
                    self.y += offY;
                    self.height -= offY;
                    break;
                }
                case self.cursors['tr']: {
                    self.width += offX;
                    self.y += offY;
                    self.height -= offY;
                    break;
                }
                case self.cursors['r']: {
                    self.width += offX;
                    break;
                }
                case self.cursors['rb']: {
                    self.width += offX;
                    self.height += offY;
                    break;
                }
                case self.cursors['b']: {
                    self.height += offY;
                    break;
                }
                case self.cursors['lb']: {
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
    // 计算坐标等参数
    initRectPoints(g, x, y, w, h, matrix = null) {
        g.bounds = {
            matrix,
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
        g.points = [
            x, y, 
            x + w, y,
            x + w, y + h,
            x, y + h
        ];

        for(let i=0; i<g.points.length; i+=2) {
            if(matrix) {
                const p = matrix.apply({
                    x: g.points[i] - matrix.center.x, 
                    y: g.points[i+1] - matrix.center.y
                });
                g.points[i] = p.x + matrix.center.x;
                g.points[i+1] = p.y + matrix.center.y;
            }
            
            g.bounds.left = g.bounds.left === undefined? g.points[i] : Math.min(g.bounds.left, g.points[i]);
            g.bounds.top = g.bounds.top === undefined? g.points[i+1] :Math.min(g.bounds.top, g.points[i+1]);
            g.bounds.right = Math.max(g.bounds.right, g.points[i]);
            g.bounds.bottom = Math.max(g.bounds.bottom, g.points[i+1]);
        }
        g.bounds.width = g.bounds.right - g.bounds.left;
        g.bounds.height = g.bounds.bottom - g.bounds.top;
        g.bounds.center.x = g.bounds.left + g.bounds.width/2;
        g.bounds.center.y = g.bounds.top + g.bounds.height/2;

        return g.points;
    }

    // 绘制
    draw() {
        let matrix = null;
        if(this.target && this.target.rotation) {
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

        this.drawRect(this.items[0], l, mid, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items[1], l, t, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items[2], cid, t, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items[3], r, t, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items[4], r, mid, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items[5], r, b, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items[6], cid, b, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
        this.drawRect(this.items[7], l, b, this.itemSize, this.itemSize, matrix, this.style.itemFillColor);
    }
    // 绘制方块
    drawRect(g, x, y, w, h, matrix = null, fill = null) {
        g.clear();
        g.lineStyle(1, this.style.lineColor || 'rgba(6,155,181,1)', 1);
        if(fill) g.beginFill(fill);

        const points = this.initRectPoints(g, x, y, w, h, matrix);

        this.drawPolygon(g, points, fill);

        // 是用于控制方法的方块
        if(g.dir) {
            const cx = g.bounds.center.x - this.graphics.bounds.center.x;
            const cy = g.bounds.center.y - this.graphics.bounds.center.y;
            const angle = Math.atan(cy / cx);// 与中心连线和x轴的夹角
            g.bounds.angle = angle;
            g.cursor = 'move';
            /*
            const sp1 = Math.PI/6;
            const sp2 = sp1 * 2;
           
            // 左正方向
            if(cx <= 0) {
                    if(angle > -sp1 && angle <= sp1) g.cursor = this.cursors['l'];
                    else if(angle > sp1 && angle <= sp2) g.cursor = this.cursors['lt'];
                    else if(angle <=-sp1 && angle > -sp2) g.cursor = this.cursors['lb'];
                    else if(angle >= sp2) g.cursor = this.cursors['b'];
                    else g.cursor = this.cursors['t'];
                
            }
            else {
                    if(angle > -sp1 && angle <= sp1) g.cursor = this.cursors['r'];
                    else if(angle > sp1 && angle <= sp2) g.cursor = this.cursors['rb'];
                    else if(angle <= -sp1 && angle > -sp2) g.cursor = this.cursors['tr'];
                    else if(angle >= sp2) g.cursor = this.cursors['t'];
                    else g.cursor = this.cursors['b'];
               
            }*/
        }
    }
    // 绘制多边形
    drawPolygon(g, points, fill = null) {
        g.clear();
        g.lineStyle(1, this.style.lineColor || 'rgba(6,155,181,1)', 1);
        if(fill) g.beginFill(fill);

        points = points || this.initRectPoints(g, x, y, w, h, matrix);

        g.drawPolygon(points);
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
            const cx = event.global.x - this.graphics.bounds.center.x;
            const cy = event.global.y - this.graphics.bounds.center.y;

            const angle = Math.atan(cy / cx);// 手标与中心的夹角


            // 计算手标点在操作方块与中心线上的投影距离
            const offset = Math.cos(angle - this.moveItem.bounds.angle) * Math.sqrt(cx * cx + cy * cy);

            this.moveItem.move(offX, offY, this.dragStartPosition.offset, offset);

            this.dragStartPosition.offset = offset;
        }
        else {
            this.x += offX;
            this.y += offY;
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
            const angle = Math.atan(cy / cx);// 手标与中心的夹角
            // 离中心的距离
            // 计算手标点在操作方块与中心线上的投影距离
            this.dragStartPosition.offset = Math.cos(angle - target.bounds.angle) * Math.sqrt(cx * cx + cy * cy);
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