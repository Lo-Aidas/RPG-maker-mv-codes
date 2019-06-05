
//Scene_ActorStatus

function Scene_ActorStatus() {
    this.initialize.apply(this, arguments);
}

Scene_ActorStatus.prototype = Object.create(Scene_Base.prototype);
Scene_ActorStatus.prototype.constructor = Scene_ActorStatus;

Scene_ActorStatus.prototype.initialize = function() {
    this._window = null;
    Scene_Base.prototype.initialize.call(this);
};

Scene_ActorStatus.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this._actor = $gameParty.menuActor();
    this.createBackground();
    this.createWindowLayer();
    this.createWindow();
    this.createButtons();
};

Scene_ActorStatus.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = ImageManager.loadBitmap('img/bg/', 'bg_normal', 0, true);
    this._backgroundSprite.scale.x = Graphics.boxWidth / this._backgroundSprite.width;
    this._backgroundSprite.scale.y = Graphics.boxHeight / this._backgroundSprite.height;
    this.addChild(this._backgroundSprite);
};

Scene_ActorStatus.prototype.createWindow = function() {
    this._window = new Window_Base(0, 0, 1600, 900);
    this.addWindow(this._window);
    this.refreshWindow();
};

Scene_ActorStatus.prototype.refreshWindow = function() {
    this._window.contents.clear();
    this._window.children.filter(function(child) {
        return child instanceof Image_Button;
    }).forEach(function(child) {
        this._window.removeChild(child);
    }, this);
    this.drawParameters(25, 140);
};

Scene_ActorStatus.prototype.createButtons = function() {
    //create back button
    var button = new Image_Button('back', 1600 - 112, 0, 112, 54);
    button._clickHandler = this.back.bind(this);
    this.addChild(button);
};

Scene_ActorStatus.prototype.back = function() {
    this.popScene();
};

Scene_ActorStatus.prototype.drawParameters = function(x, y) {
    var orgY = y;
    var w = this._window;
    var lineHeight = 36;
    var y2;
    var baseStatus;
    var status_array = ["STR","FIN","CON","INT","WIL","WIT"];
    var status_names = ["力量","敏捷","体质","智力","意志","感知"];
    for (var i = 0; i < status_array.length; i++) {
        y2 = y + lineHeight * i;
        w.changeTextColor(w.systemColor());
        w.drawText(status_names[i], x, y2, 160);
        w.resetTextColor();
        w.drawText(Math.round(this._actor[status_array[i]]), x + 160, y2, 60, 'right');
        baseStatus = this._actor.calcBaseStatus(status_array[i]);
        w.drawText('(' + Math.round(baseStatus), x + 230, y2, 60, 'left');
        w.changeTextColor(w.textColor(3));
        w.drawText('+' + Math.round(this._actor.calcAddStatus(baseStatus, status_array[i])), x + 280, y2, 60, 'left');
        w.resetTextColor();
        w.drawText(')', x + 340, y2, 60, 'left');
    }

    y = y2 + 2 * lineHeight;
    status_array = ["pdm","mdm","pdf","mdf","hit","eva","cri","spd"];
    status_names = ["物理攻击","魔法攻击","物理防御","魔法防御","命中","闪避","会心","速度"];
    for (var i = 0; i < status_array.length; i++) {
        y2 = y + lineHeight * i;
        w.changeTextColor(w.systemColor());
        w.drawText(status_names[i], x, y2, 160);
        w.resetTextColor();
        w.drawText(Math.round(this._actor[status_array[i]]), x + 160, y2, 60, 'right');
        baseStatus = this._actor.calcBaseSecondaryStatus(status_array[i]);
        w.drawText('(' + Math.round(baseStatus), x + 230, y2, 60, 'left');
        w.changeTextColor(w.textColor(3));
        w.drawText('+' + Math.round(this._actor.calcAddStatus(baseStatus, status_array[i])), x + 280, y2, 60, 'left');
        w.resetTextColor();
        w.drawText(')', x + 340, y2, 60, 'left');
    }

    y = orgY;
    x = x + 400;
    status_array = ["pyros","hydor","anemos","gee", "phos", "erebus", "blow","slash","thrust","shoot"];
    status_names = ["火","水","风","地","光","暗","打击","斩击","刺击","射击"];
    for (var i = 0; i < status_array.length; i++) {
        y2 = y + lineHeight * i;
        w.changeTextColor(w.systemColor());
        w.drawText(status_names[i] + '加成', x, y2, 160);
        w.resetTextColor();
        w.drawText(Math.round(this._actor[status_array[i] + '_assist']), x + 160, y2, 60, 'right');
    }

    x = x + 400;
    for (var i = 0; i < status_array.length; i++) {
        y2 = y + lineHeight * i;
        w.changeTextColor(w.systemColor());
        w.drawText(status_names[i] + '抗性', x, y2, 160);
        w.resetTextColor();
        w.drawText(Math.round(this._actor[status_array[i] + '_resist']), x + 160, y2, 60, 'right');
    }

    x = x + 400;
    w.drawActorFace(this._actor, x + 24, 100);
    w.drawHpGauge(this._actor, x, 270);
    w.drawMpGauge(this._actor, x, 300);
    var expTotal = this._actor.currentExp();
    var expNext = this._actor.nextRequiredExp();
    w.drawText('lv ' + this._actor.level, x, 320, 400);
    w.drawText('经验: ' + expTotal, x, 356, 400);
    w.drawText('升级需要经验: ' + expNext, x, 392, 400);


    // job setters
    w.drawIcon($dataClasses[this._actor.jobs[0]].icon, x, 428, 64, 64);
    var jobSetter = new Image_Button('job_setter', x + 85, 428 + 20, 187, 64);
    w.addChild(jobSetter);
    jobSetter.setClickHandler(this.setJob.bind(this, 0));

    w.drawIcon($dataClasses[this._actor.jobs[1]].icon, x, 428 + 64, 64, 64);
    if (this._actor._level >= 50) {
        jobSetter = new Image_Button('job_setter', x + 85, 428 + 64 + 20, 187, 64);
        w.addChild(jobSetter);
        jobSetter.setClickHandler(this.setJob.bind(this, 1));
    } else {
        w.drawText('50级解锁', x + 70, 428 + 64 + 14, 400);
    }

    w.drawIcon($dataClasses[this._actor.jobs[2]].icon, x, 428 + 64 * 2, 64, 64);
    if (this._actor._level >= 75) {
        jobSetter = new Image_Button('job_setter', x + 85, 428 + 64 * 2 + 20, 187, 64);
        w.addChild(jobSetter);
        jobSetter.setClickHandler(this.setJob.bind(this, 2));
    } else {
        w.drawText('75级解锁', x + 70, 428 + 64 * 2 + 14, 400);
    }
};

Scene_ActorStatus.prototype.setJob = function(jobId) {
    this._actor.setClass(this._actor.jobs[jobId]);
    this.refreshWindow();
};