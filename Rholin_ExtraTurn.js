//Extra Turn Plugin by Rholin
// website: otakugen.net
// email: lolingua@outlook.com

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

BattleManager.startTurn = function() {
    this._phase = 'turn';
    this.clearActor();
    if (this.IsExtraTurn()) {
        this._actionBattlers = [this.ExtraActor()];
        this._logWindow.startTurn();
        return;
    }
    $gameTroop.increaseTurn();
    this.makeActionOrders();
    $gameParty.requestMotionRefresh();
    this._logWindow.startTurn();
};


var _alias_extraturn_endturn = BattleManager.endTurn;
BattleManager.endTurn = function() {
    if (this.IsExtraTurn()) {
        this._extra = false;
        this._actionBattlers = this._temp_actionBattlers;
        this._actionBattlers.push(this.ExtraActor());
        this.ExtraActor()._actions = this._defaultActs;
        this._actionBattlers.forEach(function(battler) {
            battler.makeSpeed();
        });
        this._actionBattlers.sort(function(a, b) {
            return b.speed() - a.speed();
        });

        this._phase = 'turn';
        return;
    }
    _alias_extraturn_endturn.call(this);
};

BattleManager.IsExtraTurn = function() {
    return this._extra;
};

BattleManager.ExtraActor = function() {
    return this._extraActor;
};

BattleManager.actor = function() {
    if (BattleManager.IsExtraTurn()) {
        return this.ExtraActor();
    } 
    return this._actorIndex >= 0 ? $gameParty.members()[this._actorIndex] : null;
};

var _alias_extraturn_selectNextCommand = BattleManager.selectNextCommand;
BattleManager.selectNextCommand = function() {
    if (BattleManager.IsExtraTurn()) {
        this.startTurn();
        return;
    }
    _alias_extraturn_selectNextCommand.call(this);
};


Game_BattlerBase.prototype.TakeExtraTurn = function() {
    if(this.isAlive() ){
        BattleManager._extra = true;
        BattleManager._extraActor = this;
        BattleManager._temp_actionBattlers = BattleManager._actionBattlers;
        BattleManager._defaultActs = this._actions;
        BattleManager.startInput();
    }
};

//end of file
