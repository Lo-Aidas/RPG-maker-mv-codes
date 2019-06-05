// Event Responses
var EventResponse = EventResponse || {};

//on pre damage
Game_Battler.prototype.onPreDamage = function (value, source, action) {
	var dmg = value;
    var states = this._states;

    for (var i = 0; i < states.length; i++){
        var masterState = states[i];
        if (masterState.onPreDamage) {
            eval(masterState.onPreDamage);
        }
    }

    var skills = this.isActor()? this.skills() : this.passives();

    for (var i = 0; i < skills.length; i++){
        var skill = skills[i];
        if (skill.onPreDamage){
            eval(skill.onPreDamage);
        }
    }
	return dmg;
};

//onDamage
Game_Battler.prototype.onDamage = function(action, value) {
    this.removeStatesByDamage();
    this.chargeTpByDamage(value / this.mhp);
   
    
    var a = action.subject();
    var source = a;
    var b = this;
    var states = this._states;
    var dmg = value;

    for (var i = 0; i < states.length; i++){
        var masterState = states[i];
        if (masterState.onDamage) {
            eval(masterState.onDamage);
        }
    }

    var skills = this.isActor()? this.skills() : this.passives();

    for (var i = 0; i < skills.length; i++){
        var skill = skills[i];
        if (skill.onDamage){
            eval(skill.onDamage);
        }
    }
};


Game_Action.prototype.executeHpDamage = function(target, value) {
    /*if (this.isDrain()) {
        value = Math.min(target.hp, value);
    }*/
    this.makeSuccess(target);
    if (value > 0) {
        target.onDamage(this, value);
    }
    target.gainHp(-value);
    this.gainDrainedHp(value);
};

//onTurnStart
// need yep battle engine core
Game_Battler.prototype.onTurnStart = function() {
    this.updateStateTurnStart();
    //=======================================================================================
    var states = this._states;
    var a = this;

    // resolve state resist
    for (var i = 0; i < states.length; i++) {
        if (this[states[i].iname + '_resist']&&Math.random() * 100 <= this[states[i].inaem + 'resist']) {
            states[i].remove();
        }
    }


    for (var i = 0; i < states.length; i++){
        var masterState = states[i];
        if (masterState.onTurnStart) {
            eval(masterState.onTurnStart);
        }
    }

    var skills = this.isActor()? this.skills() : this.passives();

    for (var i = 0; i < skills.length; i++){
        var skill = skills[i];
        if (skill.onTurnStart){
            eval(skill.onTurnStart);
        }
    }
};

// onTurnEnd
//need yep battle engine core
Game_Battler.prototype.onTurnEnd = function() {
    this.clearResult();
    if (BattleManager.isTurnBased()) {
      this.regenerateAll();
    } else if (BattleManager.isTickBased() && !BattleManager.isTurnEnd()) {
      this.regenerateAll();
    }
    this.removeStatesAuto(2);
    //=================================================================================
    var states = this._states;
    var a = this;

    for (var i = 0; i < states.length; i++){
        var masterState = states[i];
        if (masterState.dot) {
            this.gainHp(-masterState.dot);
        }
        if (masterState.onTurnEnd) {
            eval(masterState.onTurnEnd);
        }
    }

    var skills = this.isActor()? this.skills() : this.passives();

    for (var i = 0; i < skills.length; i++){
        var skill = skills[i];
        if (skill.onTurnEnd){
            eval(skill.onTurnEnd);
        }
    }
};

//onStateRemove
// see Lohengrin_MasterState.js

//onEvasion
Game_Battler.prototype.onEvasion = function(action) {
    var a = action.subject();
    var b = this;
    
    var states = this._states;
    for (var i = 0; i < states.length; i++){
        var masterState = states[i];
        if (masterState.onEvasion) {
            eval(masterState.onEvasion);
        }
    }

    var skills = this.isActor()? this.skills() : this.passives();

    for (var i = 0; i < skills.length; i++){
        var skill = skills[i];
        if (skill.onEvasion){
            eval(skill.onEvasion);
        }
    }
};

//OnActionEnd

BattleManager.updateAction = function() {
    var target = this._targets.shift();
    if (target) {
        this.invokeAction(this._subject, target);
    } else {
        this.endAction();
    }
};
EventResponse.BattleManager_endAction = BattleManager.endAction;
BattleManager.endAction = function() {
    EventResponse.BattleManager_endAction.call(this);
    this._subject.onActionEnd(this._action, this._subject._lastTarget);
};

Game_Battler.prototype.onActionEnd = function(action, target) {

    var states = this._states;
    for (var i = 0; i < states.length; i++){
        var masterState = states[i];
        if (masterState.onActionEnd) {
            eval(masterState.onActionEnd);
        }
    }

    var skills = this.isActor()? this.skills() : this.passives();

    for (var i = 0; i < skills.length; i++){
        var skill = skills[i];
        if (skill.onActionEnd){
            eval(skill.onActionEnd);
        }
    }
};

// On battle start =====================================================================================================
EventResponse.Game_Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleStart = function() {
    EventResponse.Game_Battler_onBattleStart.call(this);
    //if MOG_BattleCry
    this.isActor()? this.battleCrySetupActor() : this.battleCrySetupEnemy();

    var states = this._states;


    for (var i = 0; i < states.length; i++){
        var masterState = states[i];
        if (masterState.onBattleStart) {
            eval(masterState.onBattleStart);
        }
    }

    var skills = this.isActor()? this.skills() : this.passives();

    for (var i = 0; i < skills.length; i++){
        var skill = skills[i];
        if (skill.onBattleStart){
            eval(skill.onBattleStart);
        }
    }
};

//on (other) death ====================================================================
Game_BattlerBase.prototype.die = function() {
    if (this.onDeath()) return;
    $gameParty.members().forEach(function(actor){
        if (actor!=this) actor.onOtherDeath(this);
    }, this);
    $gameTroop.members().forEach(function(enemy){
        if (enemy!=this) enemy.onOtherDeath(this);
    }, this);
    this._hp = 0;
    this.clearStates();
    this.clearBuffs();
};

/**
 * Handle death events and return if the death is successful;
 *
 * @return {Boolean} if the death is successful
 */
Game_Battler.prototype.onDeath = function() {
    var success = false;

    var states = this._states;
    for (var i = 0; i < states.length; i++){
        var masterState = states[i];
        if (masterState.onDeath) {
            eval(masterState.onDeath);
        }
    }

    var skills = this.isActor()? this.skills() : this.passives();
    for (var i = 0; i < skills.length; i++){
        var skill = skills[i];
        if (skill.onDeath){
            eval(skill.onDeath);
        }
    }
    return success;
};

/**
 * Handle events that are triggered when other unit dies.
 *
 * @param {Game_Battler} the dying unit
 */
Game_Battler.prototype.onOtherDeath = function(dead) {
    var states = this._states;
    for (var i = 0; i < states.length; i++){
        var masterState = states[i];
        if (masterState.onOtherDeath) {
            eval(masterState.onOtherDeath);
        }
    }

    var skills = this.isActor()? this.skills() : this.passives();
    for (var i = 0; i < skills.length; i++){
        var skill = skills[i];
        if (skill.onOtherDeath){
            eval(skill.onOtherDeath);
        }
    }
};