
import * as PIXI from 'pixi.js';
import image from './image.js';

// 画布背景
export default class background extends image {
    constructor(option) {
        super(option);

        this.editable = false;// 不可编辑
        this.init();

        this.on('load', () => {
            this.resize(this.editor.width, this.editor.height);
        });
    }

    init() {
        if(!this.bgGraphics) {
            this.bgGraphics = new PIXI.Graphics();
            this.bgGraphics.eventMode = 'none';
            this.addChild(this.bgGraphics);
        }

        this.forceGraphics = new PIXI.Graphics();
        this.forceGraphics.zIndex = 99999;
        this.forceGraphics.eventMode = 'none';
        this.editor.app.stage.addChild(this.forceGraphics);
    }

    resize(w, h) {

        super.resize(w, h);

        this.x = this.pivot.x;
        this.y = this.pivot.y;

        this.draw(w, h)
    }

    draw(w, h) {   
        // 如果没有指定图片，则画白色背景
        if(!this.url) {       
            this.bgGraphics.clear();
            this.bgGraphics.beginFill(this.style.backgroundColor || 0xFFFFFF, 1);
            this.bgGraphics.drawRect(this.left, this.top, w||this.width, h||this.height);
            this.bgGraphics.endFill();
        }
        else if(this.bgGraphics) {
            this.bgGraphics.visible = false;
        }
        
        // 挡住非渲染区域
        const path = [
            0, 0, 
            this.editor.app.screen.width, 0, 
            this.editor.app.screen.width, this.editor.app.screen.height, 
            this.editor.left + this.editor.width, this.editor.app.screen.height, 
            this.editor.left + this.editor.width, this.editor.top,
            this.editor.left, this.editor.top,
            this.editor.left, this.editor.top + this.editor.height,
            this.editor.left + this.editor.width, this.editor.top + this.editor.height,
            this.editor.left + this.editor.width, this.editor.app.screen.height,
            0, this.editor.app.screen.height
        ];

        //this.editor.sort();
        this.forceGraphics.clear();
        this.forceGraphics.lineStyle(0);
        this.forceGraphics.beginFill(this.style.paddingBackgroundColor || '#ccc', 1);
        this.forceGraphics.drawPolygon(path);
        this.forceGraphics.endFill();
    }
}