import * as PIXI from 'pixi.js';

export default class editor {

    constructor(container, option={}) {
        this.container = container;
        this.renderApp = new PIXI.Application({ background: option.renderBackground||'#fff'});
        this.controlApp = new PIXI.Application({ backgroundAlpha: 0, resizeTo: container });
        container.appendChild(this.controlApp.view);
        container.appendChild(this.renderApp.view);

        this.renderApp.view.style.position = 'absolute';       

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
}

export {
    editor
}