//Heal event
//========================================================================================
BattleManager.HealResponse=function(beneficier, action, value) {
    var source = action.subject();
    var item = action._item;
    
    // responses goes here.
    
};

Game_Battler.prototype.onHeal = function(action, value) {
    BattleManager.HealResponse(this, action, value);
};

Game_Action.prototype.executeHpDamage = function(target, value) {
    if (this.isDrain()) {
        value = Math.min(target.hp, value);
    }
    this.makeSuccess(target);
    target.gainHp(-value);
    if (value > 0) {
        target.onDamage(this, value);
    }
    if (value < 0) {
        target.onHeal(this, value);
    }
    this.gainDrainedHp(value);
};