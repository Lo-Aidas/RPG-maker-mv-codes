//=================================================================================
// Master State
//=================================================================================

function MasterState() {
	this.initialize.apply(this,arguments);
};
MasterState.prototype.constructor = MasterState;

MasterState.prototype.initialize = function(stateId, param) {
	var state = $dataStates[stateId];
    this.id = stateId;
    this.duration = state.maxTurns;
    this.icon = state.icon;//Need Lohengrin_Icon.js
    for (var key in param) {
        this[key] = param[key];
    }
    for (var key in state) {
        if(!this[key]) {this[key] = state[key];}
    }
};

MasterState.prototype.isExpired = function() {
    return this.duration <= 0;
};

MasterState.prototype.remove = function() {
    var i = this.owner._states.indexOf(this);
    this.owner.removeStateByIndex(i);
    this.onStateRemove();
};

MasterState.prototype.turnProgress = function() {
    this.duration --;
    if (this.duration <= 0) {
        this.remove();
    }
};

MasterState.prototype.turnRetrogress = function() {
    this.duration ++;
};

MasterState.prototype.onStateRemove = function() {
    var a = this.owner;
    if(this.onRemove){
        eval(this.onRemove);
    }
};

Game_BattlerBase.prototype.states = function() { //states() for states ids, _states for masterStates
    return this._states.map(function(masterState) {
        return $dataStates[masterState.id];
    });
};

Game_BattlerBase.prototype.addNewState = function(stateId, param) {
	param = param||{};
    if (stateId === this.deathStateId()) {
        this.die();
    }
    var restricted = this.isRestricted();
    var masterState = new MasterState(stateId, param);
    this._states.push(masterState);
    masterState.owner = this;
    if (!restricted && this.isRestricted()) {
        this.onRestrict();
    }
};

Game_BattlerBase.prototype.isStateAffected = function(stateId, skillId) {
    var filtered = this._states.filter(function(state) {
        return state.id === stateId && (!skillId||state.skill === skillId)
    });
    return filtered.length > 0;
};

Game_BattlerBase.prototype.getStateById = function(stateId) {
    var states = this._states;
    for (var i = 0; i < states.length; i++){
        if(states[i].id === stateId) {return states[i];}
    }
    return null;
};


Game_Battler.prototype.addState = function(stateId, param) {
	param = param||{};
	var state = $dataStates[stateId];
    var stackRule = state.rule || 'unique';
    switch(stackRule){
        case 'unique':
            if (this.isStateAffected(stateId)) {return; }
            break;
        case 'multi':
            var filtered = this._states.filter(function(st){
                return st && st.skill == param.skill && st.id == stateId
            });
            if (filtered.length > 0) { return; }
            break;
        case 'repeat':
            break;
        case 'refresh':
            if (this.isStateAffected(stateId)) {
                this.getStateById(stateId).duration = Math.max(state.maxTurns, param.duration);
                return;
            }
            break;
    }
    if (this.isStateAddable(stateId)) {
        this.addNewState(stateId,param);
        this.refresh();
        this._result.pushAddedState(stateId);
    }
};

Game_BattlerBase.prototype.eraseState = function(stateId) {
    for (var i=0;i<this._states.length;i++) {
    	if (this._states[i].id===stateId) {
            this._states[i].onStateRemove();
    		this._states.splice(i--, 1);
    	}
    }
};

Game_Battler.prototype.purge = function(negative, level) {
    var filtered;
    if(negative) {
        filtered = this._states.filter(function(state) {
            return state.negative && state.obstinacy <= level;
        });
    } else {
        filtered = this._states.filter(function(state) {
            return (!state.negative) && state.obstinacy <= level;
        });
    }
    filtered.forEach(function(state) {
        state.remove();
    });
};




Game_Battler.prototype.removeStateByIndex = function(index) {
	var id = this._states[index].id;
    if (this._states.length > index) {
        if (id === this.deathStateId()) {
            this.revive();
        }
        this._states[index].onStateRemove();
        this._states.splice(index,1);
        this.refresh();
        this._result.pushRemovedState(id);
    }
};

Game_BattlerBase.prototype.updateStateTurns = function() {
    this._states.forEach(function(masterState) {
        if (masterState.duration > 0 && (!masterState.spGauge) ) {  //spGauge 表示改状态为特殊量表
            masterState.duration--;
        }
    }, this);
};

Game_BattlerBase.prototype.isStateExpired = function(masterState) {
    return this._stateTurns[stateId] === 0;
};


Game_Battler.prototype.removeStatesAuto = function(timing) {
	for (var i = this._states.length - 1; i >= 0; i--){
		var masterState = this._states[i];
		if (masterState && masterState.isExpired() && masterState.autoRemovalTiming === timing) {
            masterState.remove();
        }
	}
};

//this is for yep battle engine
Game_BattlerBase.prototype.updateStateTurnTiming = function(timing) {
    if (this.isBypassUpdateTurns()) return;
    this._freeStateTurn = this._freeStateTurn || [];

    for (var i = this._states.length - 1; i >= 0; i--) {
      var masterState = this._states[i];
      if ($dataStates[masterState.id].autoRemovalTiming !== timing) continue;
      masterState.turnProgress();
      //if (masterState.duration <= 0) {this.removeStateByIndex(i);}
    }

};

//Traits
Game_BattlerBase.prototype.traitObjects = function() {
    // Returns an array of the all objects having traits. States only here.
    return this._states;
};

//==============================================================================================
// show enemy state
//==============================================================================================
Game_BattlerBase.prototype.stateIcons = function() {
    return this._states.map(function(masterState) {
        return masterState.icon;
    });
};

Game_BattlerBase.prototype.allIcons = function() {
    return this.stateIcons();
};

Sprite_StateIcon.prototype.initMembers = function() {
    this._battler = null;
    this._icons = [];
    this._animationCount = 0;
    this._animationIndex = 0;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
};

Sprite_StateIcon.prototype.loadBitmap = function() {
    this.bitmap = new Bitmap(Sprite_StateIcon._iconWidth,Sprite_StateIcon._iconHeight);
    this.bitmap.fontSize = 16;
    this.setFrame(0, 0, 0, 0);
};

Sprite_StateIcon.prototype.setup = function(battler) {
    this._battler = battler;
};

Sprite_StateIcon.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this._animationCount++;
    if (this._animationCount >= this.animationWait()) {
        this.updateIcon();
        this.updateFrame();
        this._animationCount = 0;
    }
};

Sprite_StateIcon.prototype.animationWait = function() {
    return 40;
};

Sprite_StateIcon.prototype.updateIcon = function() {
    var icons = [];
    if (this._battler && this._battler.isAlive()) {
        icons = this._battler.allIcons();
    }
    this._icons = icons;
};

Sprite_StateIcon.prototype.updateFrame = function() {
    var pw = Sprite_StateIcon._iconWidth;
    var ph = Sprite_StateIcon._iconHeight;
    var sx = 0;//this._iconIndex % 16 * pw;
    var sy = 0;//Math.floor(this._iconIndex / 16) * ph;
    this.bitmap.clear();
    this.bitmap.resize(pw*this._icons.length,ph);
    for (i = 0; i < this._icons.length; i++){
      var bitmap = ImageManager.loadBitmap('img/icons/',this._icons[i],0,true);
      this.bitmap.blt(bitmap, 0, 0, bitmap.width, bitmap.height, pw * i, 0,pw,ph);
      this.bitmap.drawText(this._battler._states[i].duration, -1+pw*i, 8, pw, ph, 'right');
    }
    this.setFrame(sx, sy, pw * this._icons.length, ph);
};
