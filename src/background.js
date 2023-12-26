
import image from './image.js';

// 画布背景
export default class background extends image {
    constructor(option) {
        super(option);

        this.editable = false;// 不可编辑
        
        this.on('load', () => {
            this.resize(this.editor.width, this.editor.height);
        })
    }

    
}