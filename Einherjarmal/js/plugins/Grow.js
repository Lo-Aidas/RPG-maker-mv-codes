//GrowCurves and exp
var Grow = Grow || {};

Grow.Curves = {
    Normal: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255],
    LateA: [0,1,1,1,1,1,2,2,2,2,3,3,3,4,4,4,5,5,6,7,7,8,8,9,10,11,11,12,13,14,15,16,17,18,19,20,21,22,23,24,26,27,28,29,31,32,33,35,36,38,39,41,43,44,46,47,49,51,53,54,56,58,60,62,64,66,68,70,72,74,76,78,81,83,85,87,90,92,94,97,99,102,104,107,109,112,115,117,120,123,125,128,131,134,137,140,143,146,149,152,155,158,161,164,167,170,174,177,180,184,187,190,194,197,201,204,208,211,215,219,222,226,230,233,237,241,245,249,253,257,261,265,269,273,277,281,285,289,294,298,302,306,311,315,320,324,328,333,338,342,347,351,356,361,365,370,375,380,385,389,394,399,404,409,414,419,424,429,435,440,445,450,456,461,466,471,477,482,488,493,499,504,510,515,521,527,533,538,544,550,556,561,567,573,579,585,591,597,603,609,616,622,628,634,640,647,653,659,666,672,679,685,691,698,705,711,718,724,731,738,745,751,758,765,772,779,786,793,800,807,814,821,828,835,842,849,857,864,871,879,886,893,901,908,916,923,931,938,946,954,961,969,977,984,992,1000]
};

// exp  ======================================================================================================================
Grow.expParams = [30,20,30,30];

Game_Actor.prototype.expForLevel = function(level) {
    var basis = Grow.expParams[0];
    var extra = Grow.expParams[1];
    var acc_a = Grow.expParams[2];
    var acc_b = Grow.expParams[3];
    return Math.round(basis*(Math.pow(level-1, 0.9+acc_a/250))*level*
            (level+1)/(6+Math.pow(level,2)/50/acc_b)+(level-1)*extra);
};

Game_Actor.prototype.initExp = function() {
    this._exp = this.currentLevelExp();
};

Game_Actor.prototype.currentExp = function() {
    return this._exp;
};

Game_Actor.prototype.currentLevelExp = function() {
    return this.expForLevel(this._level);
};

Game_Actor.prototype.nextLevelExp = function() {
    return this.expForLevel(this._level + 1);
};

Game_Actor.prototype.nextRequiredExp = function() {
    return this.nextLevelExp() - this.currentExp();
};

Game_Actor.prototype.maxLevel = function() {
    return 255;
};

Game_Actor.prototype.isMaxLevel = function() {
    return this._level >= this.maxLevel();
};

Game_Actor.prototype.changeExp = function(exp, show) {
    this._exp = Math.max(exp, 0);
    var lastLevel = this._level;
    var lastSkills = this.skills();
    while (!this.isMaxLevel() && this.currentExp() >= this.nextLevelExp()) {
        this.levelUp();
    }
    while (this.currentExp() < this.currentLevelExp()) {
        this.levelDown();
    }
    if (show && this._level > lastLevel) {
        this.displayLevelUp(this.findNewSkills(lastSkills));
    }
    this.refresh();
};

Game_Actor.prototype.levelUp = function() {
    this._level++;
    this.recoverAll();
    this.currentClass().learnings.forEach(function(learning) {
        if (learning.level === this._level) {
            this.learnSkill(learning.skillId);
        }
    }, this);
};

Game_Actor.prototype.changeClass = function(classId, keepExp) {
    this._classId = classId;
    this.refresh();
};

// get unit

Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
    if (item&&item.soulSummon) {
        var actor = DataManager.findActor(item.soulSummon);
        $gameParty.addActor(actor.id);
        return;
    }
    var container = this.itemContainer(item);
    if (container) {
        var lastNumber = this.numItems(item);
        var newNumber = lastNumber + amount;
        container[item.id] = newNumber.clamp(0, this.maxItems(item));
        if (container[item.id] === 0) {
            delete container[item.id];
        }
        if (includeEquip && newNumber < 0) {
            this.discardMembersEquip(item, -newNumber);
        }
        $gameMap.requestRefresh();
    }
};