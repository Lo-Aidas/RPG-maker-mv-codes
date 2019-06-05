
function Window_Scroll() {
    this.initialize.apply(this, arguments);
}

Window_Scroll.prototype = Object.create(Window_Base.prototype);
Window_Scroll.prototype.constructor = Window_Scroll;

Window_Scroll.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._touching = false;
    this._scrollX = 0;
    this._scrollY = 0;
    this._scrollingX = 0;
    this._scrollingY = 0;
    this._scrollOriginX = 0;
    this._scrollOriginY = 0;
    this._scrollMaxX = 0;
    this._scrollMaxY = 0;
    this._scrollMinX = 0;
    this._scrollMinY = 0;
    this._vertical = true;
    this._horizontal = false;
    this.deactivate();
};

Window_Scroll.prototype.setScrollDirection = function(vertical, horizontal) {
    this._vertical = vertical;
    this._horizontal = horizontal;
};

Window_Scroll.prototype.setScrollLimit = function(xmax, ymax, xmin, ymin) {
    this._scrollMaxX = xmax;
    this._scrollMaxY = ymax;
    this._scrollMinX = xmin;
    this._scrollMinY = ymin;
};

Window_Scroll.prototype.scrollX = function() {
    return this._scrollX + this._scrollingX;
};

Window_Scroll.prototype.scrollY = function() {
    return this._scrollY + this._scrollingY;
};

Window_Scroll.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.updateTouching();
    this.processScroll();
    this.updateScroll();
    this.updateChildrenScroll();
    this.processRelease();
};


Window_Scroll.prototype.isMouseOver = function() {
    var x = this.parent.canvasToLocalX? this.parent.canvasToLocalX(TouchInput.x) : TouchInput.x;
    var y = this.parent.canvasToLocalY? this.parent.canvasToLocalY(TouchInput.y) : TouchInput.y;
    return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
};

Window_Scroll.prototype.updateTouching = function() {
    if (this.active) {
        if (TouchInput.isPressed() && this.isMouseOver()) {
            if (!this._touching) {
                this._scrollOriginX = TouchInput.x;
                this._scrollOriginY = TouchInput.y;
            }
            this._touching = true;
        } else {
            this._touching = false;
        }
    } else {
        this._touching = false;
    }
};

Window_Scroll.prototype.processRelease = function() {
    if (this.active) {
        if (true) {
            if (!this._touching) {
                this._scrollX += this._scrollingX;
                this._scrollY += this._scrollingY;
                this._scrollingX = 0;
                this._scrollingY = 0;
            }
        }
    } else {
        this._touching = false;
    }
};

Window_Scroll.prototype.processScroll = function() {
    if (this.active) {
        if (this._touching){
            var x = TouchInput.x;
            var y = TouchInput.y;
            this._horizontal? this._scrollingX = x - this._scrollOriginX : this._scrollingX = 0;
            this._vertical? this._scrollingY = y - this._scrollOriginY : this._scrollingY = 0;
        }
    }
};

Window_Scroll.prototype.updateScroll = function() {
    if (this._scrollX > this._scrollMaxX) {
        this._scrollX -= (this._scrollX - this._scrollMaxX) / 3;
        if (this._scrollX - this._scrollMaxX < 1) this._scrollX = this._scrollMaxX;
    }
    if (this._scrollY > this._scrollMaxY) {
        this._scrollY -= (this._scrollY - this._scrollMaxY) / 3;
        if (this._scrollY - this._scrollMaxY < 1) this._scrollY = this._scrollMaxY;
    }

    if (this._scrollX < this._scrollMinX) {
        this._scrollX -= (this._scrollX - this._scrollMinX) / 3;
        if (this._scrollMinX - this._scrollX < 1) this._scrollX = this._scrollMinX;
    }
    if (this._scrollY < this._scrollMinY) {
        this._scrollY -= (this._scrollY - this._scrollMinY) / 3;
        if (this._scrollMinY - this._scrollY < 1) this._scrollY = this._scrollMinY;
    }
};

Window_Scroll.prototype.updateChildrenScroll = function() {
    this.children.forEach(function(child) {
        if (child.scrollable&&child.scrollable()) {
            child.x = child._defaultX + this.scrollX();
            child.y = child._defaultY + this.scrollY();
        }
    }, this);
};

// Window_ScrollObject ==============================================================================================
function Window_ScrollObject() {
    this.initialize.apply(this, arguments);
}

Window_ScrollObject.prototype = Object.create(PIXI.Container.prototype);
Window_ScrollObject.prototype.constructor = Window_ScrollObject;

Window_ScrollObject.prototype.initialize = function(x, y, width, height) {
    PIXI.Container.call(this);
    this.x = x;
    this.y = y;
    this._width = 0;
    this._height = 0;
    this.width = width;
    this.height = height;
    this._defaultX = x;
    this._defaultY = y;
    this._scrollable = true;
    this.createWindow();
    this._visiblePart = new Rectangle(0, 0, width, height);
};

Object.defineProperty(Window_ScrollObject.prototype, 'width', {
    get: function() {
        return this._width;
    },
    set: function(value) {
        this._width = value;
    },
    configurable: true
});

Object.defineProperty(Window_ScrollObject.prototype, 'height', {
    get: function() {
        return this._height;
    },
    set: function(value) {
        this._height = value;
    },
    configurable: true
});

Window_ScrollObject.prototype.createWindow = function() {
    this._window = new Window_ScrollObjectWindow(0, 0, this.width, this.height);
    this.addChild(this._window);
};

Window_ScrollObject.prototype.scrollable = function() {
    return this._scrollable;
};

Window_ScrollObject.prototype.setDefaultPosition = function(x, y) {
    this._defaultX = x;
    this._defaultY = y;
    this.x = x;
    this.y = y;
};

Window_ScrollObject.prototype.update = function() {
    this.updateVisiblePart();
    this.updateWindowVisibility();
    this.children.forEach(function(child) {
        if (child.update) {
            child.update();
        }
    });
};

Window_ScrollObject.prototype.updateVisiblePart = function () {
    if (!this.parent) return;
    var p = this.parent;
    var p_rect = this.parent.visiblePart? this.parent.visiblePart() : new Rectangle(0, 0, p.width, p.height);

    this._visiblePart.x = Math.max(p_rect.x - this.x, 0);
    this._visiblePart.y = Math.max(p_rect.y - this.y, 0);

    if (this.x < p_rect.x) {
        if (this.x + this.width < p_rect.x) { this._visiblePart.width = 0;} else
        if (this.x + this.width < p_rect.x + p_rect.width) { this._visiblePart.width = this.x + this.width - p_rect.x;} else
        { this._visiblePart.width = p_rect.width; }
    } else if (this.x < p_rect.x + p_rect.width) {
        if (this.x + this.width < p_rect.x + p_rect.width) {
            this._visiblePart.width = this.width;
        } else {
            this._visiblePart.width = p_rect.x + p_rect.width - this.x;
        }
    } else {
        this._visiblePart.width = 0;
    }

    if (this.y < p_rect.y) {
        if (this.y + this.height < p_rect.y) { this._visiblePart.height = 0;} else
        if (this.y + this.height < p_rect.y + p_rect.height) { this._visiblePart.height = this.y + this.height - p_rect.y;} else
        { this._visiblePart.height = p_rect.height; }
    } else if (this.y < p_rect.y + p_rect.height) {
        if (this.y + this.height < p_rect.y + p_rect.height) {
            this._visiblePart.height = this.height;
        } else {
            this._visiblePart.height = p_rect.y + p_rect.height - this.y;
        }
    } else {
        this._visiblePart.height = 0;
    }
};

Window_ScrollObject.prototype.updateWindowVisibility = function () {
    var vp = this.visiblePart();
    this._window._windowContentsSprite.setFrame(vp.x, vp.y, vp.width, vp.height);
    this._window._windowFrameSprite.setFrame(vp.x, vp.y, vp.width, vp.height);
    this._window._windowBackSprite.setFrame(vp.x, vp.y, vp.width, vp.height);
    this._window.x = vp.x;
    this._window.y = vp.y;
};

Window_ScrollObject.prototype.visiblePart = function() {
    return this._visiblePart;
};

Window_ScrollObject.prototype.canvasToLocalX = function(x) {
    var node = this;
    while (node) {
        x -= node.x;
        node = node.parent;
    }
    return x;
};

Window_ScrollObject.prototype.canvasToLocalY = function(y) {
    var node = this;
    while (node) {
        y -= node.y;
        node = node.parent;
    }
    return y;
};

// Window_ScrollObjectWindow ====================================================================================
function Window_ScrollObjectWindow() {
    this.initialize.apply(this, arguments);
}

Window_ScrollObjectWindow.prototype = Object.create(Window_Base.prototype);
Window_ScrollObjectWindow.prototype.constructor = Window_ScrollObjectWindow;

Window_ScrollObjectWindow.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
};

Window_ScrollObjectWindow.prototype.standardPadding = function() {
    return 0;
};

Window_ScrollObjectWindow.prototype._refreshContents = function() {
    //this._windowContentsSprite.move(this.padding, this.padding);
};

Window_ScrollObjectWindow.prototype._updateContents = function() {
    var w = this._width - this._padding * 2;
    var h = this._height - this._padding * 2;
    if (w > 0 && h > 0) {
        //this._windowContentsSprite.setFrame(this.origin.x, this.origin.y, w, h);
        this._windowContentsSprite.visible = this.isOpen();
    } else {
        this._windowContentsSprite.visible = false;
    }
};

Window_ScrollObjectWindow.prototype.update = function() {
    Window_Base.prototype.update.call(this);
};