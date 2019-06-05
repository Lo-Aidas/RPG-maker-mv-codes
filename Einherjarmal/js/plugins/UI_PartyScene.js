

// Scene_Party

function Scene_Party() {
    this.initialize.apply(this, arguments);
}

Scene_Party.prototype = Object.create(Scene_Base.prototype);
Scene_Party.prototype.constructor = Scene_Party;

Scene_Party.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_Party.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createWindowLayer();
    this.createScrollWindow();
    this.createButtons();
    this.createActors();
};

Scene_Party.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = ImageManager.loadBitmap('img/bg/', 'bg_normal', 0, true);
    this._backgroundSprite.scale.x = Graphics.boxWidth / this._backgroundSprite.width;
    this._backgroundSprite.scale.y = Graphics.boxHeight / this._backgroundSprite.height;
    this.addChild(this._backgroundSprite);
};

Scene_Party.prototype.createScrollWindow = function() {
    this._scrollWindow = new Window_Scroll(0, 0, 1600, 900);
    this.addWindow(this._scrollWindow);
    this._scrollWindow.setScrollDirection(false, true);
    this._scrollWindow.activate();
};

Scene_Party.prototype.createButtons = function() {
    //create back button
    var button = new Image_Button('back', 1600 - 112, 0, 112, 54);
    button._clickHandler = this.back.bind(this);
    this.addChild(button);
};

Scene_Party.prototype.createActors = function() {
    var actors = $gameParty.allMembers();
    var actor;

    var w = 200; //actor bar width

    for (var i = 0; i < actors.length; i++) {
        actor = actors[i];
        var actorWindow = new Window_PartyActor(100 + w * i, 100, w, 710);
        actorWindow.setActor(actor);
        this._scrollWindow.addChild(actorWindow);
        actorWindow._skillBtn.setClickHandler(this.toSkillScene.bind(this, actorWindow._actor));
        actorWindow._equipBtn.setClickHandler(this.toEquipScene.bind(this, actorWindow._actor));
    }
};

Scene_Party.prototype.back = function() {
    this.popScene();
};

Scene_Party.prototype.toSkillScene = function(actor) {
    SceneManager._stack.push(SceneManager._scene.constructor);
    SceneManager._nextScene = new Scene_ActorSkill(actor);
    if (SceneManager._scene) {
        SceneManager._scene.stop();
    }
};

Scene_Party.prototype.toEquipScene = function(actor) {
    SceneManager._stack.push(SceneManager._scene.constructor);
    SceneManager._nextScene = new Scene_ActorEquip(actor);
    if (SceneManager._scene) {
        SceneManager._scene.stop();
    }
};

// Scene Components
function Window_PartyActor() {
    this.initialize.apply(this, arguments);
}

Window_PartyActor.prototype = Object.create(Window_ScrollObject.prototype);
Window_PartyActor.prototype.constructor = Window_PartyActor;

Window_PartyActor.prototype.initialize = function(x, y, width, height) {
    Window_ScrollObject.prototype.initialize.call(this, x, y, width, height);
    this._actor = null;
    this._equipBtn = null;
    this._skillBtn = null;
};

Window_PartyActor.prototype.setActor = function(actor) {
    this._actor = actor;
    this.refresh();
};

Window_PartyActor.prototype.refresh = function() {
    content = this._window;
    content.contents.clear();

    content.drawImage('img/actors/', $dataActors[this._actor._actorId].iname, 0, 0, 200, 710);
    content.drawImage('img/system/', 'party_actorinfo', 0, 400, 200, 310);
    content.drawText(this._actor.name(), 0, 410, 200, 'center');
    content.drawText('lv ' + this._actor._level + ' ' + this._actor.currentClass().name, 5, 460, 150, 'left');
    content.drawIcon(this._actor.currentClass().icon, 156, 460, 36, 36);
    content.drawHpGauge(this._actor, 8, 514, 180);
    content.drawMpGauge(this._actor, 8, 542, 180);

    this._equipBtn = new Image_Button('party_equip', 3, 570, 190, 65);
    this.addChild(this._equipBtn);

    this._skillBtn = new Image_Button('party_skill', 3, 638, 190, 65);
    this.addChild(this._skillBtn);
};