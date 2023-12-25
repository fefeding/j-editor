let dragTarget = null;
const dragStartPosition = {
    x: 0,
    y: 0
};

function bind(app) {
    
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.on('pointerup', () => {
        onDragEnd(app);
    });
    app.stage.on('pointerupoutside', () => {
        onDragEnd(app);
    });
}

// 绑定拖放的元素
function bindElement(el) {
    el.container.eventMode = 'static';
    el.container.cursor = 'pointer';
    el.container.on('pointerdown', onDragStart, el);
}

function onDragMove(event) {
    if (this.container) {
        //this.container.parent.toLocal(event.global, null, this.container.position);
        this.x += (event.global.x - dragStartPosition.x);
        this.y += (event.global.y - dragStartPosition.y);
    }
    dragStartPosition.x = event.global.x;
    dragStartPosition.y = event.global.y;
}

function onDragStart(event)   {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    // this.data = event.data;
    if(this.container && this.container.alpha > 0) this.container.alpha *= 0.5;
    dragTarget = this;
    dragStartPosition.x = event.global.x;
    dragStartPosition.y = event.global.y;

    this.app.stage.on('pointermove', onDragMove, this);
}

function onDragEnd(app)  {
    if (dragTarget) {
        app.stage.off('pointermove', onDragMove);
        if(dragTarget.container && dragTarget.container.alpha > 0) dragTarget.container.alpha *= 2;
        dragTarget = null;
    }
}

export {
    bind,
    bindElement
}