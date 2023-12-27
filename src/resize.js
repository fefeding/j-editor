
import * as PIXI from 'pixi.js';
import element from './element.js';

export default class resize extends element {

    constructor(option) {
        option.zIndex = 100000;
        super(option);
        this.editable = false;// 这个不可编辑
        this.style.itemFillColor = this.style.itemFillColor || '#fff';
        this.init();
    }

    itemSize = 6;
    // 拖放位置
    dragStartPosition = {
        x: 0,
        y: 0
    };

    init() {
        // 绑定拖放操作, 所有操作都放到control层  
        this.editor.app.stage.eventMode = 'static';
        this.editor.app.stage.hitArea = this.editor.app.screen;
        this.editor.app.stage.on('pointerup', this.onDragEnd, this);
        this.editor.app.stage.on('pointerupoutside', this.onDragEnd, this);

        // 其它区域点击则取消选择
        this.editor.app.stage.on('pointerdown', (event) => {
            if(event.target === this.editor.app.stage && this.target) this.target.selected = false;
        });

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
        this.createItem('lb', 's-resize');
        this.createItem('lb', 'sw-resize');
    }

    createItem(id, cursor = 'pointer') {
        const g = new PIXI.Graphics();
        g.eventMode = 'static';
        g.cursor = cursor;
        this.addChild(g);
        return this.items[id] = g;
    }

    x = 0;
    y = 0;
    width = 0;
    height = 0;

    // 绘制
    draw() {
        this.drawRect(this.graphics, this.x, this.y, this.width, this.height);

        const t = this.y - this.itemSize / 2;
        const l = this.x - this.itemSize/2;
        const mid = this.y + this.height/2 - this.itemSize/2;
        const cid = this.x + this.width/2 - this.itemSize/2;
        const r = this.x + this.width - this.itemSize/2;
        const b = this.y + this.height - this.itemSize/2;

        this.drawRect(this.items.l, l, mid, this.itemSize, this.itemSize, this.style.itemFillColor);
        this.drawRect(this.items.lt, l, t, this.itemSize, this.itemSize, this.style.itemFillColor);
        this.drawRect(this.items.t, cid, t, this.itemSize, this.itemSize, this.style.itemFillColor);
        this.drawRect(this.items.tr, r, t, this.itemSize, this.itemSize, this.style.itemFillColor);
        this.drawRect(this.items.r, r, mid, this.itemSize, this.itemSize, this.style.itemFillColor);
        this.drawRect(this.items.rb, r, b, this.itemSize, this.itemSize, this.style.itemFillColor);
        this.drawRect(this.items.b, cid, b, this.itemSize, this.itemSize, this.style.itemFillColor);
        this.drawRect(this.items.lb, l, b, this.itemSize, this.itemSize, this.style.itemFillColor);
    }
    // 绘制方块
    drawRect(g, x, y, w, h, fill = null) {
        g.clear();
        g.lineStyle(1, this.style.lineColor || 'rgba(6,155,181,1)', 1);
        if(fill) g.beginFill(fill);
        
        //console.log('draw rect', this.x, this.y, this.width, this.height);
        g.drawRect(x, y, w, h);
        g.endFill();
    }

    // 绑到当前选中的元素
    bind(el) {
        this.target = el;
        this.visible = true;

        // 操作元素在控制层，需要转换坐标
        const pos = this.toControlPosition({
            x: this.target.x,
            y: this.target.y
        });
        this.x = pos.x;
        this.y = pos.y;
        this.width = this.target.width;
        this.height = this.target.height;

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

    onDragMove(event) {
        if(!this.isMoving) return;

        //this.container.parent.toLocal(event.global, null, this.container.position);
        this.x += (event.global.x - this.dragStartPosition.x);
        this.y += (event.global.y - this.dragStartPosition.y);

        this.draw();

        // 控制目标元素位置大大小
        if(this.target) {
            const pos = this.toRenderPosition({
                x: this.x,
                y: this.y
            });
            this.target.x = pos.x;
            this.target.y = pos.y;
        }
        
        // 选中的是渲染层的坐标，转为控制层的
        this.dragStartPosition = {
            x: event.global.x,
            y: event.global.y
        };
    }
    
    onDragStart(event, target)   {
        if(this.target && this.target !== target) this.target.selected = false;   

        target.selected = true;// 选中当前元素
        //this.bind(target);
        
        // 选中的是渲染层的坐标，转为控制层的
        this.dragStartPosition = event.global;
    
        this.editor.app.stage.off('pointermove', this.onDragMove);
        this.editor.app.stage.on('pointermove', this.onDragMove, this);

        this.isMoving = true;
    }
    
    onDragEnd()  {
        if (this.target) {
            this.editor.app.stage.off('pointermove', this.onDragMove);
            this.isMoving = false;
        }
    }
}