import * as PIXI from 'pixi.js';
import jImage from './image.js';

export default class editor {

    constructor(container, option={}) {
        this.container = container;
        this.renderApp = new PIXI.Application({ background: option.renderBackground||'#fff'});
        this.controlApp = new PIXI.Application({ backgroundAlpha: 0, resizeTo: container });
        container.appendChild(this.controlApp.view);
        container.appendChild(this.renderApp.view);

        this.renderApp.view.style.position = 'absolute';     
        
        this.children = [];

        this.init(option);
    }

    // 初始化整个编辑器
    init(option) {
        if(option.width && option.height) {
            this.setSize(option.width, option.height);
        }

        // Listen for animate update
        this.renderApp.ticker.add((delta) =>
        {
            option.onTicker && option.onTicker(delta);
        });
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
        this.top = this.controlApp.renderer.height / 2 - height /2;

        this.renderApp.view.style.left = `${this.left}px`;
        this.renderApp.view.style.top = `${this.top}px`;        
    }

    // 添加元素到画布
    addChild(el) {
        this.children.push(el);
        if(el.container) this.renderApp.stage.addChild(el.container);
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