
import * as PIXI from 'pixi.js';
import element from './element.js';

export default class resize extends element {

    constructor(option) {
        option.zIndex = 100000;
        super(option);
        this.editable = false;// 这个不可编辑
        this.init();
    }

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
    }

    x = 0;
    y = 0;
    width = 0;
    height = 0;

    // 绘制
    draw() {
        this.graphics.clear();
        this.graphics.lineStyle(1, this.style.lineColor || 'rgba(6,155,181,1)', 1);
        //this.graphics.beginFill('transparent', 0.01);
        
        //console.log('draw rect', this.x, this.y, this.width, this.height);
        this.graphics.drawRect(this.x, this.y, this.width, this.height);
        this.graphics.endFill();

        
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