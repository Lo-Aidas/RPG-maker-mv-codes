//=================================================================================
// Ex data
//=================================================================================
var ExData = ExData || {};

//Ex datas load ===================================================================
var $dataClassesEx = null;
var $dataWeaponsEx = null;
var $dataArmorsEx = null;
var $dataStatesEx = null;
var $dataItemsEx = null;
var $dataEnemiesEx = null;
var $dataSkillsEx = null;
var $dataAbilities = null;

ExData.Files = [
	{name: '$dataClassesEx', src: 'ClassesEx.json'},
	{name: '$dataWeaponsEx', src: 'WeaponsEx.json'},
    {name: '$dataArmorsEx', src: 'ArmorsEx.json'},
    {name: '$dataStatesEx', src: 'StatesEx.json'},
    {name: '$dataItemsEx', src: 'ItemsEx.json'},
    {name: '$dataEnemiesEx', src: 'EnemiesEx.json'},
    {name: '$dataSkillsEx', src: 'SkillsEx.json' },
    {name: '$dataActorsEx', src: 'ActorsEx.json'},
    {name: '$dataAbilities', src: 'Abilities.json'}
];
DataManager._databaseFiles = DataManager._databaseFiles.concat(ExData.Files);



DataManager.loadDatabase = function() {
    var test = this.isBattleTest() || this.isEventTest();
    var prefix = test ? 'Test_' : '';
    for (var i = 0; i < this._databaseFiles.length; i++) {
        var name = this._databaseFiles[i].name;
        var src = this._databaseFiles[i].src;
        this.loadDataFile(name, prefix + src);
    }
    if (this.isEventTest()) {
        this.loadDataFile('$testEvent', prefix + 'Event.json');
    }
};
    
DataManager.isDatabaseLoaded = function() {
    this.checkError();
    for (var i = 0; i < this._databaseFiles.length; i++) {
        if (!window[this._databaseFiles[i].name]) {
            return false;
        }
    }
    // combine extra data
    var  name;
    for (var i = 0; i < this._databaseFiles.length; i++) {
        name = this._databaseFiles[i].name;
        if (window[name+"Ex"]) {
            for (var j = 0; j < window[name].length; j++) {
                if(window[name][j]&&window[name+"Ex"][j]) {
                    for (var key in window[name+"Ex"][j]) {
                        window[name][j][key] = window[name+"Ex"][j][key];
                    }
                }
            }
        }
    }
    
    
    return true;
};

// Status ===============================================================================================

Object.defineProperties(Game_BattlerBase.prototype, {

    //status
    STR: { get: function() { return this.getStatus("STR"); }, configurable: true }, //strength
    FIN: { get: function() { return this.getStatus("FIN"); }, configurable: true }, //finess
    CON: { get: function() { return this.getStatus("CON"); }, configurable: true }, //constitution
    INT: { get: function() { return this.getStatus("INT"); }, configurable: true }, //intelligence
    WIL: { get: function() { return this.getStatus("WIL"); }, configurable: true }, //will
    WIT: { get: function() { return this.getStatus("WIT"); }, configurable: true }, //WIT
    
    //seconary status
    mhp: { get: function() { return Math.floor(this.getSecondaryStatus("mhp")); }, configurable: true },
    mmp: { get: function() { return Math.floor(this.getSecondaryStatus("mmp")); }, configurable: true },
    pdm: { get: function() { return this.getSecondaryStatus("pdm"); }, configurable: true },
    mdm: { get: function() { return this.getSecondaryStatus("mdm"); }, configurable: true },
    pdf: { get: function() { return this.getArmor("pdf"); }, configurable: true },
    mdf: { get: function() { return this.getArmor("mdf"); }, configurable: true },
    hit: { get: function() { return this.getSecondaryStatus("hit"); }, configurable: true },
    eva: { get: function() { return this.getSecondaryStatus("eva"); }, configurable: true },
    cri: { get: function() { return this.getSecondaryStatus("cri"); }, configurable: true },
    spd: { get: function() { return this.getSecondaryStatus("spd"); }, configurable: true },
    
    //extra status
    pyros_resist: { get: function() { return this.getExtraStatus("pyros_resist"); }, configurable: true },
    hydor_resist: { get: function() { return this.getExtraStatus("hydor_resist"); }, configurable: true },
    anemos_resist: { get: function() { return this.getExtraStatus("anemos_resist"); }, configurable: true },
    gee_resist: { get: function() { return this.getExtraStatus("gee_resist"); }, configurable: true },
    phos_resist: { get: function() { return this.getExtraStatus("phos_resist"); }, configurable: true },
    erebus_resist: { get: function() { return this.getExtraStatus("erebus_resist"); }, configurable: true },
    
    pyros_assist: { get: function() { return this.getExtraStatus("pyros_assist"); }, configurable: true },
    hydor_assist: { get: function() { return this.getExtraStatus("hydor_assist"); }, configurable: true },
    anemos_assist: { get: function() { return this.getExtraStatus("anemos_assist"); }, configurable: true },
    gee_assist: { get: function() { return this.getExtraStatus("gee_assist"); }, configurable: true },
    phos_assist: { get: function() { return this.getExtraStatus("phos_assist"); }, configurable: true },
    erebus_assist: { get: function() { return this.getExtraStatus("erebus_assist"); }, configurable: true },
    
    blow_resist: { get: function() { return this.getExtraStatus("blow_resist"); }, configurable: true },
    slash_resist: { get: function() { return this.getExtraStatus("slash_resist"); }, configurable: true },
    thrust_resist: { get: function() { return this.getExtraStatus("thrust_resist"); }, configurable: true },
    shoot_resist: { get: function() { return this.getExtraStatus("shoot_resist"); }, configurable: true },
    
    blow_assist: { get: function() { return this.getExtraStatus("blow_assist"); }, configurable: true },
    slash_assist: { get: function() { return this.getExtraStatus("slash_assist"); }, configurable: true },
    thrust_assist: { get: function() { return this.getExtraStatus("thrust_assist"); }, configurable: true },
    shoot_assist: { get: function() { return this.getExtraStatus("shoot_assist"); }, configurable: true },
    
    //states resist
    death_sentence_resist: { get: function() { return this.getExtraStatus("death_sentence_resist"); }, configurable: true },
    POISON_resist: { get: function() { return this.getExtraStatus("POISON_resist"); }, configurable: true },


    // other params
    //技能hp消耗倍率
    hp_cost_rate: { get: function() { return (100 + this.getExtraStatus("hp_cost_rate")) / 100; }, configurable: true }
});

Game_Actor.prototype.calcGrowValue = function(status) {
    var curveType = this.actor().curve || 'Normal';
    var curve = Grow.Curves[curveType];
    var cMax = curve[255];
    var cMin = curve[1];
    var max = this.actor().params[status][1];
    var min = this.actor().params[status][0];
    return (-max * cMin + cMax * min + max * curve[this._level] - min * curve[this._level]) / (cMax - cMin);
};

Game_Enemy.prototype.calcGrowValue = function(status) {
    var curveType = this.enemy().curve || 'Normal';
    var curve = Grow.Curves[curveType];
    var cMax = curve[255];
    var cMin = curve[1];
    var max = this.enemy().params[status][1];
    var min = this.enemy().params[status][0];
    return (-max * cMin + cMax * min + max * curve[this._level] - min * curve[this._level]) / (cMax - cMin);
};



Game_Actor.prototype.classParamRates = function(status) {
    if (this.currentClass().paramRates&&this.currentClass().paramRates[status]) {
        return (100 + this.currentClass().paramRates[status]) / 100;
    }
    return 1;
};

Game_Enemy.prototype.classParamRates = function(status) {
    return 1;
};

Game_Actor.prototype.getEquipAdd = function(value, status) {
    var add = 0;
    var eqs = this.equips();
    for (var i = 0; i < eqs.length; i++){
        var eq = eqs[i];
        if (!eq) { continue; }
        if(eq.adds&&eq.adds[status]) { add += eq.adds[status]; }
        if(eq.mults&&eq.mults[status]) { add += value * eq.mults[status] / 100; }
    }
    return add;
};

Game_Actor.prototype.getEquipArmor = function(value, status) {
    var add = 0;
    var eqs = this.equips();
    for (var i = 0; i < eqs.length; i++){
        var eq = eqs[i];
        if (!eq) { continue; }
        if(eq.adds&&eq.adds[status]) { add += eq.adds[status]; }
    }
    return add;
};

Game_Enemy.prototype.getEquipArmor = function(value, status) {
    return this._level * $dataEnemies[this._enemyId]['params'][status];
};

Game_Enemy.prototype.getEquipAdd = function(value, status) {
    return 0;
};

Game_BattlerBase.prototype.getSkillAdd = function(value, status) {
    var add = 0;
    var skls = this.skills();
    for (var i = 0; i < skls.length; i++){
        var skl = skls[i];
        if (!skl) { continue; }
        if(skl.adds&&skl.adds[status]) { 
            if (skl.adds[status] instanceof Array) {
                add += this.calcSkillLevelValue(skl.adds[status], skl.id);
            } else {
                add += typeof skl.adds[status] === 'string' ? eval(skl.adds[status]) : skl.adds[status];
            }
        }
        if(skl.mults&&skl.mults[status]) { 
            if (skl.mults[status] instanceof Array) {
                add += value * this.calcSkillLevelValue(skl.mults[status], skl.id) / 100;
            } else {
                add += value * skl.mults[status] / 100; 
            }
        }
    }
    return add;
};

Game_BattlerBase.prototype.getStateAdd = function(value, status) {
    var add = 0;
    var states = this._states;
    for (var i = 0; i < states.length; i++){
        var state = states[i];
        if (!state) { continue; }
        if(state.adds&&state.adds[status]) { add += typeof state.adds[status] === 'string' ? eval(state.adds[status]) : state.adds[status]; }
        if(state.mults&&state.mults[status]) { add += value * state.mults[status] / 100; }
    }
    return add;
};

Game_BattlerBase.prototype.calcBaseStatus = function(status) {
    return this.calcGrowValue(status) * this.classParamRates(status);
};

Game_BattlerBase.prototype.calcAddStatus = function(value, status) {
    var add = 0;
    add += this.getEquipAdd(value, status);
    add += this.getSkillAdd(value, status);
    add += this.getStateAdd(value, status);
    return add;
};

Game_BattlerBase.prototype.getStatus = function(status) {
    var value = this.calcBaseStatus(status);
    var add = this.calcAddStatus(value, status);    
    return value + add;
};

ExData.Formulas = {
    "mhp": "this.CON * 20 + this._level * 5",
    "mmp": "this.INT * 5 + this.WIL * 8",
    "pdm": "this.STR * 2",
    "mdm": "this.INT * 1.8 + this.WIL * 0.4",
    "pdf": "this.CON / 5",
    "mdf": "this.INT / 4 + this.WIL * 0.8",
    "hit": "this.FIN * 0.5 + this.WIT * 1.5 + this.STR * 0.2",
    "eva": "this.WIT * 1.2 + this.FIN * 0.2",
    "cri": "this.FIN * 0.6 + this.WIT * 1.4",
    "spd": "this.FIN * 0.5 + this.WIT * 0.5"
};

Game_BattlerBase.prototype.calcBaseSecondaryStatus = function(status) {
    var value = 0;
    var formulas = false;
    if (this.isActor()&&this.currentClass().formulas) {
        formulas = this.currentClass().formulas;
    } else if (this.isEnemy()&&this.enemy().formulas) {
        formulas = this.enemy().formulas;
    }

    if (formulas&&formulas[status]) {
        value = eval(formulas[status]);
    } else {
        value = eval(ExData.Formulas[status]);
    }
    return value * this.classParamRates(status);
};

Game_BattlerBase.prototype.getSecondaryStatus = function(status) {
    var value = this.calcBaseSecondaryStatus(status);
    var add = this.calcAddStatus(value, status);    
    return value + add;
};

Game_BattlerBase.prototype.getArmor = function(status) {
    var value = this.calcBaseSecondaryStatus(status);
    value += this.getEquipArmor(0, status);
    var add = 0;
    add += this.getSkillAdd(value, status);
    add += this.getStateAdd(value, status);
    return value + add;
};

Game_BattlerBase.prototype.getExtraStatus = function(status) {
    var value = 0;
    var add = this.calcAddStatus(value, status);    
    return value + add;
};