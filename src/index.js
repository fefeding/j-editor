import * as PIXI from 'pixi.js';

export default class editor {

    constructor(container, option={}) {
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
        // create a new Sprite from an image path
        const bunny = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png');

        // center the sprite's anchor point
        bunny.anchor.set(0.5);

        // move the sprite to the center of the screen
        bunny.x = this.renderApp.screen.width / 2;
        bunny.y = this.renderApp.screen.height / 2;

        this.renderApp.stage.addChild(bunny);

        // Listen for animate update
        this.renderApp.ticker.add((delta) =>
        {
            option.onTicker && option.onTicker(delta);
            // just for fun, let's rotate mr rabbit a little
            // delta is 1 if running at 100% performance
            // creates frame-independent transformation
            bunny.rotation += 0.1 * delta;
        });
    }

    setSize(width, height) {
        this.renderApp.renderer.resize(width, height);

        this.left = this.controlApp.renderer.width / 2 - width /2;
        this.top = this.controlApp.renderer.height / 2 - height /2;

        this.renderApp.view.style.left = `${this.left}px`;
        this.renderApp.view.style.top = `${this.top}px`;

        
    }
}

export {
    editor
}