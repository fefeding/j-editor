
import * as PIXI from 'pixi.js';
import element from './element.js';



/**
 * 拖放方块 
 */
 class resizeItem extends element {
    constructor(option) {
        super(option);
        this.dir = option.dir || '';
        this.style.fill = this.style.fill || '#fff';
        this.style.lineColor =  this.style.lineColor|| 'rgba(6,155,181,1)';
        this.size = option.size || 8;
        this.init();
    }
    // 鼠标指针
    cursors = {
        'l': 'w-resize',
        'lt': 'nw-resize',
        't': 'n-resize',
        'tr': 'ne-resize',
        'r': 'e-resize',
        'rb': 'se-resize',
        'b': 's-resize',
        'lb': 'sw-resize',
    };

    x = 0;
    y = 0;
    width = 1;
    height = 1;

    points = [];

    get cursor() {
        return this.graphics.cursor;
    }
    set cursor(v) {
        return this.graphics.cursor = v;
    }

    init() {
        this.graphics = new PIXI.Graphics();
        
        this.graphics.eventMode = 'static';
        this.cursor = this.cursors[this.dir];

        this.graphics.on('pointerdown', (event) => {
            this.emit('pointerdown', event, this);
        });

        this.addChild(this.graphics);
    }

    // 计算坐标等参数
    initRectPoints(x=this.x, y=this.y, w=this.width, h=this.height) {
        this.x = x; 
        this.y = y;
        this.width = w;
        this.height = h;

        if(!this.points || !this.points.length) {
            this.points = [
                {x, y}, 
                {x: x + w, y},
                {x: x + w, y: y + h},
                {x, y: y + h}
            ];
        }
        else {
            this.points[0].x = x;
            this.points[0].y = y;
            this.points[1].x = x + w;
            this.points[1].y = y;
            this.points[2].x = x + w;
            this.points[2].y = y + h;
            this.points[3].x = x;
            this.points[3].y = y + h;
        }

        this.bounds = this.createBounds();
        return this.points;
    }

    createBounds(points = this.points) {
        const bounds = {
            left: undefined,
            top: undefined,
            right: 0,
            bottom: 0,
            width: 1,
            height: 1,
            rotation: this.rotation,
            center: {
                x: 0,
                y: 0
            }
        };
        for(let i=0; i<points.length; i++) {
            
            bounds.left = bounds.left === undefined? points[i].x : Math.min(bounds.left, points[i].x);
            bounds.top = bounds.top === undefined? points[i].y : Math.min(bounds.top, points[i].y);
            bounds.right = Math.max(bounds.right, points[i].x);
            bounds.bottom = Math.max(bounds.bottom, points[i].y);
        }
        bounds.width = bounds.right - bounds.left;
        bounds.height = bounds.bottom - bounds.top;
        bounds.center.x = bounds.left + bounds.width/2;
        bounds.center.y = bounds.top + bounds.height/2;

        return bounds;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    // 如果item进行了移动，则反应到控制的目标上
    dragMove(event, offX, offY, bounds) { 

        // 当前移动对原对象的改变
        const args = {
            x: 0, 
            y: 0, 
            width: 0, 
            height: 0
        };

        switch(this.dir) {
            case 'l': {
                args.x = offX;
                args.width = -offX;
                break;
            }
            case 't': {
                args.y = offY;
                args.height = -offY;
                break;
            }
            case 'r': {
                args.width = offX;
                break;
            }
            case 'b': {
                args.height = offY;
                break;
            }
            case 'lt':{   
                args.x = offX;
                args.width = -offX; 
                args.y = offY;
                args.height = -offY;
                break;
            }
            case 'tr':{   
                args.width = offX; 
                args.y = offY;
                args.height = -offY;
                break;
            }
            case 'rb':{   
                args.width = offX; 
                args.height = offY;
                break;
            }
            case 'lb':{   
                args.x = offX;
                args.width = -offX; 
                args.height = offY;
                break;
            }
        }

        this.emit('change', event, args);// 触发改变事件
    };

    draw(matrix = null, points = this.points) {
        this.graphics.clear();
        this.graphics.lineStyle(1, this.style.lineColor, 1);
        if(this.style.fill) this.graphics.beginFill(this.style.fill);

        if(matrix) {
            points = this.rotatePoints(matrix, points);
        }
        this.graphics.drawPolygon(points);
        this.graphics.endFill();

        if(matrix && this.dir) {
            this.computeCursor(matrix, points);
        }
    }

    // 计算指针
    computeCursor(matrix, points = this.points) {
        const bounds = this.createBounds(points);// 实时计算位置，指针
        const cx = bounds.center.x - matrix.center.x;
        const cy = bounds.center.y - matrix.center.y;
        const angle = Math.atan(cy / cx);
        console.log(this.dir, angle);
    }

    // 获取旋转矩阵
    // 如果 没有更新rotaion，则还有上次生成的
    getMatrix(rotation = this.rotation, center = {x: this.x + this.width/2, y: this.y + this.height/2}) {
        
        let matrix = null;
        if(rotation) {
            matrix = new PIXI.Matrix();
            matrix.rotate(rotation);

            matrix.center = center;
        }

        return matrix;
    }
    

    // 旋转
    rotatePoints(matrix, points = this.points) {
        const res = [];
        for(let i=0; i<points.length; i++) {
            if(matrix) {
                const p = matrix.apply({
                    x: points[i].x - matrix.center.x, 
                    y: points[i].y - matrix.center.y
                });
                res.push({
                    x: p.x + matrix.center.x,
                    y: p.y + matrix.center.y
                });
            }
        }
        return res;
    }

    // 计算点在线段的投影点
    point2Line(point, start, end) {
        const px = end.x - start.x,
            py = end.y - start.y,
            dAB = px * px + py * py,
            u = ((point.x - start.x) * px + (point.y - start.y) * py) / dAB;
        const x = start.x + u * px,
            y = start.y + u * py;
        
        return {x, y};  
      }
      
}

export default class resize extends resizeItem {

    constructor(option) {
        option.zIndex = 100000;
        super(option);
        this.editable = false;// 这个不可编辑
        this.style.fill = 'transparent';

        this.itemSize = option.itemSize || 8;

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

    // 拖放位置
    dragStartPosition = {
        x: 0,
        y: 0,
        offset: 0 // 离中心点距离
    };

    rotation = 0;
    angle = 0;

    init() {
        

        this.graphics = new PIXI.Graphics();
        this.graphics.eventMode = 'none';
        this.addChild(this.graphics);

        // 改变大小的方块
        this.items = [];
        this.createItem('l');
        this.createItem('lt');
        this.createItem('t');
        this.createItem('tr');
        this.createItem('r');
        this.createItem('rb');
        this.createItem('b');
        this.createItem('lb');
    }

    createItem(id) {
        const item = new resizeItem({
            dir: id,
            size: this.itemSize,
            style: this.style.itemStyle
        });
        this.addChild(item);
        this.items.push(item);


        item.on('pointerdown', (event, target) => {
            this.onDragStart(event, target);
        });

        item.on('change', (event, {x, y, width, height} = args) => {
            const w = this.width + width;
            const h = this.height + height;

            // 大小最少要有1
            if(w < 1) {
                x = 0;
            }
            else if(width !== 0) {
                this.width = w;
            }
            if(h < 1) {
                y = 0;
            }
            else if(height !== 0) {
                this.height = h;
            }
            
            if(x !== 0 || y !== 0 || width !== 0 || height !== 0) {
                this.move(x, y);
                this.initRects();  
            }    
        });
    }
    

    // 初始化方块位置大小
    initRects() {
        this.initRectPoints(this.x, this.y, this.width, this.height);

        const t = this.y - this.itemSize / 2;
        const l = this.x - this.itemSize/2;
        const mid = this.y + this.height/2 - this.itemSize/2;
        const cid = this.x + this.width/2 - this.itemSize/2;
        const r = this.x + this.width - this.itemSize/2;
        const b = this.y + this.height - this.itemSize/2;

        this.items[0].initRectPoints(l, mid, this.itemSize, this.itemSize);
        this.items[1].initRectPoints(l, t, this.itemSize, this.itemSize);
        this.items[2].initRectPoints(cid, t, this.itemSize, this.itemSize);
        this.items[3].initRectPoints(r, t, this.itemSize, this.itemSize);
        this.items[4].initRectPoints(r, mid, this.itemSize, this.itemSize);
        this.items[5].initRectPoints(r, b, this.itemSize, this.itemSize);
        this.items[6].initRectPoints(cid, b, this.itemSize, this.itemSize);
        this.items[7].initRectPoints(l, b, this.itemSize, this.itemSize);
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
    draw(matrix = this.getMatrix()) {
        super.draw(matrix);
       for(const item of this.items) {
            item.draw(matrix);
       }
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

        // 变换坐标
        const matrix = this.getMatrix(this.rotation);
        this.draw(matrix);
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
        let offX = (event.global.x - this.dragStartPosition.x);
        let offY = (event.global.y - this.dragStartPosition.y);

        if(this.moveItem) {
            let srcPos = {
                x: this.dragStartPosition.x,
                y: this.dragStartPosition.y
            };
            let dstPos = {
                x: event.global.x,
                y: event.global.y
            };
            // 把当前操作的点，回正，再计算大小改变
            if(this.rotation) {
                const rebackMatrix = this.getMatrix(-this.rotation, this.bounds.center);
                [srcPos, dstPos] = this.rotatePoints(rebackMatrix, [srcPos, dstPos]);
            }
            // 计算当前点在方块和中心连线上的投影点
            srcPos = this.point2Line(srcPos, this.moveItem.bounds.center, this.bounds.center);
            dstPos = this.point2Line(dstPos, this.moveItem.bounds.center, this.bounds.center);

            const cx = dstPos.x - srcPos.x;
            const cy = dstPos.y - srcPos.y;
            
            this.moveItem.dragMove(event, cx, cy, this.bounds);
        }
        else {
            this.move(offX, offY);
            this.initRects();      
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
        if(target instanceof resizeItem) {
            this.moveItem = target;
        }
        else {
            if(this.target && this.target !== target) this.target.selected = false;
            target.selected = true;// 选中当前元素
            this.moveItem = null;
            
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