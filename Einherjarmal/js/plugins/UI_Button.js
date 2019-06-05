
//==============================================================================================================
// Image_Button
function Image_Button() {
    this.initialize.apply(this, arguments);
}

Image_Button.prototype = Object.create(PIXI.Container.prototype);
Image_Button.prototype.constructor = Image_Button;

Image_Button.prototype.initialize = function(image, x, y, width, height) {
    PIXI.Container.call(this);
    this.x = x;
    this.y = y;
    this._width = 0;
    this._height = 0;
    this.width = width || 128;
    this.height = height || 128;
    this._defaultX = x;
    this._defaultY = y;
    this._touching = false;
    this._clickHandler = null;
    this.createSprite(image);
    this._visiblePart = new Rectangle(0, 0, width, height);
};

Object.defineProperty(Image_Button.prototype, 'width', {
    get: function() {
        return this._width;
    },
    set: function(value) {
        this._width = value;
    },
    configurable: true
});

Object.defineProperty(Image_Button.prototype, 'height', {
    get: function() {
        return this._height;
    },
    set: function(value) {
        this._height = value;
    },
    configurable: true
});


Image_Button.prototype.createSprite = function(image) {
    this._image = ImageManager.loadBitmap('img/buttons/', image, 0, true);
    this._hoverImage = ImageManager.loadBitmap('img/buttons/', image + '_hover', 0, true);
    this._sprite = new Sprite(this._image);
    this.addChild(this._sprite);
};

Image_Button.prototype.setDefaultPosition = function(x, y) {
    this._defaultX = x;
    this._defaultY = y;
    this.x = x;
    this.y = y;
};

Image_Button.prototype.scrollable = function() {
    return true;
};

Image_Button.prototype.visiblePart = function() {
    return this._visiblePart;
};

Image_Button.prototype.setClickHandler = function(method) {
    this._clickHandler = method;
};

Image_Button.prototype.callClickHandler = function() {
    if (this._clickHandler) {
        this._clickHandler();
    }
};

Image_Button.prototype.update = function() {
    this.updateVisiblePart();
    this.updateTouching();
    this.updateHover();
    this.updateSprite();
    this.processRelease();
};

Image_Button.prototype.updateVisiblePart = function () {
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

Image_Button.prototype.updateSprite = function () {
    var sprite = this._sprite;
    var vp = this.visiblePart();
    sprite.setFrame(vp.x, vp.y, vp.width, vp.height);
    sprite.x = vp.x;
    sprite.y = vp.y;
};

Image_Button.prototype.updateHover = function() {
    if (this.isActive() && this.isMouseOver()) {
        this._sprite.bitmap = this._hoverImage;
    }  else {
        this._sprite.bitmap = this._image;
    }
};

Image_Button.prototype.isPressed = function() {
    return TouchInput.isPressed() && this.isMouseOver();
};

Image_Button.prototype.isMouseOver = function() {
    var rect = this.visiblePart();
    var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
};

Image_Button.prototype.updateTouching = function() {
    if (this.isActive()) {
        if (TouchInput.isTriggered() && this.isMouseOver()) {
            this._touching = true;
        }
    } else {
        this._touching = false;
    }
};

Image_Button.prototype.processRelease = function() {
    if (this.isActive()) {
        if (this._touching) {
            if (TouchInput.isReleased() || !this.isMouseOver()) {
                this._touching = false;
                if (TouchInput.isReleased()&&!this._Draged) {
                    this.callClickHandler();
                }
                this._Draged = false;
            }
        }
    } else {
        this._touching = false;
    }
};

Image_Button.prototype.isActive = function() {
    var node = this;
    while (node) {
        if (!node.visible) {
            return false;
        }
        node = node.parent;
    }
    return true;
};

Image_Button.prototype.canvasToLocalX = function(x) {
    var node = this;
    while (node) {
        x -= node.x;
        node = node.parent;
    }
    return x;
};

Image_Button.prototype.canvasToLocalY = function(y) {
    var node = this;
    while (node) {
        y -= node.y;
        node = node.parent;
    }
    return y;
};

// =====================================================================================================================
function Drag_Button() {
    this.initialize.apply(this, arguments);
}

Drag_Button.prototype = Object.create(Image_Button.prototype);
Drag_Button.prototype.constructor = Drag_Button;

Drag_Button.prototype.initialize = function(image, x, y, width, height) {
    Image_Button.prototype.initialize.call(this, image, x, y, width, height);
    this._touchOffsetX = 0;
    this._touchOffsetY = 0;
    this._Draged = false;
};

Drag_Button.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateTouching();
    this.updateHover();
    this.processDrag();
    this.processRelease();
    this.updateVisiblePart();
};

Drag_Button.prototype.updateTouching = function() {
    if (this.isActive()) {
        if (TouchInput.isTriggered() && this.isMouseOver()) {
            if (!this._touching) {
                this._touchOffsetX = this.canvasToLocalX(TouchInput.x) - this.x;
                this._touchOffsetY = this.canvasToLocalY(TouchInput.y) - this.y;
            }
            this._touching = true;
        }
    } else {
        this._touching = false;
    }
};

Drag_Button.prototype.processDrag = function() {
    if (this.isActive()) {
        if (this._touching){
            var x = this.canvasToLocalX(TouchInput.x);
            var y = this.canvasToLocalY(TouchInput.y);
            if (this.x !== y - this._touchOffsetY) {
                this.y = y - this._touchOffsetY;
                this._Draged = true;
            }
            if (this.y !== x - this._touchOffsetX) {
                this.x = x - this._touchOffsetX;
                this._Draged = true;
            }
        }
    }
};