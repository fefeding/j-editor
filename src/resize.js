
import * as PIXI from 'pixi.js';
import element from './element.js';

export default class resize extends element {

    constructor(option) {
        super(option);

        this.init();
    }

    // 拖放位置
    dragStartPosition = {
        x: 0,
        y: 0
    };

    init() {
        // 绑定拖放操作, 所有操作都放到control层  
        this.editor.controlApp.stage.eventMode = 'static';
        this.editor.controlApp.stage.hitArea = this.editor.controlApp.screen;
        this.editor.controlApp.stage.on('pointerup', this.onDragEnd, this);
        this.editor.controlApp.stage.on('pointerupoutside', this.onDragEnd, this);

        this.graphics = new PIXI.Graphics();
        this.addChild(this.graphics);
    }

    x = 0;
    y = 0;
    width = 0;
    height = 0;

    // 绘制
    draw() {
        this.graphics.clear();
        this.graphics.lineStyle(1, this.style.lineColor || 'rgba(6,155,181,1)', 1);
        this.graphics.beginFill(0xFFFFFF, 0.01);
        
        //console.log('draw rect', this.x, this.y, this.width, this.height);
        this.graphics.drawRect(this.x, this.y, this.width, this.height);
        this.graphics.endFill();

        // 控制目标元素位置大大小
        if(this.target) {
            const pos = this.toRenderPosition({
                x: this.x,
                y: this.y
            });
            this.target.x = pos.x;
            this.target.y = pos.y;
        }
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
        
        // 选中的是渲染层的坐标，转为控制层的
        this.dragStartPosition = {
            x: event.global.x,
            y: event.global.y
        };
    }
    
    onDragStart(event, target)   {
        if(this.target && this.target !== target) this.target.unSelect();
        
        if(target.select) target.select();// 选中当前元素
        
        // 选中的是渲染层的坐标，转为控制层的
        this.dragStartPosition = this.toControlPosition(event.global);
    
        this.editor.controlApp.stage.off('pointermove', this.onDragMove);
        this.editor.controlApp.stage.on('pointermove', this.onDragMove, this);

        this.isMoving = true;
    }
    
    onDragEnd()  {
        if (this.target) {
            this.editor.controlApp.stage.off('pointermove', this.onDragMove);
            //if(dragTarget.container && dragTarget.container.alpha > 0) dragTarget.container.alpha *= 2;
            //if(this.target.unSelect) this.target.unSelect();// 取消选中当前元素
            this.isMoving = false;
        }
    }
}