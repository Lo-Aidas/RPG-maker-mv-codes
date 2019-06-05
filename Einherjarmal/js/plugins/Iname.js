// Inames
DataManager.findState = function(iname) {
    return $dataStates.filter(function(state) {
        return state && state.iname === iname;
    })[0];
};

DataManager.findItem = function(iname) {
    return $dataItems.filter(function(item) {
        return item && item.iname === iname;
    })[0];
};

DataManager.findWeapon = function(iname) {
    return $dataWeapons.filter(function(weapon) {
        return weapon && weapon.iname === iname;
    })[0];
};

DataManager.findArmor = function(iname) {
    return $dataArmors.filter(function(armor) {
        return armor && armor.iname === iname;
    })[0];
};

DataManager.findDropItem = function(drop) {
    var item;
    switch(drop.type) {
        case 'item':
            item = DataManager.findItem(drop.iname);
            break;
        case 'weapon':
            item = DataManager.findWeapon((drop.iname));
            break;
        case 'armor':
            item = DataManager.findArmor(drop.iname);
            break;
    }
    return item;
};

DataManager.findSkill = function(iname) {
    return $dataSkills.filter(function(skill) {
        return skill && skill.iname === iname;
    })[0];
};

DataManager.findActor = function(iname) {
    return $dataActors.filter(function(actor) {
        return actor && actor.iname === iname;
    })[0];
};