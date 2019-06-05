//Battle System; 

var BattleSystem = BattleSystem || {};

BattleSystem.calcDamageValue = function(source, target, damage, skill) {
    var atk = source.calcAtkPower(damage, target, skill);
    var def = target.calcDefPower(damage, source, skill);
    return atk * def;
};

Game_BattlerBase.prototype.calcAtkPower = function(damage, target, skill) {
    var value = 0;
    var source = this;
    var base = eval(damage.base);
    if(damage.rate instanceof Array) {
        var rate = this.calcSkillLevelValue(damage.rate, skill.id);
    } else {var rate = damage.rate;}
    value = base * (rate + 100) / 100;
    if (damage.hittype !== null) {
        value *= (this[damage.hittype + "_assist"] + 100) / 100;
    }
    if (damage.element !== null) {
        value *= (this[damage.element + "_assist"] + 100) / 100;
    }
    //tokkou effect
    if (damage.tokkou && target.tags &&target.tags.contains(damage.tokkou)) {
        value *= (damage.tokkou_rate? (100 + damage.tokkou_rate) / 100 : 1.5);
    }

    return value;
};

Game_BattlerBase.prototype.calcDefPower = function(damage, source, skill) {
    var armor_rate;
    var armor;

    if (damage.type === 'phy') {
        armor = this.pdf;
    } else {
        armor = this.mdf;
    }

    if (skill.idr) {
        if (skill.idr instanceof Array) {
            armor *= ((100 - source.calcSkillLevelValue(skill.idr, skill.id))/100);
        } else {
            armor *= ((100 - skill.idr) / 100);
        }
    }
    if(damage.type === 'phy' || damage.type === 'mag') {
        armor_rate = Math.abs(armor) / (Math.abs(armor) + 500 + this._level * 25) * (armor >= 0 ? 1 : -1);
    } else if(damage.type === 'heal') {
        armor_rate = 2;
    } else {
        armor_rate = 0;
    }
    
    var hittype_rate;
    if (damage.hittype === null) {
        hittype_rate = 1;
    } else {
        hittype_rate = (100 - this[damage.hittype + '_resist']) / 100;
    }
    
    var element_rate;
    if (damage.element === null) {
        element_rate = 1;
    } else {
        element_rate = (100 - this[damage.element + '_resist']) / 100;
    }
    return (1 - armor_rate) * hittype_rate * element_rate;
};


// Game_Action =========================================================================================
Game_Action.prototype.hasMagicDamage = function() {
    var item = this.item();
    if (!item.damages) {return false;}
    for (var i = 0; i < item.damages.length; i++) {
        if (item.damages[i].type === 'mag') {return true;}
    }
    return false;
};

Game_Action.prototype.hasPhysicalDamage = function() {
    var item = this.item();
    if (!item.damages) {return false;}
    for (var i = 0; i < item.damages.length; i++) {
        if (item.damages[i].type === 'phy') {return true;}
    }
    return false;
};

Game_Action.prototype.itemCri = function(target) {
    return this.item().damage.critical ? this.subject().cri / (this.subject().cri + 200 + this.subject()._level * 10) : 0;
};


Game_Action.prototype.apply = function(target) {
    var result = target.result();
    var item = this.item();
    var subject = this.subject();
    this.subject().clearResult();
    result.clear();
    result.used = this.testApply(target);
    result.missed = false;

    var hi = this.subject().hit;
    var ev = target.eva;
    result.evaded = (!this.isCertainHit())&&(Math.random() <= (1 - ((10 * hi)/(10 * hi + ev)) * (1 - ev / (10 * hi + ev))));

    result.physical = this.isPhysical();
    result.drain = this.isDrain();
    if (result.isHit()) {
        if (this.item().damages) {
            result.critical = this.item().kanarazuCri||(Math.random() < this.itemCri(target));
            var value = this.makeDamageValue(target, result.critical);
            this.executeDamage(target, value);
        }

        if (this.item().script) eval(this.item().script);
        
        this.item().effects.forEach(function(effect) {
            this.applyItemEffect(target, effect);
        }, this);
        this.applyItemUserEffect(target);
    } else {
        //Evasion response
        //target.onEvasion(this);
    }
    
    if (this.item().enchants) {
        this.item().enchants.forEach(function(enchant) {
            if (result.isHit()||enchant.self) {
                this.applyEnchant(item, enchant, subject, target);
            }
        }, this);
    }
};

Game_Action.prototype.applyEnchant = function(skill, enchant, source, target) {
    if (enchant.prob && Math.randomInt(100) >= enchant.prob) { return; }
    var state = DataManager.findState(enchant.iname);
    var param = enchant.param ? enchant.param : {};
    param = source.calcEnchantLevelValue(param, skill.id);
    param.skill = skill.id;
    param.enchanter = source;
    if (enchant.turns) {param.duration = enchant.turns; }
    if (enchant.self) {
        source.addState(state.id, param);
    } else {
        target.addState(state.id, param);
    }
};

Game_Action.prototype.makeDamageValue = function(target, critical) {
    var item = this.item();
    var subject = this.subject();
    var action = this;
    var baseValue = 0;
    
    //check normal attack
    if (subject.isActor()&&subject.currentClass().attack&&item.id === 1) {
        var damages = subject.currentClass().attack;
    } else {
        var damages = item.damages;
    }
    damages.forEach(function(d) {
        baseValue += BattleSystem.calcDamageValue(subject, target, d, item);
    });
    var value = baseValue;
    if (baseValue < 0) {
        value *= target.rec;
    }
    if (critical) {
        value = this.applyCritical(value);
    }
    value = this.applyVariance(value, 5);
    value = target.onPreDamage(value, subject, action);
    value = Math.round(value);
    return value;
};

Game_Action.prototype.applyCritical = function(damage) {
    if (!this.item().criBonus) {return damage * 1.5; }
    return damage * (150 + this.item().criBonus) / 100;
};

Game_Action.prototype.gainDrainedHp = function(value) {
	if (this.item().drain) {
		var gainTarget = this.subject();
		if (this._reflectionTarget !== undefined) {
			gainTarget = this._reflectionTarget;
		}
		gainTarget.gainHp(value * this.item().drain / 100);
	}
};

Game_Action.prototype.gainDrainedMp = function(value) {
	if (this.item().drain) {
		var gainTarget = this.subject();
		if (this._reflectionTarget !== undefined) {
			gainTarget = this._reflectionTarget;
		}
		gainTarget.gainMp(value * this.item().drain / 100);
	}
};

//Game_BattlerBase action and counter ==================================================================================
Game_BattlerBase.prototype.instantAction = function(skillId, target) {
    var index;
    typeof target === 'number' ? index = target : index = target.index();
    var action = new Game_Action(this, true);
    action.setSkill(skillId);
    action.setTarget(index);
    this._actions.unshift(action);
    BattleManager.forceAction(this);
};

Game_BattlerBase.prototype.counter = function(action, skillId) {
    if (!action.item().Counter) {
        this.instantAction(skillId, action.subject());
    }
};

//custom APIs ================================================================================================================
Game_Actor.prototype.unit = function() {
    return $gameParty;
};


Game_Enemy.prototype.unit = function() {
    return $gameTroop;
};

//Skill Functions ======================================================================================================

//奇术 hp 交换
Game_BattlerBase.prototype.hpExchange = function(target, cap) {
    var my_hp = this.hp;
    var target_hp = target.hp;
    this.setHp(target_hp);
    target.setHp(Math.max(my_hp, Math.round(target.mhp * cap / 100)));
};

//奇术 状态交换
Game_Battler.prototype.statesExchange = function(target, level) {
    var my_states = this._states.filter(function(state) {
        return state.negative && state.obstinacy <= level;
    });
    var target_states = target._states.filter(function(state) {
        return (!state.negative) && state.obstinacy <= level;
    });
    my_states.forEach(function(state) {
        target.addState(state.id, state);
        state.remove();
    });
    target_states.forEach(function(state) {
        this.addState(state.id, state);
        state.remove();
    }, this);
};

//剑豪 斩味
Game_Battler.prototype.kireaji = function() {
    if (!this.isStateAffected(123)) return 0;
    return this.getStateById(123).duration;
};

Game_Battler.prototype.kireajiAdd = function(value) {
    if (!this.isStateAffected(123)) this.addState(123, {duration: 0});
    this.getStateById(123).duration += value;
};

//冥神 复制其他单位的正面状态
Game_Battler.prototype.statesCopy = function(target, level) {
    var target_states = target._states.filter(function(state) {
        return (!state.negative) && state.obstinacy <= level;
    });
    target_states.forEach(function(state) {
        this.addState(state.id, state);
    }, this);
};