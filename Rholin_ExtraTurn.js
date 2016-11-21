//Extra Turn Plugin by Rholin
// website: otakugen.net
// email: lolingua@outlook.com
// incompatible (mostly) with other battle plugins.
BattleManager.startInput = function() {
    this._phase = 'input';
    if (this.IsExtraTurn()) {
        this._extraActor.makeActions();
        this.clearActor();
        return;
    }
    $gameParty.makeActions();
    $gameTroop.makeActions();
    this.clearActor();
    if (this._surprise || !$gameParty.canInput()) {
        this.startTurn();
    }
};

BattleManager.endTurn = function() {
    if (this.IsExtraTurn()) {
        this._extra = false;
        this.startTurn();
        return;
    }
    this._phase = 'turnEnd';
    this._preemptive = false;
    this._surprise = false;
    this.allBattleMembers().forEach(function(battler) {
        battler.onTurnEnd();
        this.refreshStatus();
        this._logWindow.displayAutoAffectedStatus(battler);
        this._logWindow.displayRegeneration(battler);
    }, this);
};

BattleManager.IsExtraTurn = function() {
    return this._extra;
};

BattleManager.ExtraActor = function() {
    return this._extraActor;
};


Game_Party.prototype.allMembers = function() {
    if (BattleManager.IsExtraTurn()) {
        return [BattleManager.ExtraActor()];
    }
    return this._actors.map(function(id) {
        return $gameActors.actor(id);
    });
};


Game_BattlerBase.prototype.TakeExtraTurn = function() {
    BattleManager._extra = true;
    BattleManager._extraActor = this;
    BattleManager.startInput();
};

//end of file