BattleManager.updateActionLoop = function() {
	target = this._targets.shift();
    while (target)
    {
        this.invokeAction(this._subject, target);
        target = this._targets.shift();
    }
};

BattleManager.InstantAction = function(subject, skillId, targets){
	if (this._phase != 'action') {
    	this._subject = subject;
    }
	var action = new Game_Action(subject);
	if (skillId==1) {
		action.setAttack();
	} else {
		action.setSkill(skillId);
	}
	if (!targets) {
		targets = action.makeTargets();
	} else {
		targets = action.repeatTargets(targets);
	}
    this._action = action;
    this._targets = targets;
    subject.useItem(action.item());
    this._action.applyGlobal();
    this.refreshStatus();
    this._logWindow.startAction(subject, action, targets);
    if (this._phase != 'action') {
    	this.updateActionLoop();
    }
}