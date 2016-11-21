//HP Damage event
//======================================================================================
BattleManager.DamageResponse=function(victim, action, value) {
    var source = action.subject();
    var item = action._item;
    
    // responses goes here.

    //4-残心-4================================================================
    if (victim.isStateAffected(4)&&(value>=victim.mhp*0.5)) { 
        victim.TakeExtraTurn();
    }
    //========================================================================
};

Game_Battler.prototype.onDamage = function(action, value) {
    this.removeStatesByDamage();
    this.chargeTpByDamage(value / this.mhp);
    BattleManager.DamageResponse(this, action, value);
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
