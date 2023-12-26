import * as PIXI from 'pixi.js';
import jImage from './image.js';
import jBackground from './background.js';
import jResize from './resize.js';

export default class editor {

    constructor(container, option={}) {        
        this.container = document.createElement(
            'div'
        );
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.margin = '0 auto';
        this.container.style.padding = '0';
        this.rootContainer = container;
        container.appendChild(this.container);

        this.renderApp = new PIXI.Application({ background: option.renderBackground||'#fff'});
        this.controlApp = new PIXI.Application({ backgroundAlpha: 0 });

        this.container.appendChild(this.controlApp.view);    
        this.container.appendChild(this.renderApp.view);       
        
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

        this.controlApp.view.style.position = this.renderApp.view.style.position = 'absolute'; 
        this.controlApp.view.style.left = '0';
        this.controlApp.view.style.top = '0';   
        this.controlApp.view.style.zIndex = 0; 
        this.renderApp.view.style.zIndex = 1;

        this.controlElement = new jResize({
            editor: this
        });
        this.controlElement.app = this.controlApp;
        this.controlApp.stage.addChild(this.controlElement.container);
    }

    get width() {
        return this.renderApp.screen.width;
    }

    get height() {
        return this.renderApp.screen.height;
    }

    setSize(width, height) {
        this.renderApp.renderer.resize(width, height);

        const controlWidth = width * 3;
        const controlHeight = height * 3;
        this.controlApp.renderer.resize(controlWidth, controlHeight);
        this.container.style.width = `${controlWidth}px`;
        this.container.style.height = `${controlHeight}px`;

        this.left = controlWidth / 2 - width /2;
        this.top = controlHeight / 2 - height /2;

        this.renderApp.view.style.left = `${this.left}px`;
        this.renderApp.view.style.top = `${this.top}px`;  
        
        // 背景大小一直拉满
        this.background.resize(this.width, this.height);
        // 滚动到居中
        this.rootContainer.scrollTo(controlWidth/2-this.rootContainer.clientWidth/2, controlHeight/2-this.rootContainer.clientHeight/2)
    }

    // 添加元素到画布
    addChild(el) {
        el.editor = this;
        this.children.push(el);
        if(el.container) {
            el.app = this.renderApp;
            this.renderApp.stage.addChild(el.container);

            if(el.editable) {
                this.controlElement.bindEvent(el);
            }
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

    // 选中某个元素
    selectElement(el, selected = true) {
        if(selected) {
            this.controlElement.bind(el);
            
            this.controlApp.view.style.zIndex = 1; 
            this.renderApp.view.style.zIndex = 0;
        }
        else {
            this.controlElement.visible = false;
            
            this.controlApp.view.style.zIndex = 0; 
            this.renderApp.view.style.zIndex = 1;
        }
    }
}

export {
    editor
}