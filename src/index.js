import * as PIXI from 'pixi.js';
import EventEmiter from 'eventemitter3';
import jImage from './image.js';
import jText from './text.js';
import jBackground from './background.js';
import jResize from './resize.js';
import jLoader from './loader.js';

export default class editor extends EventEmiter {

    constructor(container, option={}) {  
        super(option);
        this.option = option || {};
        this.style = this.option.style || {};

        this.loader = new jLoader();// 加载器

        this.container = document.createElement(
            'div'
        );
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.margin = '0 auto';
        this.container.style.padding = '0';
        this.rootContainer = container;
        container.appendChild(this.container);

        this.resolution = option.resolution || (window.devicePixelRatio > 1? window.devicePixelRatio : 2);
        this.app = new PIXI.Application({ 
            backgroundAlpha: 1, // 背景不透明
            antialias: true,     // 消除锯齿
            autoDensity: true,
            resolution: this.resolution
        });

        this.container.appendChild(this.app.view);  
        
        this.shapes = {
            'image': jImage,
            'text': jText,
            'background': jBackground
        }
        
        this.children = [];

        this.background = this.createShape('background', {
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
        // 按zIndex排序
        this.app.stage.sortableChildren = true;

        //this.app.renderer.events.cursorStyles['rotate'] = 'url("https://jtcospublic.ciccten.com/public/image/rotate.png")';

        this.controlElement = new jResize({
            editor: this
        });
        this.addChild(this.controlElement); }

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

        //this.app.view.style.width = `${controlWidth}px`;
        //this.app.view.style.height = `${controlHeight}px`;
        this.container.setAttribute('data-size', `${width}*${height}`);

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
        this.children.push(el);
    }

    // 移除
    removeChild(el) {
        if(this.app.stage.children.includes(el.container)) this.app.stage.removeChild(el.container);
        const index = this.children.indexOf(el);
        if(index > -1) this.children.splice(this.children.indexOf(el), 1);
    }

    clear() {
        this.background.url = '';
        this.background.style.fill = '#fff';

        for(let i=this.children.length-1;i>=0; i--) {
            const el = this.children[i];
            if(!el.type || el === this.background) continue;
            this.removeChild(el);
        }
    }

    sort() {
        this.app.stage.sortChildren()
    }

    // 创建元素
    createShape(type, option={}) {
        const shape = this.shapes[type];
        if(!shape) {
            throw Error(`${type}不存在的元素类型`);
        }
        const el = new shape({
            ...option,
            type,
            editor: this
        });
        return el;
    }

    // 创建图片元素
    createImage(url, option={}) {
        const img = this.createShape('image', {
            ...option,
            url,
        });
        return img;
    }

    // 转为图片数据
    async toImage() {
        const imgData = await this.app.renderer.extract.base64(this.app.stage, 'image/jpeg', 1, new PIXI.Rectangle(this.left, this.top, this.width, this.height));
        
        /*const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgData, this.left, this.top, this.width, this.height);*/

        return imgData;
    }

    toJSON() {
        const data = {
            backgroundUrl: this.background.url || '',
            backgroundColor: this.background.style.fill || '#fff',
            width: this.width,
            height: this.height,
            children: []
        };
        for(const c of this.children) {
            if(c.type === 'background' || !c.type) continue;
            if(c.toJSON) {
                data.children.push(c.toJSON());
            }
        }
        return data;
    }

    toString() {
        const data = this.toJSON();
        return JSON.stringify(data);
    }

    fromJSON(data) {
        this.clear();
        if(typeof data === 'string') data = JSON.parse(data);
        this.background.url = data.backgroundUrl || '';
        this.background.style.fill = data.backgroundColor || '';

        //if(data.width) this.width = data.width;
        //if(data.height) this.height = data.height;
        this.setSize(data.width, data.height);

        for(const c of data.children) {
            if(c.type === 'background' || !c.type) continue;
            const item = this.createShape(c.type, c);
            this.addChild(item);
        }
    }
}

export {
    editor
}