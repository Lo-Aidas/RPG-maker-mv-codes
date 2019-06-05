//Basic changes to UI


// Window_Base

Window_Base.prototype.drawActorFace = function(actor, x, y, width, height) {
    this.drawFace(actor.faceName(), actor.faceIndex(), x, y, width, height);
    if (SceneManager._scene instanceof Scene_Battle) {return; }
    this.drawIcon('portrait_frame', x, y, width||144, height||144);
    this.drawIcon(actor.currentClass().icon, x + (width?width:144) - 36, y + (height?height:144) - 36, 48, 48);
};

Window_Base.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
    var fillW = Math.floor(width * rate);
    var gaugeY = y + this.lineHeight() - 8;
    this.contents.fillRect(x, gaugeY, width, 20, this.gaugeBackColor());
    this.contents.gradientFillRect(x, gaugeY, fillW, 20, color1, color2);
};

Window_Base.prototype.drawActorHp = function(actor, x, y, width) {
    width = width || 186;
    var color1 = this.hpGaugeColor1();
    var color2 = this.hpGaugeColor2();
    this.drawGauge(x, y, width, actor.hpRate(), color1, color2);
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.hpA, x, y + 18, 44);
    this.drawCurrentAndMax(actor.hp, actor.mhp, x, y + 18, width,
                           this.hpColor(actor), this.normalColor());
};

Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
    width = width || 186;
    var color1 = this.mpGaugeColor1();
    var color2 = this.mpGaugeColor2();
    this.drawGauge(x, y, width, actor.mpRate(), color1, color2);
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.mpA, x, y + 18, 44);
    this.drawCurrentAndMax(actor.mp, actor.mmp, x, y + 18, width,
                           this.mpColor(actor), this.normalColor());
};

Window_Base.prototype.drawHpGauge = function(actor, x, y, width) {
    width = width || 186;
    this.drawImage('img/system/', 'party_hpgauge', x, y, width, 18); //draw empty bar

    var filling = ImageManager.loadBitmap('img/system/', 'party_hpgauge_filling', 0, true);
    var filling_width = filling.width * actor.hpRate();
    this.contents.blt(filling, 0, 0, filling_width, filling.height, x, y, width * actor.hpRate(), 18);
    this.drawText(actor.hp + '/' + actor.mhp, x, y - 12, width, 'right');
};

Window_Base.prototype.drawMpGauge = function(actor, x, y, width) {
    width = width || 186;
    this.drawImage('img/system/', 'party_hpgauge', x, y, width, 18); //draw empty bar

    var filling = ImageManager.loadBitmap('img/system/', 'party_mpgauge_filling', 0, true);
    var filling_width = filling.width * actor.mpRate();
    this.contents.blt(filling, 0, 0, filling_width, filling.height, x, y, width * actor.mpRate(), 18);
    this.drawText(actor.mp + '/' + actor.mmp, x, y - 12, width, 'right');
};

Window_Base.prototype.drawTextExWithWidth = function(text, x, y, width) {
    if (text) {
        var textState = { index: 0, x: x, y: y, left: x, width: width, beginX: x };
        textState.text = this.convertEscapeCharacters(text);
        textState.height = this.calcTextHeight(textState, false);
        this.resetFontSettings();
        while (textState.index < textState.text.length) {
            this.processCharacter(textState);
        }
        return textState.x - x;
    } else {
        return 0;
    }
};

//Window_Gold
Window_Gold.prototype.windowWidth = function() {
    return 200;
};

Window_Gold.prototype.refresh = function() {
    var x = this.textPadding();
    this.contents.clear();
    this.drawTextEx('\\I[gold]' + this.value(), 0, 0);
};

//========================================================================================================
// Window_Selectable

Window_Selectable.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.updateArrows();
    this.processMove();
    this.processCursorMove();
    this.processHandling();
    this.processWheel();
    this.processTouch();
    this.updateHelpWindow();
    this._stayCount++;
};

Window_Selectable.prototype.onTouch = function(triggered) {
    var lastIndex = this.index();
    var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
    var hitIndex = this.hitTest(x, y);
    if (hitIndex >= 0) {
        if (hitIndex !== this.index()) {
            this.select(hitIndex);
        }
        if (triggered && this.isTouchOkEnabled()) {
            this.processOk();
        }
    } else if (this._stayCount >= 10) {
        if (y < this.padding) {
            this.cursorUp();
        } else if (y >= this.height - this.padding) {
            this.cursorDown();
        }
    }
    if (this.index() !== lastIndex) {
        SoundManager.playCursor();
    }
};

Window_Selectable.prototype.processMove = function() {
    if (this.isOpenAndActive()) {
        if (TouchInput.isMoved()){
            var x = this.canvasToLocalX(TouchInput.x);
            var y = this.canvasToLocalY(TouchInput.y);
            var hitIndex = this.hitTest(x, y);
            if (hitIndex !== this.index()) {
                this.select(hitIndex);
            }
        }
    }
};

Window_Selectable.prototype.updateHelpWindow = function() {
    if(this.active&&this._helpWindow&&this._helpWindow.visible){
        var x = TouchInput.x;
        var y = TouchInput.y;
        if( x + 400 >= Graphics.boxWidth) { x = Graphics.boxWidth - this._helpWindow._width; }
        if( y + 600 >= Graphics.boxHeight) { y = Graphics.boxHeight - this._helpWindow._height; }
        this._helpWindow.move(x, y, this._helpWindow._width, this._helpWindow._height);
    }
};

Window_Selectable.prototype.setHelpWindowItem = function(item) {
    if ((!item)||this._index===-1||(!this.active)) {this._helpWindow.hide();} else {this._helpWindow.show();}
    if (this._helpWindow) {
        var x = TouchInput.x;
        var y = TouchInput.y;
        if( x + 400 >= Graphics.boxWidth) { x = Graphics.boxWidth - this._helpWindow._width; }
        if( y + 600 >= Graphics.boxHeight) { y = Graphics.boxHeight - this._helpWindow._height; }
        this._helpWindow.move(x, y, this._helpWindow._width, this._helpWindow._height);
        this._helpWindow.setItem(item);
    }
};

Window_Selectable.prototype.processOk = function() {
    if (this.isCurrentItemEnabled()) {
        if (this._helpWindow) {this._helpWindow.hide();}
        this.playOkSound();
        this.updateInputData();
        this.deactivate();
        this.callOkHandler();
    } else {
        this.playBuzzerSound();
    }
};

Window_Selectable.prototype.deactivate = function() {
    Window_Base.prototype.deactivate.call(this);
    this.reselect();
    if(this._helpWindow) {this._helpWindow.hide(); }
};

Window_Selectable.prototype.activate = function() {
    Window_Base.prototype.activate.call(this);
    if(this._helpWindow) {this._helpWindow.hide(); }
};

//Window_ItemList ==================================================================================

Window_ItemList.prototype.itemWidth = function() {
    return 105;
};

Window_ItemList.prototype.itemHeight = function() {
    return 105;
};

Window_ItemList.prototype.spacing = function() {
    return 8;
};

Window_ItemList.prototype.maxCols = function() {
    return Math.floor(this._width / (this.itemWidth() + this.spacing()));
};


Window_ItemList.prototype.includes = function(item) {
    switch (this._category) {
    case 'item':
        return DataManager.isItem(item) && item.itypeId === 1 && (!item.type);
    case 'weapon':
        return DataManager.isWeapon(item);
    case 'armor':
        return DataManager.isArmor(item);
    case 'material':
        return item && item.type === 'material';
    case 'special':
        return item && item.type === 'special';
    case 'keyItem':
        return DataManager.isItem(item) && item.itypeId === 2;
    default:
        return false;
    }
};

Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
    if (this.needsNumber()) {
        //this.drawText(':', x, y + this.itemHeight() - 60, width - this.textWidth('00'), 'right');
        this.drawText($gameParty.numItems(item), x, y + this.itemHeight() - 35, width, 'right');
    }
};

Window_ItemList.prototype.selectLast = function() {
};

// Window_BattleItem =====================================================================================
Window_BattleItem.prototype.show = function() {
    this.selectLast();
    Window_ItemList.prototype.show.call(this);
};

// Window_ItemCategory ==================================================================================================
Window_ItemCategory.prototype.maxCols = function() {
    return 6;
};

Window_ItemCategory.prototype.makeCommandList = function() {
    this.addCommand('道具',    'item');
    this.addCommand('武器',  'weapon');
    this.addCommand('防具',   'armor');
    this.addCommand('素材',   'material');
    this.addCommand('特殊',   'special');
    this.addCommand('任务物品', 'keyItem');
};

//Window_SkillList ==========================================================================================
/*Window_SkillList.prototype.itemWidth = function() {
    return 105;
};

Window_SkillList.prototype.itemHeight = function() {
    return 105;
};

Window_SkillList.prototype.maxCols = function() {
    return Math.floor(this._width / (this.itemWidth() + this.spacing()));
};

Window_SkillList.prototype.spacing = function() {
    return 8;
};*/
Window_SkillList.prototype.maxCols = function() {
	return 3;
};

Window_SkillList.prototype.includes = function(item) {
    return item && !item.types.contains('passive');
};

Window_SkillList.prototype.selectLast = function() {
    var skill;
    if ($gameParty.inBattle()) {
        skill = this._actor.lastBattleSkill();
    } else {
        skill = this._actor.lastMenuSkill();
    }
    var index = this._data.indexOf(skill);
    this.select(index >= 0 ? index : 0);
};

/*Window_SkillList.prototype.drawItem = function(index) {
    var skill = this._data[index];
    if (skill) {
        var costWidth = this.costWidth();
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
        this.changePaintOpacity(this.isEnabled(skill));
        this.drawItemName(skill, rect.x, rect.y, rect.width - costWidth);
        this.drawSkillCost(skill, rect.x, rect.y + 75, rect.width);
        this.changePaintOpacity(1);
    }
};*/

Window_SkillList.prototype.setHelpWindowItem = function(item) {
    Window_Selectable.prototype.setHelpWindowItem.call(this, item);
    if(this._helpWindow) {this._helpWindow._actor = this._actor; }
};

Window_SkillList.prototype.selectLast = function() {
};

// Window_Help ===========================================================================================================
Window_Help.prototype.initialize = function(numLines) {
    var width = 400;
    var height = 500;
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this._text = '';
};

Window_Help.prototype.setItem = function(item) {
    var text = '';
    if (!item) {this.setText(text); return;}
    var rarity = item.rarity || 'bronze';
    
    var name;
    if (typeof(item.name)==='string') {name = item.name;} else {name = item.name(); }
    text = text + '\\C[' + Window_Base.prototype.RarityColors[rarity] + ']' + name + '\\C[0]' + '\n';
    
    if(DataManager.isSkill(item)&&this._actor) {
        text = text + '技能等级: ' + this._actor.getSkillLevel(item.id) + '/' + (item.cap?item.cap:10) + '\n';
    }
    
    if(item._level) {
        text = text + "等级: " + item._level + '\n';
    }
    
    if(item.slot) {
        text = text + '装备位置: ' + $EquipSlotNames[item.slot] + '\n';
    }
    
    if(item.etype) {
        text = text + '装备类型: ' + item.etype + '\n';
    }
    
    if(item.types) {
        text = text + '类型: ';
        item.types.forEach(function(type) {
            text = text + '\\I[type_' + type + ']';
        });
        text = text + '\n';
    }
    
    if(item.mhp) {
        text = text + "生命值: " + item.hp + '/' + item.mhp + '\n'
    }
    
    if(item.description) {
        text = text + item.description + '\n';
    }
    
    if(item instanceof Game_Battler) {
        text += '物理攻击: ' + Math.round(item.pdm) +'\n';
        text += '魔法攻击: ' + Math.round(item.mdm) +'\n';
        text += '物理防御: ' + Math.round(item.pdf) +'\n';
        text += '魔法防御: ' + Math.round(item.mdf) +'\n';
    }
    
    var flavour = item.flavour || '';
    text = text + '\\C[8]' + flavour + '\\C[0]' + '\n';
    
    /*
    var job_count = 0
    if(item.etype) {
        text += '可用职业: ';
        var jobs = $dataClasses.filter(function(job) {
            return job&&job.equipables.contains(item.etype);
        });
        jobs.forEach(function(job) {
            text += '\\I[' + job.icon + ']';
        });
        text += '\n';
    }
    */
    
    this.setText(text);
};

Window_Help.prototype.refresh = function() {
    this.contents.clear();
    this.drawTextEx(this._text, this.textPadding(), 0);
    if(!this._itemWindow){return;}
    this.move(this._itemWindow.canvasToLocalX(TouchInput.x), this._itemWindow.canvasToLocalX(TouchInput.y), this._width, this._height);
};

// Window_Status ==========================================================================================================
Window_Status.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
        var lineHeight = this.lineHeight();
        this.drawBlock1(lineHeight * 0); //name
        this.drawHorzLine(lineHeight * 1);
        this.drawBlock2(lineHeight * 2); // info
        this.drawHorzLine(lineHeight * 6);
        this.drawBlock3(lineHeight * 7); // params
        //this.drawHorzLine(lineHeight * 13);
        //this.drawBlock4(lineHeight * 14);
    }
};

Window_Status.prototype.drawBlock3 = function(y) {
    this.drawParameters(48, y);
    //this.drawEquipments(432, y);
};


Window_Status.prototype.drawParameters = function(x, y) {
    var orgY = y;
    var lineHeight = this.lineHeight();
    var status_array = ["STR","FIN","CON","INT","WIL","WIT"];
    var status_names = ["力量","敏捷","体质","智力","意志","感知"];
    for (var i = 0; i < status_array.length; i++) {
        var y2 = y + lineHeight * i;
        this.changeTextColor(this.systemColor());
        this.drawText(status_names[i], x, y2, 160);
        this.resetTextColor();
        this.drawText(Math.round(this._actor[status_array[i]]), x + 160, y2, 60, 'right');
        var baseStatus = this._actor.calcBaseStatus(status_array[i]);
        this.drawText('(' + Math.round(baseStatus), x + 230, y2, 60, 'left');
        this.changeTextColor(this.textColor(3));
        this.drawText('+' + Math.round(this._actor.calcAddStatus(baseStatus, status_array[i])), x + 280, y2, 60, 'left');
        this.resetTextColor();
        this.drawText(')', x + 340, y2, 60, 'left');
    }
    
    y = y2 + 2 * lineHeight;
    status_array = ["pdm","mdm","pdf","mdf","hit","eva","cri","spd"];
    status_names = ["物理攻击","魔法攻击","物理防御","魔法防御","命中","闪避","会心","速度"];
    for (var i = 0; i < status_array.length; i++) {
        var y2 = y + lineHeight * i;
        this.changeTextColor(this.systemColor());
        this.drawText(status_names[i], x, y2, 160);
        this.resetTextColor();
        this.drawText(Math.round(this._actor[status_array[i]]), x + 160, y2, 60, 'right');
        var baseStatus = this._actor.calcBaseSecondaryStatus(status_array[i]);
        this.drawText('(' + Math.round(baseStatus), x + 230, y2, 60, 'left');
        this.changeTextColor(this.textColor(3));
        this.drawText('+' + Math.round(this._actor.calcAddStatus(baseStatus, status_array[i])), x + 280, y2, 60, 'left');
        this.resetTextColor();
        this.drawText(')', x + 340, y2, 60, 'left');
    }
    
    y = orgY;
    x = x + 400;
    status_array = ["pyros","hydor","anemos","gee", "phos", "erebus", "blow","slash","thrust","shoot"];
    status_names = ["火","水","风","地","光","暗","打击","斩击","刺击","射击"];
    for (var i = 0; i < status_array.length; i++) {
        var y2 = y + lineHeight * i;
        this.changeTextColor(this.systemColor());
        this.drawText(status_names[i] + '加成', x, y2, 160);
        this.resetTextColor();
        this.drawText(Math.round(this._actor[status_array[i] + '_assist']), x + 160, y2, 60, 'right');
    }
    
    x = x + 400;
    for (var i = 0; i < status_array.length; i++) {
        var y2 = y + lineHeight * i;
        this.changeTextColor(this.systemColor());
        this.drawText(status_names[i] + '抗性', x, y2, 160);
        this.resetTextColor();
        this.drawText(Math.round(this._actor[status_array[i] + '_resist']), x + 160, y2, 60, 'right');
    }
};

// Window_MenuStatus
Window_MenuStatus.prototype.itemWidth = function() {
    return 156;
};

Window_MenuStatus.prototype.itemHeight = function() {
    return 240;
};

Window_MenuStatus.prototype.maxCols = function() {
    return Math.floor(this._width / (this.itemWidth() + this.spacing()));
};

Window_MenuStatus.prototype.drawItem = function(index) {
    this.drawItemBackground(index);
    this.drawItemImage(index);
    //this.drawItemStatus(index);
};

Window_MenuStatus.prototype.drawItemImage = function(index) {
    var actor = $gameParty.members()[index];
    var rect = this.itemRect(index);
    this.changePaintOpacity(actor.isBattleMember());
    this.drawActorFace(actor, rect.x + 1, rect.y + 1, Window_Base._faceWidth, Window_Base._faceHeight);
    this.drawActorHp(actor, rect.x, rect.y + 146, 156);
    this.drawActorMp(actor, rect.x, rect.y + 176, 156);
    this.changePaintOpacity(true);
};


// Window_EquipSlot ===========================================================================================

Window_EquipSlot.prototype.maxCols = function() {
    return Math.floor(this._width / (this.itemWidth() + this.spacing()));;
};

Window_EquipSlot.prototype.itemWidth = function() {
    return 105;
};

Window_EquipSlot.prototype.itemHeight = function() {
    return 137;
};

Window_EquipSlot.prototype.drawItem = function(index) {
    if (this._actor) {
        var rect = this.itemRectForText(index);
        this.changeTextColor(this.systemColor());
        this.changePaintOpacity(this.isEnabled(index));
        this.drawIcon('default_empty', rect.x, rect.y, 105, 105);
        this.drawText(this.slotName(index), rect.x, rect.y + 105, 105, 'center');
        this.drawItemName(this._actor.equips()[index], rect.x, rect.y);
        this.changePaintOpacity(true);
    }
};

// Window_EquipStatus =====================================================================================================
Window_EquipStatus.prototype.statusList = function() {
    return ["STR","FIN","CON","INT","WIL","WIT","mhp","mmp","pdm","mdm","pdf","mdf","hit","eva","cri","spd"];
};

Window_EquipStatus.prototype.statusNames = function() {
    return ["力量","敏捷","体质","智力","意志","感知","生命","法力","物理攻击","魔法攻击","物理防御","魔法防御","命中","闪避","会心","速度"];
};

Window_EquipStatus.prototype.numVisibleRows = function() {
    return 16;
};

Window_EquipStatus.prototype.windowHeight = function() {
    return Graphics.boxHeight;
};

Window_EquipStatus.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
        this.drawActorFace(this._actor, 0, 0);
        this.drawActorName(this._actor, this.textPadding(), 146);
        for (var i = 0; i < this.statusList().length; i++) {
            this.drawItem(0, 146 + this.lineHeight() * (1 + i), i);
        }
    }
};

Window_EquipStatus.prototype.drawItem = function(x, y, statusIndex) {
    this.drawParamName(x + this.textPadding(), y, statusIndex);
    if (this._actor) {
        this.drawCurrentParam(x + 140, y, statusIndex);
    }
    this.drawRightArrow(x + 188, y);
    if (this._tempActor) {
        this.drawNewParam(x + 222, y, statusIndex);
    }
};

Window_EquipStatus.prototype.drawParamName = function(x, y, statusIndex) {
    this.changeTextColor(this.systemColor());
    this.drawText(this.statusNames()[statusIndex], x, y, 120);
};

Window_EquipStatus.prototype.drawCurrentParam = function(x, y, statusIndex) {
    this.resetTextColor();
    this.drawText(Math.round(this._actor[this.statusList()[statusIndex]]), x, y, 48, 'right');
};

Window_EquipStatus.prototype.drawNewParam = function(x, y, statusIndex) {
    var newValue = this._tempActor[this.statusList()[statusIndex]];
    var diffvalue = newValue - this._actor[this.statusList()[statusIndex]];
    this.changeTextColor(this.paramchangeTextColor(diffvalue));
    this.drawText(Math.round(newValue), x, y, 48, 'right');
};

// Window_ActorCommand =========================================================================================
Window_ActorCommand.prototype.makeCommandList = function() {
    if (this._actor) {
        this.addAttackCommand();
        this.addSkillCommands();
        //this.addGuardCommand(); delete guard command
        this.addItemCommand();
    }
};

Window_ActorCommand.prototype.addSkillCommands = function() {
     this.addCommand('技能', 'skill', true, 0);
};

//Scene_Skill ===============================================================================================================

Scene_Skill.prototype.create = function() {
    Scene_ItemBase.prototype.create.call(this);
    this.createSkillTypeWindow();
    this.createStatusWindow();
    this.createItemWindow();
    this.createActorWindow();
    this.createHelpWindow();
};

Scene_Skill.prototype.createSkillTypeWindow = function() {
    var wy = 0;
    this._skillTypeWindow = new Window_SkillType(0, wy);
    this._skillTypeWindow.setHelpWindow(this._helpWindow);
    this._skillTypeWindow.setHandler('skill',    this.commandSkill.bind(this));
    this._skillTypeWindow.setHandler('cancel',   this.popScene.bind(this));
    this._skillTypeWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._skillTypeWindow.setHandler('pageup',   this.previousActor.bind(this));
    this.addWindow(this._skillTypeWindow);
};

Scene_Skill.prototype.createStatusWindow = function() {
    var wx = this._skillTypeWindow.width;
    var wy = 0;
    var ww = Graphics.boxWidth - wx;
    var wh = this._skillTypeWindow.height;
    this._statusWindow = new Window_SkillStatus(wx, wy, ww, wh);
    this._statusWindow.reserveFaceImages();
    this.addWindow(this._statusWindow);
};


//Scene_Item ================================================================================================================
Scene_Item.prototype.create = function() {
    Scene_ItemBase.prototype.create.call(this);
    this.createCategoryWindow();
    this.createItemWindow();
    this.createActorWindow();
    this.createHelpWindow();
};

Scene_Item.prototype.createCategoryWindow = function() {
    this._categoryWindow = new Window_ItemCategory();
    this._categoryWindow.y = 0;
    this._categoryWindow.setHandler('ok',     this.onCategoryOk.bind(this));
    this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._categoryWindow);
};

Scene_Item.prototype.createItemWindow = function() {
    var wy = this._categoryWindow.y + this._categoryWindow.height;
    var wh = Graphics.boxHeight - wy;
    this._itemWindow = new Window_ItemList(0, wy, Graphics.boxWidth, wh);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
    this._categoryWindow.setItemWindow(this._itemWindow);
};

// Scene_Equip ====================================================================================

Scene_Equip.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createStatusWindow();
    this.createCommandWindow();
    this.createSlotWindow();
    this.createItemWindow();
    this.createHelpWindow();
    this.refreshActor();
};

Scene_Equip.prototype.createStatusWindow = function() {
    this._statusWindow = new Window_EquipStatus(0, 0);
    this.addWindow(this._statusWindow);
};

Scene_Equip.prototype.createCommandWindow = function() {
    var wx = this._statusWindow.width;
    var wy = 0;
    var ww = Graphics.boxWidth - this._statusWindow.width;
    this._commandWindow = new Window_EquipCommand(wx, wy, ww);
    //this._commandWindow.setHelpWindow(this._helpWindow);
    this._commandWindow.setHandler('equip',    this.commandEquip.bind(this));
    this._commandWindow.setHandler('optimize', this.commandOptimize.bind(this));
    this._commandWindow.setHandler('clear',    this.commandClear.bind(this));
    this._commandWindow.setHandler('cancel',   this.popScene.bind(this));
    this._commandWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._commandWindow.setHandler('pageup',   this.previousActor.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_Equip.prototype.createSlotWindow = function() {
    var wx = this._statusWindow.width;
    var wy = this._commandWindow.y + this._commandWindow.height;
    var ww = Graphics.boxWidth - this._statusWindow.width;
    var wh = 180;
    this._slotWindow = new Window_EquipSlot(wx, wy, ww, wh);
    this._slotWindow.setStatusWindow(this._statusWindow);
    this._slotWindow.setHandler('ok',       this.onSlotOk.bind(this));
    this._slotWindow.setHandler('cancel',   this.onSlotCancel.bind(this));
    this.addWindow(this._slotWindow);
};

Scene_Equip.prototype.createItemWindow = function() {
    var wx = this._statusWindow.width;
    var wy = this._slotWindow.y + this._slotWindow.height;
    var ww = Graphics.boxWidth;
    var wh = Graphics.boxHeight - wy;
    this._itemWindow = new Window_EquipItem(wx, wy, ww, wh);
    //this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setStatusWindow(this._statusWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this._slotWindow.setItemWindow(this._itemWindow);
    this.addWindow(this._itemWindow);
};

//Scene_Battle
Scene_Battle.prototype.createAllWindows = function() {
    this.createLogWindow();
    this.createStatusWindow();
    this.createPartyCommandWindow();
    this.createActorCommandWindow();
    this.createSkillWindow();
    this.createItemWindow();
    this.createActorWindow();
    this.createEnemyWindow();
    this.createMessageWindow();
    this.createScrollTextWindow();
    this.createHelpWindow();
};

Scene_Battle.prototype.createSkillWindow = function() {
    var wy = this._statusWindow.y - 240;
    var wh = 240;
    this._skillWindow = new Window_BattleSkill(0, wy, Graphics.boxWidth, wh);
    this._skillWindow.setHelpWindow(this._helpWindow);
    this._skillWindow.setHandler('ok',     this.onSkillOk.bind(this));
    this._skillWindow.setHandler('cancel', this.onSkillCancel.bind(this));
    this.addWindow(this._skillWindow);
};

Scene_Battle.prototype.createItemWindow = function() {
    var wy = this._statusWindow.y - 240;
    var wh = 240;
    this._itemWindow = new Window_BattleItem(0, wy, Graphics.boxWidth, wh);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
};

Scene_Battle.prototype.createHelpWindow = function() {
    this._helpWindow = new Window_Help();
    this._helpWindow.visible = false;
    this.addWindow(this._helpWindow);
    if(this._itemWindow) {this._itemWindow.setHelpWindow(this._helpWindow);}
    if(this._skillWindow) {this._skillWindow.setHelpWindow(this._helpWindow);}
    //if(this._actorWindow) {this._actorWindow.setHelpWindow(this._helpWindow);}
    //if(this._enemyWindow) {this._enemyWindow.setHelpWindow(this._helpWindow);}
};

//============================================================================================================================
Scene_MenuBase.prototype.createHelpWindow = function() {
    this._helpWindow = new Window_Help();
    this._helpWindow.hide();
    this.addWindow(this._helpWindow);
    if(this._itemWindow) {this._itemWindow.setHelpWindow(this._helpWindow);}
    if(this._slotWindow) {this._slotWindow.setHelpWindow(this._helpWindow);}
    if(this._listWindow) {this._listWindow.setHelpWindow(this._helpWindow);}
};

// Scene_Title =========================================================================================

var Scene_Title_start = Scene_Title.prototype.start;
Scene_Title.prototype.start = function() {
  Scene_Title_start.call(this);
  this.rescaleTitle();
};

Scene_Title.prototype.rescaleTitle = function() {
  this.rescaleTitleSprite(this._backSprite1);
  this.rescaleTitleSprite(this._backSprite2);
};

Scene_Title.prototype.rescaleTitleSprite = function(sprite) {
  if (sprite.bitmap.width <= 0 || sprite.bitmap <= 0) return;
  var width = Graphics.boxWidth;
  var height = Graphics.boxHeight;
  var ratioX = width / sprite.bitmap.width;
  var ratioY = height / sprite.bitmap.height;
  if (ratioX > 1.0) sprite.scale.x = ratioX;
  if (ratioY > 1.0) sprite.scale.y = ratioY;
  this.centerSprite(sprite);
};


// Sprites 
var Sprite_Enemy_setBattler = Sprite_Enemy.prototype.setBattler;
Sprite_Enemy.prototype.setBattler = function(battler) {
    Sprite_Enemy_setBattler.call(this, battler);
    if (!this._enemy._alteredScreenY) {
      this._homeY += Graphics.boxHeight - 624;
      this._enemy._screenY = this._homeY;
      this._enemy._alteredScreenY = true;
    }
    if ($gameSystem.isSideView()) return;
    if (!this._enemy._alteredScreenX) {
      this._homeX += (Graphics.boxWidth - 816) / 2;
      this._enemy._screenX = this._homeX;
      this._enemy._alteredScreenX = true;
    }
};

function Sprite_Battleback() {
    this.initialize.apply(this, arguments);
}

Sprite_Battleback.prototype = Object.create(Sprite.prototype);
Sprite_Battleback.prototype.constructor = Sprite_Battleback;

Sprite_Battleback.prototype.initialize = function(bitmapName, type) {
  Sprite.prototype.initialize.call(this);
  this._bitmapName = bitmapName;
  this._battlebackType = type;
  this.createBitmap();
};

Sprite_Battleback.prototype.createBitmap = function() {
  if (this._bitmapName === '') {
    this.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
  } else {
    if (this._battlebackType === 1) {
      this.bitmap = ImageManager.loadBattleback1(this._bitmapName);
    } else {
      this.bitmap = ImageManager.loadBattleback2(this._bitmapName);
    }
    this.scaleSprite();
  }
};

Sprite_Battleback.prototype.scaleSprite = function() {
  if (this.bitmap.width <= 0) return setTimeout(this.scaleSprite.bind(this), 5);
  var width = Graphics.boxWidth;
  var height = Graphics.boxHeight;
  if (this.bitmap.width < width) {
    this.scale.x = width / this.bitmap.width;
  }
  if (this.bitmap.height < height) {
    this.scale.y = height / this.bitmap.height;
  }
  this.anchor.x = 0.5;
  this.x = Graphics.boxWidth / 2;
  if ($gameSystem.isSideView()) {
    this.anchor.y = 1;
    this.y = Graphics.boxHeight;
  } else {
    this.anchor.y = 0.5;
    this.y = Graphics.boxHeight / 2;
  }
};

// Rewriting the battlebacks
Spriteset_Battle.prototype.createBattleback = function() {
  this._back1Sprite = new Sprite_Battleback(this.battleback1Name(), 1);
  this._back2Sprite = new Sprite_Battleback(this.battleback2Name(), 2);
  this._battleField.addChild(this._back1Sprite);
  this._battleField.addChild(this._back2Sprite);
};

// No more updateBattleback
Spriteset_Battle.prototype.updateBattleback = function() {
};