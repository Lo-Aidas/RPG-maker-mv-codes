//Equip Slot change

Game_Actor.prototype.equipSlots = function() {
    return ['weapon', 'armor', 'accessory', 'accessory'];
};

var $EquipSlotNames = {
    weapon: '武器', 
    armor: '护甲',
    accessory: '饰品'
};

Window_EquipSlot.prototype.slotName = function(index) {
    return this._actor ? $EquipSlotNames[this._actor.equipSlots()[index]] : '';
};

Game_Actor.prototype.changeEquip = function(slotId, item) {
    if (this.tradeItemWithParty(item, this.equips()[slotId]) &&
            (!item || (this.equipSlots()[slotId] === item.slot))) {
        this._equips[slotId].setObject(item);
        this.refresh();
    }
};

Game_Actor.prototype.releaseUnequippableItems = function(forcing) {
    for (;;) {
        var slots = this.equipSlots();
        var equips = this.equips();
        var changed = false;
        for (var i = 0; i < equips.length; i++) {
            var item = equips[i];
            if (item && (!this.canEquip(item) || item.slot !== slots[i])) {
                if (!forcing) {
                    this.tradeItemWithParty(null, item);
                }
                this._equips[i].setObject(null);
                changed = true;
            }
        }
        if (!changed) {
            break;
        }
    }
};

Game_BattlerBase.prototype.canEquip = function(item) {
    if (!item) {
        return false;
    } else if (!item.etype) {
        return false;
    } else if (this.currentClass().equipables&&this.currentClass().equipables.contains(item.etype)) {
        return true;
    }
    return false;
        
};

Window_EquipItem.prototype.includes = function(item) {
    if (item === null) {
        return true;
    }
    if (this._slotId < 0) {
        return false;
    }
    if(this._actor.equipSlots()[this._slotId] !== item.slot) {
        return false;
    }
    return this._actor.canEquip(item);
};