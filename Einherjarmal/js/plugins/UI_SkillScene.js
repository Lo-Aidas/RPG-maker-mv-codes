

// Scene_Skill

function Scene_ActorSkill() {
    this.initialize.apply(this, arguments);
}

Scene_ActorSkill.prototype = Object.create(Scene_Base.prototype);
Scene_ActorSkill.prototype.constructor = Scene_ActorSkill;

Scene_ActorSkill.prototype.initialize = function(actor) {
    this._actor = actor;
    this._skillList = null;
    this._actorWindow = null;
    this._abilityList = null;
    this._goldWindow = null;
    this._currentAbility = null;
    Scene_Base.prototype.initialize.call(this);
};


Scene_ActorSkill.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createWindowLayer();
    this.createGoldWindow();
    this.createActorWindow();
    this.createAbilityList();
    this.createAbilities();
    this.createSkillList();
    this.createSkills();
    this.createButtons();
};

Scene_ActorSkill.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = ImageManager.loadBitmap('img/bg/', 'bg_normal', 0, true);
    this._backgroundSprite.scale.x = Graphics.boxWidth / this._backgroundSprite.width;
    this._backgroundSprite.scale.y = Graphics.boxHeight / this._backgroundSprite.height;
    this.addChild(this._backgroundSprite);
};

Scene_ActorSkill.prototype.createGoldWindow = function() {
    this._goldWindow = new Window_Gold(0, 0);
    this.addWindow(this._goldWindow);
};

Scene_ActorSkill.prototype.createActorWindow = function() {
    this._actorWindow = new Window_PartyActor(2, 100, 200, 710);
    this._actorWindow.setActor(this._actor);
    this._actorWindow._scrollable = false;
    this.addChild(this._actorWindow);
};

Scene_ActorSkill.prototype.createAbilityList = function() {
    this._abilityList = new Window_Scroll(200, 0, 130, 900);
    this.addWindow(this._abilityList);
    this._abilityList.setScrollDirection(true, false);
    this._abilityList.activate();
};

Scene_ActorSkill.prototype.createAbilities = function() {
    var ability_obj_width = this._abilityList.width;
    var ability_obj_height = 150;
    var abilities = this._actor._registeredAbilities;
    var ability;

    var abilityObjWindow = new Window_AbilityObject(0, 0, ability_obj_width, ability_obj_height);
    abilityObjWindow.setActor(this._actor);
    abilityObjWindow.setAbility($dataAbilities.TALENT);
    this._abilityList.addChild(abilityObjWindow);

    for (var i = 0; i < abilities.length; i++) {
        ability = abilities[i];
        abilityObjWindow = new Window_AbilityObject(0, (i + 1) * ability_obj_height, ability_obj_width, ability_obj_height);
        abilityObjWindow.setActor(this._actor);
        abilityObjWindow.setAbility($dataAbilities[ability]);
        this._abilityList.addChild(abilityObjWindow);
    }

    abilityObjWindow = new Window_AbilityObject(0, (i+1) * ability_obj_height, ability_obj_width, ability_obj_height);
    abilityObjWindow.setActor(this._actor);
    abilityObjWindow.setAbility($dataAbilities.PASSIVE);
    this._abilityList.addChild(abilityObjWindow);

    this._currentAbility = $dataAbilities[abilities[0]];
    this._abilityList.setScrollLimit(0, 0, 0, Math.min(900 - (abilities.length + 2) * 150 - 100, 0));

};

Scene_ActorSkill.prototype.createSkillList = function() {
    this._skillList = new Window_Scroll(this._actorWindow.width + this._abilityList.width, 0, 1600 - this._actorWindow.width - this._abilityList.width, 900);
    this.addWindow(this._skillList);
    this._skillList.setScrollDirection(true, false);
    this._skillList.activate();
};

Scene_ActorSkill.prototype.createSkills = function() {
    var skill_obj_width = this._skillList.width/2;
    var skill_obj_height = 300;
    var skills;
    if (this._currentAbility.iname === 'TALENT') {
        skills = this._actor.talents || [];
        skills = skills.map(function (id) { return $dataSkills[id]; });
    } else if (this._currentAbility.iname === 'PASSIVE') {
        skills = Object.keys(this._actor._skillLevels).map(function(id) {return $dataSkills[id];}).filter(function(skill) {return skill.types.contains('passive'); });
    } else {
        skills = this._currentAbility.skills.map(function (id) { return $dataSkills[id]; });
    }
    var skill;

    for (var i = 0; i < skills.length; i++) {
        skill = skills[i];
        var skillObjWindow = new Window_SkillObject( (i % 2) * skill_obj_width, skill_obj_height * Math.floor(i / 2) + 4, skill_obj_width, skill_obj_height);
        skillObjWindow.setActor(this._actor);
        skillObjWindow.setSkill(skill);
        this._skillList.addChild(skillObjWindow);
    }

    this._skillList.setScrollLimit(0, 0, 0, Math.min(900 - skills.length * 150 - 100, 0));
};

Scene_ActorSkill.prototype.createButtons = function() {
    //create back button
    var button = new Image_Button('back', 1600 - 112, 0, 112, 54);
    button._clickHandler = this.back.bind(this);
    this.addChild(button);
};

Scene_ActorSkill.prototype.refreshSkills = function() {
    this._skillList.children.filter(function(child) {
        return child instanceof Window_SkillObject;
    }).forEach(function(child) {
        this._skillList.removeChild(child);
    }, this);
    this.createSkills();
};

Scene_ActorSkill.prototype.refreshAbilities = function() {
    this._abilityList.children.filter(function(child) {
        return child instanceof Window_AbilityObject;
    }).forEach(function(child) {
        child.refresh();
    });
};

Scene_ActorSkill.prototype.back = function() {
    this.popScene();
};

// Window_AbilityObject ========================================================================================
function Window_AbilityObject() {
    this.initialize.apply(this, arguments);
}

Window_AbilityObject.prototype = Object.create(Window_ScrollObject.prototype);
Window_AbilityObject.prototype.constructor = Window_AbilityObject;

Window_AbilityObject.prototype.initialize = function(x, y, width, height) {
    Window_ScrollObject.prototype.initialize.call(this, x, y, width, height);
    this._actor = null;
    this._ability = null;
    this._viewBtn = null;
    this._equipBtn = null;


};

Window_AbilityObject.prototype.setActor = function(actor) {
    this._actor = actor;
    this.refresh();
};


Window_AbilityObject.prototype.setAbility = function(ability) { // ability as an json object of $dataSkills
    this._ability = ability;
    this.refresh();
};

Window_AbilityObject.prototype.refresh = function() {
    var content = this._window;
    content.contents.clear();
    if (this._viewBtn) this.removeChild(this._viewBtn);
    if (this._equipBtn) this.removeChild(this._viewBtn);

    if (!(this._actor&&this._ability)) return;

    if (this._actor._lockedAbility.concat(this._actor._freeAbility).contains(this._ability.iname)) content.drawIcon('ability_equip_frame', 2, 0, 130, 150);
    content.drawIcon(this._ability.icon, 0, 0, this.width, this.width);
    content.drawText(this._ability.name, 0, 90, 130, 'center');

    if (!this._ability.locked) {
        this._viewBtn = new Image_Button('ability_view', 12, 120, 53, 22);
        this.addChild(this._viewBtn);
        this._viewBtn.setClickHandler(this.view.bind(this));

        this._equipBtn = new Image_Button('ability_equip', 65, 120, 53, 22);
        this.addChild(this._equipBtn);
        this._equipBtn.setClickHandler(this.equip.bind(this));
    } else {
        this._viewBtn = new Image_Button('ability_view', 35, 120, 53, 22);
        this.addChild(this._viewBtn);
        this._viewBtn.setClickHandler(this.view.bind(this));
    }
};

Window_AbilityObject.prototype.view = function() {
    SceneManager._scene._currentAbility = this._ability;
    SceneManager._scene.refreshSkills();
};

Window_AbilityObject.prototype.equip = function() {
    this._actor.equipAbility(this._ability.iname);
    SceneManager._scene.refreshAbilities();
};



// Window_SkillObject ===========================================================================================

function Window_SkillObject() {
    this.initialize.apply(this, arguments);
}

Window_SkillObject.prototype = Object.create(Window_ScrollObject.prototype);
Window_SkillObject.prototype.constructor = Window_SkillObject;

Window_SkillObject.prototype.initialize = function(x, y, width, height) {
    Window_ScrollObject.prototype.initialize.call(this, x, y, width, height);
    this._skill = null;
    this._actor = null;
    this._levelUpBtn = null;
    this._passiveButton = null;
};

Window_SkillObject.prototype.setActor = function(actor) {
    this._actor = actor;
    this.refresh();
};


Window_SkillObject.prototype.setSkill = function(skill) { // skill as an json object of $dataSkills
    this._skill = skill;
    this.refresh();
};

Window_SkillObject.prototype.skill = function() {
    return this._skill;
};

Window_SkillObject.prototype.actor = function() {
    return this._actor;
};

Window_SkillObject.prototype.refresh = function() {
    content = this._window;
    content.contents.clear();
    if (this._levelUpBtn) this.removeChild(this._levelUpBtn);
    if (this._levelUpBtn) this.removeChild(this._passiveButton);
    if (!(this.actor()&&this.skill())) return;

    var title = this.skill().name;
    title = '\\C[1]' + title + '\\C[0]';
    var lv = '等级: ' + this.actor().getSkillLevel(this.skill().id) + '/' + this.actor().skillMaxLevel(this.skill().id);
    var types = '类型: ';
    this.skill().types.forEach(function(type) {
        types += '\\I[type_' + type + ']';
    });
    content.drawTextEx(title, 5, 0);
    content.drawTextEx(lv, 5, 36);
    content.drawTextEx(types, 5, 72);
    content.drawTextEx(this.skill().description, 5, 108);

    this._levelUpBtn = new Image_Button('plus', 600, 42, 28, 28);
    this.addChild(this._levelUpBtn);
    this._levelUpBtn.setClickHandler(this.levelUp.bind(this));

    var x = content.contents.measureTextWidth(this.skill().name) + 20;
    if (this.skill().types.contains('passive')) {
        if (this.actor().isPassiveEquipped(this.skill().id)) {
            this._passiveButton = new Image_Button('passive_unequip', x, 0, 105, 36);
            this.addChild(this._passiveButton);
            this._passiveButton.setClickHandler(this.unequip.bind(this));
        } else {
            this._passiveButton = new Image_Button('passive_equip', x, 0, 105, 36);
            this.addChild(this._passiveButton);
            this._passiveButton.setClickHandler(this.equip.bind(this));
        }
    }
};

Window_SkillObject.prototype.levelUp = function() {
    var level = this.actor().getSkillLevel(this.skill().id);
    if (level < this.actor().skillMaxLevel(this.skill().id) && $gameParty.gold() >= level * 1000) {
        $gameParty.loseGold(level * 1000);
        SceneManager._scene._goldWindow.refresh();
        this.actor().SkillLevelUp(this.skill().id);
        this.refresh();
    } else {
        alert('金币不足或已达最大等级。')
    }
};

Window_SkillObject.prototype.equip = function() {
    this.actor().equipPassive(this.skill().id);
    SceneManager._scene.refreshSkills();
};

Window_SkillObject.prototype.unequip = function() {
    this.actor().unequipPassive(this.skill().id);
    SceneManager._scene.refreshSkills();
};