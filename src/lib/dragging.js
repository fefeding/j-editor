let dragTarget = null;
let dragStartPosition = {
    x: 0,
    y: 0
};

function bind(editor) {
    
    editor.controlApp.stage.eventMode = 'static';
    editor.controlApp.stage.hitArea = editor.controlApp.screen;
    editor.controlApp.stage.on('pointerup', () => {
        onDragEnd(editor);
    });
    editor.controlApp.stage.on('pointerupoutside', () => {
        onDragEnd(editor);
    });
}

// 绑定拖放的元素
function bindElement(el) {
    el.container.eventMode = 'static';
    el.container.cursor = 'pointer';
    el.container.on('pointerdown', onDragStart, el);
}

function onDragMove(event) {
    if (this.controlElement) {
        //this.container.parent.toLocal(event.global, null, this.container.position);
        this.controlElement.x += (event.global.x - dragStartPosition.x);
        this.controlElement.y += (event.global.y - dragStartPosition.y);

        this.controlElement.draw();
    }
    // 选中的是渲染层的坐标，转为控制层的
    dragStartPosition = {
        x: event.global.x,
        y: event.global.y
    };
}

function onDragStart(event)   {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    // this.data = event.data;
    //if(this.container && this.container.alpha > 0) this.container.alpha *= 0.5;
    dragTarget = this;
    if(this.select) this.select();// 选中当前元素
    
    // 选中的是渲染层的坐标，转为控制层的
    dragStartPosition = this.toControlPosition(event.global);

    this.editor.controlApp.stage.on('pointermove', onDragMove, this.editor);
}

function onDragEnd(editor)  {
    if (dragTarget) {
        editor.controlApp.stage.off('pointermove', onDragMove);
        //if(dragTarget.container && dragTarget.container.alpha > 0) dragTarget.container.alpha *= 2;
        if(dragTarget.unSelect) dragTarget.unSelect();// 取消选中当前元素
        dragTarget = null;
    }
}

export {
    bind,
    bindElement
}