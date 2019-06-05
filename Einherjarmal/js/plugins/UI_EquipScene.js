// UI Equip Scene

function Scene_ActorEquip() {
    this.initialize.apply(this, arguments);
}

Scene_ActorEquip.prototype = Object.create(Scene_Base.prototype);
Scene_ActorEquip.prototype.constructor = Scene_ActorEquip;

Scene_ActorEquip.prototype.initialize = function(actor) {
    this._actor = actor;
    this._slotList = null;
    this._itemList= null;
    this._currentSlot = null;
    Scene_Base.prototype.initialize.call(this);
};

Scene_ActorEquip.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createWindowLayer();
    this.createSlotList();
    this.createSlots();
    this.createItemList();
    this.createButtons();
};

Scene_ActorEquip.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = ImageManager.loadBitmap('img/bg/', 'bg_normal', 0, true);
    this._backgroundSprite.scale.x = Graphics.boxWidth / this._backgroundSprite.width;
    this._backgroundSprite.scale.y = Graphics.boxHeight / this._backgroundSprite.height;
    this.addChild(this._backgroundSprite);
};

Scene_ActorEquip.prototype.createSlotList = function() {
    this._slotList = new Window_Scroll(0, 54, 600, 900);
    this.addWindow(this._slotList);
    this._slotList.setScrollDirection(true, false);
    this._slotList.activate();
};

Scene_ActorEquip.prototype.createSlots = function() {
    var slot_width = this._slotList.width;
    var slot_height = 300;
    var slots = this._actor.equipSlots();
    var slot;

    for(var i = 0; i < slots.length; i++) {
        slot = slots[i];
        var slotObj = new Window_EquipSlotObject(0, i * slot_height, slot_width, slot_height, this._actor);
        slotObj.setId(i);
        this._slotList.addChild(slotObj);
    }

    this._slotList.setScrollLimit(0, 0, 0, Math.min(900 - slots.length * 300 - 100, 0))
};

Scene_ActorEquip.prototype.createItemList = function() {
    this._itemList = new Window_Scroll(this._slotList.width, 54, 1600 - this._slotList.width, 900 - 54);
    this.addWindow(this._itemList);
    this._itemList.setScrollDirection(true, false);
    this._itemList.activate();
};

Scene_ActorEquip.prototype.refreshItems = function(slotId) {
    this._itemList.children.filter(function(child) {
        return child instanceof Window_EquipItemObject;
    }).forEach(function(child) {
        this._itemList.removeChild(child);
    }, this);

    var item_width = this._itemList.width/2;
    var item_height = 300;
    var items = $gameParty.allItems().filter(function(item) {
        return item.slot && item.slot === this._actor.equipSlots()[slotId] && this._actor.canEquip(item);
    }, this);
    var item;

    for (var i = 0; i < items.length; i++) {
        item = items[i];
        var itemObj = new Window_EquipItemObject( (i % 2) * item_width, item_height * Math.floor(i / 2) + 4, item_width, item_height, item);
        this._itemList.addChild(itemObj);
    }

    this._itemList.setScrollLimit(0, 0, 0, Math.min(900 - items.length * 200 - 100, 0));
};

Scene_ActorEquip.prototype.createButtons = function() {
    //create back button
    var button = new Image_Button('back', 1600 - 112, 0, 112, 54);
    button._clickHandler = this.back.bind(this);
    this.addChild(button);
};

Scene_ActorEquip.prototype.back = function() {
    this.popScene();
};

// Window_EquipSlotObject

function Window_EquipSlotObject() {
    this.initialize.apply(this, arguments);
}

Window_EquipSlotObject.prototype = Object.create(Window_ScrollObject.prototype);
Window_EquipSlotObject.prototype.constructor = Window_EquipSlotObject;

Window_EquipSlotObject.prototype.initialize = function(x, y, width, height, actor) {
    Window_ScrollObject.prototype.initialize.call(this, x, y, width, height);
    this._item = null;
    this._slotId = null;
    this._changeBtn = null;
    this._actor = actor;
    this.refresh();
};

Window_EquipSlotObject.prototype.setId = function(id) {
    this._slotId = id;
    this.refresh();
};

Window_EquipSlotObject.prototype.refresh = function() {
    content = this._window;
    content.contents.clear();
    if (this._changeBtn) this.removeChild(this._changeBtn);

    content.drawText($EquipSlotNames[this._actor.equipSlots()[this._slotId]], 2, 0, 600, 'left');
    this._changeBtn = new Image_Button('equip_change', 50, 0, 105, 36);
    this._changeBtn.setClickHandler(this.changeEquip.bind(this));
    this.addChild(this._changeBtn);

    this._item = this._actor.equips()[this._slotId];
    if (!this._item) {
        content.drawImage('img/system/', 'emptySlot', 0, 36, 600, 300 - 36);
    } else {
        var rarity = this._item.rarity || 'bronze';
        var prefix = this._item.piece ? 'piece_' : 'item_';
        content.changeTextColor(content.textColor(Window_Base.prototype.RarityColors[rarity]));
        content.drawText(this._item.name, 2, 36, this.width - 128);
        content.drawTextExWithWidth(this._item.description, 2, 72, this.width - 128);
        content.drawIcon(prefix + 'frame_' + rarity, this.width - 128, 36, 128, 128);
        content.drawIcon(this._item.icon || 'default_unknown', this.width - 128, 36, 128, 128);
    }
};

Window_EquipSlotObject.prototype.changeEquip = function() {
    SceneManager._scene._currentSlot = this;
    SceneManager._scene.refreshItems(this._slotId);
};

// Window_EquipItemObject
function Window_EquipItemObject() {
    this.initialize.apply(this, arguments);
}

Window_EquipItemObject.prototype = Object.create(Window_ScrollObject.prototype);
Window_EquipItemObject.prototype.constructor = Window_EquipItemObject;

Window_EquipItemObject.prototype.initialize = function(x, y, width, height, item) {
    Window_ScrollObject.prototype.initialize.call(this, x, y, width, height);
    this._item = item;
    this._equipBtn = null;
    this.refresh();
};

Window_EquipItemObject.prototype.refresh = function() {
    content = this._window;
    content.contents.clear();
    if (this._equipBtn) this.removeChild(this._equipBtn);


    var rarity = this._item.rarity || 'bronze';
    var prefix = this._item.piece ? 'piece_' : 'item_';

    content.changeTextColor(content.textColor(Window_Base.prototype.RarityColors[rarity]));
    content.drawText(this._item.name + ' × ' + $gameParty.numItems(this._item), 2, 0, this.width - 128);
    content.resetTextColor();

    var text = '';
    text += ('装备位置: ' + $EquipSlotNames[this._item.slot] + '\n');
    text += ('装备类型: ' + this._item.etype + '\n');
    text += (this._item.description + '\n');
    content.drawTextExWithWidth(text, 2, 36, this.width - 128);

    content.drawIcon(prefix + 'frame_' + rarity, this.width - 128, 0, 128, 128);
    content.drawIcon(this._item.icon || 'default_unknown', this._width - 128, 0, 128, 128);

    this._equipBtn = new Image_Button('passive_equip', this._width - 128 + 12, 128, 105, 36);
    this._equipBtn.setClickHandler(this.equip.bind(this, this._item));
    this.addChild(this._equipBtn);
};

Window_EquipItemObject.prototype.equip = function(item) {
    var scene = SceneManager._scene;
    scene._actor.changeEquip(scene._currentSlot._slotId, item);
    scene._currentSlot.refresh();
    scene.refreshItems(scene._currentSlot._slotId);
};