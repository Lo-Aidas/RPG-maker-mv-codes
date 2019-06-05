// UI main menu
var UI_MainMenu_temp_Scene_Menu_create = Scene_Menu.prototype.create;
Scene_Menu.prototype.create = function() {
    UI_MainMenu_temp_Scene_Menu_create.call(this);
    var offset = 224;
    var w = 128;
    this.addButton('party', offset, 700, this.commandParty.bind(this));
    this.addButton('formation', offset + w, 700, this.commandFormation.bind(this));
    this.addButton('items', offset + 2 * w, 700, this.commandItem.bind(this));
    this.addButton('status', offset + 3 * w, 700, this.commandPersonal.bind(this));
    this.addButton('synth', offset + 4 * w, 700, this.commandSynthesis.bind(this));
    this.addButton('raid', offset + 5 * w, 700, this.commandRaid.bind(this));
    this.addButton('settings', offset + 6 * w, 700, this.commandOptions.bind(this));
    this.addButton('save', offset + 7 * w, 700, this.commandSave.bind(this));
    this.addButton('exit', offset + 8 * w, 700, this.commandGameEnd.bind(this));
};

Scene_Menu.prototype.addButton = function(image, x, y, method) {
    var button = new Image_Button(image, x, y);
    button._clickHandler = method;
    this.addChild(button);
};

Scene_Menu.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = ImageManager.loadBitmap('img/bg/', 'bg_normal', 0, true);
    this._backgroundSprite.scale.x = Graphics.boxWidth / this._backgroundSprite.width;
    this._backgroundSprite.scale.y = Graphics.boxHeight / this._backgroundSprite.height;
    this.addChild(this._backgroundSprite);
};

Scene_Menu.prototype.commandParty = function() {
    SceneManager.push(Scene_Party);
};


Scene_Menu.prototype.onPersonalOk = function() {
    switch (this._commandWindow.currentSymbol()) {
        case 'skill':
            SceneManager.push(Scene_Skill);
            break;
        case 'equip':
            SceneManager.push(Scene_Equip);
            break;
        case 'status':
            SceneManager.push(Scene_Status);
            break;
        default:
            SceneManager.push(Scene_ActorStatus);
    }
};

//======================================================================================================================
Window_MenuStatus.prototype.windowWidth = function() {
    return Graphics.boxWidth;
};

Window_MenuStatus.prototype.windowHeight = function() {
    return Graphics.boxHeight - 400;
};

Window_MenuCommand.prototype.windowWidth = function() {
    return 0;
};
