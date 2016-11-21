BattleManager.onActionEnd= function(subject,action) {
	//here goes the responses.

	//8-不动-7 到期
	if (subject.isStateAffected(7) && action.isPhysical()) {
		subject.removeState(7);
	}
}

BattleManager.endAction = function() {
    this._logWindow.endAction(this._subject);
    this._phase = 'turn';
    this.onActionEnd(this._subject, this._action);
};