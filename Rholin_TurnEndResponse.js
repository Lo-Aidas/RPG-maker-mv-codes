BattleManager.TurnEndResponse=function(subject) {
    // responses goes here.
};

BattleManager.BattleStartResponse=function(subject) {
    // responses goes here.
    if (subject.isStateAffected(6)&&(Math.randomInt(100)<=100)) {
        this.InstantAction(subject,7);
    }
};

Game_Battler.prototype.onTurnEnd = function() {
    this.clearResult();
    this.regenerateAll();
    this.updateStateTurns();
    this.updateBuffTurns();
    this.removeStatesAuto(2);
    BattleManager.TurnEndResponse(this);
};

Game_Battler.prototype.onBattleStart = function() {
	BattleManager.BattleStartResponse(this);
    this.setActionState('undecided');
    this.clearMotion();
    if (!this.isPreserveTp()) {
        this.initTp();
    }
};