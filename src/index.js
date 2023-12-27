import * as PIXI from 'pixi.js';
import EventEmiter from 'eventemitter3';
import jImage from './image.js';
import jBackground from './background.js';
import jResize from './resize.js';

export default class editor extends EventEmiter {

    constructor(container, option={}) {  
        super(option);
        this.option = option || {};
        this.style = this.option.style || {};

        this.container = document.createElement(
            'div'
        );
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.margin = '0 auto';
        this.container.style.padding = '0';
        this.rootContainer = container;
        container.appendChild(this.container);

        this.app = new PIXI.Application({ backgroundAlpha: 0 });

        this.container.appendChild(this.app.view);      
        
        this.children = [];

        this.background = new jBackground({
            editor: this,
            style: this.style
        });
        this.addChild(this.background);

        this.init(option);
    }

    // 初始化整个编辑器
    init(option) {
        if(option.width && option.height) {
            this.setSize(option.width, option.height);
        }

        // Listen for animate update
        this.app.ticker.add((delta) =>  {
            this.emit('ticker', delta);            
        });

        this.app.view.style.position = 'absolute'; 
        this.app.view.style.left = '0';
        this.app.view.style.top = '0';   

        this.controlElement = new jResize({
            editor: this
        });
        this.addChild(this.controlElement);
    }

    get width() {
        return this._width;
    }
    set width(v) {
        this.setSize(v, this.height);
    }

    get height() {
        return this._height;
    }
    set height(v) {
        this.setSize(this.width, v);
    }

    setSize(width, height) {
        this._width = width;
        this._height = height;

        const controlWidth = width * 3;
        const controlHeight = height * 3;
        this.app.renderer.resize(controlWidth, controlHeight);
        this.container.style.width = `${controlWidth}px`;
        this.container.style.height = `${controlHeight}px`;

        this.left = controlWidth / 2 - width /2;
        this.top = controlHeight / 2 - height /2;

        // 背景大小一直拉满
        this.background.resize(this.width, this.height);
        // 滚动到居中
        this.rootContainer.scrollTo(controlWidth/2-this.rootContainer.clientWidth/2, controlHeight/2-this.rootContainer.clientHeight/2)
    }

    // 添加元素到画布
    addChild(el) {
        el.editor = this;
        if(el.container) {
            this.app.stage.addChild(el.container);
            
            if(el.editable) {
                this.controlElement.bindEvent(el);
            }
        }
    }

    sort() {
        this.app.stage.sortChildren()
    }

    // 创建图片元素
    createImage(url, option={}) {
        const img = new jImage({
            ...option,
            url,
            editor: this,
        });
        return img;
    }

    // 转为图片数据
    async toImage() {
        const imgData = await this.app.renderer.extract.base64(this.app.stage, 'image/jpeg', 1);//, new PIXI.Rectangle(this.left, this.top, this.width, this.height)
        
        /*const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgData, this.left, this.top, this.width, this.height);*/

        return imgData;
    }
}

export {
    editor
}