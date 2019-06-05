// Skill Level System

// new: job, skill, ability, skill equip system
var SkillLevelSystem_Game_Actor_initMembers = Game_Actor.prototype.initMembers;
Game_Actor.prototype.initMembers = function() {
    SkillLevelSystem_Game_Actor_initMembers.call(this);
    this._skillLevels = {};
    this._talentSkills = []; //角色天赋技能
    this._lockedSkills = []; //职业固有技能
    this._freeSkills = []; // 职业通用技能
    this._passiveSkills = []; // 被动技能
    this._registeredAbilities = [];
    this._lockedAbility = null;
    this._freeAbility = null;
};

Game_Actor.prototype.setClass = function(classId) {
    this._classId = classId;
    var job = $dataClasses[classId];
    var skills = $dataAbilities[job.lockedAbility].skills.concat($dataAbilities[job.freeAbility].skills, job.passives);
    skills.forEach(function(id) {
        this.registerSkill(id);
    }, this);
    this.registerAbility(job.lockedAbility);
    this.registerAbility(job.freeAbility);
    this.setAbility(job.lockedAbility);
    this.equipAbility(job.freeAbility);
    this.refresh();
};

Game_Actor.prototype.registerAbility = function(ability) { // use ability iname
    if (!this._registeredAbilities.contains(ability)) {
        this._registeredAbilities.push(ability);
    }
};

Game_Actor.prototype.setAbility = function(ability) {  // use ability iname
    this._lockedAbility = ability;
    this._lockedSkills = $dataAbilities[ability].skills;
};

Game_Actor.prototype.equipAbility = function(ability) {  // use ability iname
    this._freeAbility = ability;
    this._freeSkills = $dataAbilities[ability].skills;
};

Game_Actor.prototype.equipPassive = function(skillId) {
    if (typeof skillId === 'string') {
        skillId = DataManager.findSkill(skillId).id;
    }
    if (this.canEquipPassive(skillId)) {
        this._passiveSkills.push(skillId);
    }
};

Game_Actor.prototype.unequipPassive = function(skillId) {
    var index = this._passiveSkills.indexOf(skillId);
    if (index >= 0) {
        this._passiveSkills.splice(index, 1);
    }
};

Game_Actor.prototype.isPassiveEquipped = function(skillId) {
    if (typeof skillId === 'string') {
        skillId = DataManager.findSkill(skillId).id;
    }
    return this._passiveSkills.contains(skillId);
};

Game_Actor.prototype.canEquipPassive = function(skillId) {
    if (typeof skillId === 'string') {
        skillId = DataManager.findSkill(skillId).id;
    }
    return this._passiveSkills.length < 3 && !this.isPassiveEquipped(skillId);
};

Game_Actor.prototype.skills = function() {
    var list = [];
    this._skills.concat(this._talentSkills, this._lockedSkills, this._freeSkills, this._passiveSkills, this.addedSkills()).forEach(function(id) {
        if (!list.contains($dataSkills[id])) {
            list.push($dataSkills[id]);
        }
    });
    return list;
};

Game_Actor.prototype.registerSkill = function(skillId) {
    if (!this._skillLevels[skillId]) this._skillLevels[skillId] = 1;
};

Game_Actor.prototype.setSkillLevel = function(skillId, lv) {
    this._skillLevels[skillId] = lv;
};

Game_Actor.prototype.SkillLevelUp = function(skillId) {
    this._skillLevels[skillId] ++;
};

Game_Actor.prototype.getSkillLevel = function(skillId) {
    return this._skillLevels[skillId];
};

Game_Actor.prototype.skillMaxLevel = function(skillId) {
    return $dataSkills[skillId].cap ? $dataSkills[skillId].cap : 10;
};

Game_Actor.prototype.learnSkill = function(skillId) {
    if (typeof skillId === 'string') {
        skillId = DataManager.findSkill(skillId).id;
    }
    if (!this.isLearnedSkill(skillId)) {
        this._skills.push(skillId);
        this.setSkillLevel(skillId, 1);
        this._skills.sort(function(a, b) {
            return a - b;
        });
    }
};


Game_Actor.prototype.calcSkillLevelValue = function(value, skillId) {
    var c = 0;
    if (value.length >= 3) { c = eval(value[2]); }
    return c + (value[0] + (value[1] - value[0]) * (this.getSkillLevel(skillId) - 1) / (this.skillMaxLevel(skillId) - 1));
};

Game_Enemy.prototype.calcSkillLevelValue = function(value, skillId) {
    return value[1];
};

Game_Battler.prototype.calcEnchantLevelValue = function(param, skillId) {
    var newParam = {};
    for (var key in param) {
        if (param[key] instanceof Array) {
            newParam[key] = this.calcSkillLevelValue(param[key], skillId);
        } else if ((typeof param[key]) === "number" ||(typeof param[key]) === "string") {
            newParam[key] = param[key];
        } else {
            newParam[key] = this.calcEnchantLevelValue(param[key], skillId);
        }
    }
    return newParam;
};
