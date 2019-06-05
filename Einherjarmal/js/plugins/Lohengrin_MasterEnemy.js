var Lohengrin = Lohengrin || {};
Lohengrin.MasterEnemy = Lohengrin.MasterEnemy || {};

function EXBattleStart(troopId, canEscape, canLose, levels) {
    BattleManager.setup(troopId, canEscape, canLose, levels);
    $gamePlayer.makeEncounterCount();
    SceneManager.push(Scene_Battle);
}

Game_Enemy.prototype.initMembers = function() {
    Game_Battler.prototype.initMembers.call(this);
    this._enemyId = 0;
    this._letter = '';
    this._plural = false;
    this._screenX = 0;
    this._screenY = 0;
    this._level = 0;
};

Game_Enemy.prototype.setup = function(enemyId, x, y, level) {
    this._enemyId = enemyId;
    if(!level) {level = this.enemy().lv||1;}
    this._screenX = x;
    this._screenY = y;
    this._level = level;
    this.tags = this.enemy().tags||[];
    this.recoverAll();
};

Game_Enemy.prototype.initialize = function(enemyId, x, y, level) {
    Game_Battler.prototype.initialize.call(this);
    this.setup(enemyId, x, y, level);
};

BattleManager.setup = function(troopId, canEscape, canLose, levels) {
    this.initMembers();
    this._canEscape = canEscape;
    this._canLose = canLose;
    $gameTroop.setup(troopId, levels||null);
    $gameScreen.onBattleStart();
    this.makeEscapeRatio();
};

Game_Troop.prototype.setup = function(troopId, levels) {
    this.clear();
    this._troopId = troopId;
    this._enemies = [];
    this.troop().members.forEach(function(member) {
        if ($dataEnemies[member.enemyId]) {
            var enemyId = member.enemyId;
            var x = member.x;
            var y = member.y;
            var enemy = new Game_Enemy(enemyId, x, y, levels?levels.shift():null);
            if (member.hidden) {
                enemy.hide();
            }
            this._enemies.push(enemy);
        }
    }, this);
    this.makeUniqueNames();
};

// enemy skills ==================================
Game_Enemy.prototype.passives = function() {
    if (!this.enemy().passives) return [];
    var list = [];
    this.enemy().passives.forEach(function(id) {
        if (!list.contains($dataSkills[id])) {
            list.push($dataSkills[id]);
        }
    });
    return list;
};
//=================================================

Game_Enemy.prototype.exp = function() {
    if(this._level >= $gameParty.averageLevel()) {
        return Math.round((this._level * 50) * Math.pow(1.05, (this._level - $gameParty.averageLevel())));
    } else {
        return this._level * 10;
    }
};

Game_Party.prototype.averageLevel = function() {
    return this.members().reduce(function(total, actor){
        return total + actor._level;
    }, 0) / this.members().length;
};

Game_Enemy.prototype.gold = function() {
    return this.enemy().gold * this._level;
};

Game_Enemy.prototype.makeDropItems = function() {    
    return this.enemy().drops.reduce(function(r, drop) {
        var item = DataManager.findDropItem(drop);
        //bp = base prob, mpl = max prob level
        if (Math.random() * 100 <= drop.bp + 100 * this._level / drop.mpl) {
            for (var i = 0; i < drop.amount; i ++) {
                r.push(item);
            }
        }
        return r;
    }.bind(this), []);
};

// =========================================================================

BattleManager.displayDropItems = function() {
    var items = this._rewards.items;
    if (items.length > 0) {
        $gameMessage.newPage();
        items.forEach(function(item) {
            $gameMessage.add(TextManager.obtainItem.format(item.name));
        });
    }
};