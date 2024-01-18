
import * as PIXI from 'pixi.js';
import element from './element.js';

export default class path extends element {
    constructor(option) {
        super(option);
        this.init(option);
    }

    init(option) {
        if(this.graphics) return;

        super.init(option);
        
        this.style.fill = this.style.fill || 'transparent';
        this.style.stroke =  this.style.stroke || '#000';
        this.points = option.points || [];
        this.isClosed = option.isClosed || false;

        this.graphics = new PIXI.Graphics();
        this.addChild(this.graphics);
    }

    x = 0;
    y = 0;
    width = 1;
    height = 1;

    points = [];

    isClosed = false;

    get cursor() {
        return this.graphics.cursor;
    }
    set cursor(v) {
        return this.graphics.cursor = v;
    }

    createBounds(points = this.points) {
        const bounds = {
            left: undefined,
            top: undefined,
            right: 0,
            bottom: 0,
            width: 1,
            height: 1,
            rotation: this.rotation,
            center: {
                x: 0,
                y: 0
            }
        };
        for(let i=0; i<points.length; i++) {
            
            bounds.left = bounds.left === undefined? points[i].x : Math.min(bounds.left, points[i].x);
            bounds.top = bounds.top === undefined? points[i].y : Math.min(bounds.top, points[i].y);
            bounds.right = Math.max(bounds.right, points[i].x);
            bounds.bottom = Math.max(bounds.bottom, points[i].y);
        }

        if(this.shape === 'circle') {
            bounds.right += this.size;
            bounds.bottom += this.size;
            bounds.left -= this.size;
            bounds.top -= this.size;
        }
        bounds.width = bounds.right - bounds.left;
        bounds.height = bounds.bottom - bounds.top;
        bounds.center.x = bounds.left + bounds.width/2;
        bounds.center.y = bounds.top + bounds.height/2;

        return bounds;
    }

    move(dx, dy) {
        if(this.target === this.editor.background) {
            this.target.move(dx, dy);
        }
        else {
            this.x += dx;
            this.y += dy;
        }
    }

    // 获取旋转矩阵
    // 如果 没有更新rotaion，则还有上次生成的
    getMatrix(rotation = this.rotation, center = this.center) {
        if(!center) center = this.createBounds().center;
        let matrix = null;
        if(rotation) {
            matrix = new PIXI.Matrix();
            matrix.rotate(rotation);
            matrix.rotation = rotation;
            matrix.center = center;
        }

        return matrix;
    }
    // 旋转
    rotatePoints(matrix, points = this.points) {
        const res = [];
        for(let i=0; i<points.length; i++) {
            if(matrix) {
                const p = matrix.apply({
                    x: points[i].x - matrix.center.x, 
                    y: points[i].y - matrix.center.y
                });
                res.push({
                    ...points[i],
                    x: p.x + matrix.center.x,
                    y: p.y + matrix.center.y
                });
            }
        }
        return res;
    }

    draw(matrix = null, points = this.points, begin=null, end=null) {
        this.graphics.clear();

        if(!points.length) return;

        if(begin) begin();
        else {
            this.graphics.lineStyle(this.style.lineWidth || 1, this.style.stroke);
            if(this.style.fill) this.graphics.beginFill(this.style.fill);
        }

        if(matrix) {
            points = this.rotatePoints(matrix, points);
        }
        points = this.toControlPosition(points);// 转为画布的绝对坐标

        for(let i=0; i<points.length; i++) {
            const p = points[i];
            if(i === 0 || p.m) this.graphics.moveTo(p.x, p.y);
            else {
                this.graphics.lineTo(p.x, p.y);
            }
        }

        if(this.isClosed) this.graphics.closePath();

        if(end) end(points);
        else { 
            if(this.style.fill) this.graphics.endFill();
        }
    }

    // 生成虚线点集合
    createDotLinePoints(start, end) {
        const points = [];	
		points.push(start);
		
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        const lineLen = Math.sqrt(dx * dx + dy * dy);
        dx = dx / lineLen;
        dy = dy / lineLen;
        let dottedstart = false;

        const dashLen = this.style.dashLength || 5;
        const dottedsp = dashLen / 2;
        for(let l=dashLen; l<=lineLen;) {
            const p = {
                x: start.x + dx * l, 
                y: start.y + dy * l
            };
            if(dottedstart === false) {					
                l += dottedsp;
            }
            else {				
                p.m = true;// 移动到当时坐标
                l += dashLen;
            }
            points.push(p);
            dottedstart = !dottedstart;				
        }
		points.push(end);
        return points;
    }
}