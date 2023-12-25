import * as PIXI from 'pixi.js';
import jImage from './image.js';
import jBackground from './background.js';
import * as Dragging from './dragging.js';

export default class editor {

    constructor(container, option={}) {        
        this.container = document.createElement(
            'div'
        );
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.margin = '0';
        this.container.style.padding = '0';
        container.appendChild(this.container);

        this.renderApp = new PIXI.Application({ background: option.renderBackground||'#fff'});
        this.controlApp = new PIXI.Application({ backgroundAlpha: 0, resizeTo: this.container });
        this.container.appendChild(this.controlApp.view);
        this.container.appendChild(this.renderApp.view);

        this.renderApp.view.style.position = 'absolute';     
        
        this.children = [];

        this.background = new jBackground({});
        this.addChild(this.background);

        this.init(option);
    }

    // 初始化整个编辑器
    init(option) {
        if(option.width && option.height) {
            this.setSize(option.width, option.height);
        }

        // Listen for animate update
        this.renderApp.ticker.add((delta) =>  {
            option.onTicker && option.onTicker(delta);
            
        });
        // 绑定拖放操作, 所有操作都放到control层
        Dragging.bind(this);
    }

    get width() {
        return this.renderApp.screen.width;
    }

    get height() {
        return this.renderApp.screen.height;
    }

    setSize(width, height) {
        this.renderApp.renderer.resize(width, height);

        let controlWidth = this.controlApp.renderer.width;
        if(controlWidth < width) {
            controlWidth = width * 2;
        }
        let controlHeight = this.controlApp.renderer.height;
        if(controlHeight < height) {
            controlHeight = height * 2;
        }
        this.controlApp.renderer.resize(controlWidth, controlHeight);

        this.left = this.controlApp.renderer.width / 2 - width /2;
        this.top = 200;//this.controlApp.renderer.height / 2 - height /2;

        this.renderApp.view.style.left = `${this.left}px`;
        this.renderApp.view.style.top = `${this.top}px`;  
        
        // 背景大小一直拉满
        this.background.resize(this.width, this.height);
    }

    // 添加元素到画布
    addChild(el) {
        el.editor = this;
        this.children.push(el);
        if(el.container) {
            el.app = this.renderApp;
            this.renderApp.stage.addChild(el.container);

            //Dragging.bindElement(el);// 拖放操作
        }
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
}

export {
    editor
}