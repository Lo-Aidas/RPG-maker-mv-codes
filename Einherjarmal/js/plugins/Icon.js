//use custom icons
//also manipulate item rarity and name showing

Window_Base.prototype.drawIcon = function(iconName, x, y, w, h) {
    h = h||this.lineHeight();
    w = w||h||this.lineHeight();
    var bitmap = ImageManager.loadBitmap('img/icons/', iconName, 0, true);
    var pw = bitmap.width;
    var ph = bitmap.height;
    var sx = 0;
    var sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y, w, h);
};

Window_Base.prototype.drawFaceIcon = function(iconName, x, y, w, h) {
    h = h||this.lineHeight();
    w = w||h||this.lineHeight();
    var bitmap = ImageManager.loadBitmap('img/faces/', iconName, 0, true);
    var pw = bitmap.width;
    var ph = bitmap.height;
    var sx = 0;
    var sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y, w, h);
};

Window_Base.prototype.drawImage = function(folder, name, x, y, w, h) {
    var bitmap = ImageManager.loadBitmap(folder, name, 0, true);
    var pw = bitmap.width;
    var ph = bitmap.height;
    var sx = 0;
    var sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y, w, h);
};

Window_Base.prototype.RarityColors = {
    'bronze': 0,
	'silver': 1,
	'golden': 13,
	'legendary': 2,
    'unique': 17
};


Window_Base.prototype.drawItemName = function(item, x, y, width, withText) {
	withText = withText||true;
	width = width || 312;
	if (item) {
		var h = this instanceof Window_Selectable?this.itemWidth()-9:this.lineHeight()-9;
		if (h >= 300) h = this.lineHeight() - 4;
		this.resetTextColor();
        var rarity = item.rarity || 'bronze';
        var prefix = item.piece ? 'piece_' : 'item_';
		this.drawIcon(prefix + 'frame_' + rarity, x + 3, y + 3, h, h);
        if (item.soulSummon) {
            this.drawFaceIcon("#" + item.soulSummon, x + 3, y + 3, h, h);
        } else {
            this.drawIcon(item.icon || 'default_unknown', x + 3, y + 3, h, h);
        }
		if (withText) {
			if (DataManager.isItem(item)||DataManager.isWeapon(item)||DataManager.isArmor(item)) {
				this.changeTextColor(this.textColor(Window_Base.prototype.RarityColors[rarity]));
			}
            if((!(this instanceof Window_Selectable))||(this instanceof Window_SkillList)) {
                this.drawText(item.name, x + h + 8, y, width - h);
            }
			
		}
	}
};


//small icon process
Window_Base.prototype.obtainEscapeParam = function(textState, isIcon) {
    var arr = /^\[\w+\]/.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        if(isIcon) { return arr[0].slice(1,arr[0].length-1); }
        return parseInt(arr[0].slice(1));
    } else {
        return '';
    }
};

Window_Base.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
    case 'C':
        this.changeTextColor(this.textColor(this.obtainEscapeParam(textState)));
        break;
    case 'I':
        this.processDrawIcon(this.obtainEscapeParam(textState, true), textState);
        break;
    case '{':
        this.makeFontBigger();
        break;
    case '}':
        this.makeFontSmaller();
        break;
    }
};

Window_Base.prototype.processDrawIcon = function(iconIndex, textState) {
    this.drawIcon(iconIndex, textState.x + 2, textState.y + 2 , 32, 32);
    textState.x += Window_Base._iconWidth + 4;
};
/*
Window_SkillList.prototype.drawItemName = function(item, x, y, width, withText) {
	withText = withText||true;
	width = width || 312;
	if (item) {
		var h = this.itemHeight() - 9;
		this.resetTextColor();
		this.drawIcon(item.icon, x+6, y +6, h, h);
        this.drawText(item.name, x + h + 24, y, width - h);
	}
};
*/
//==============================
