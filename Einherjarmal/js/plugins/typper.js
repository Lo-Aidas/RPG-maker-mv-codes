$gameTroop.turnCount()

//Osiris
Eval ($gameTroop.turnCount()+2)%5 == 1: Skill 125
Eval user.hpRate()>0.5&&(!user.isStateAffected(82,122)): Skill 122
Eval user._states.filter(function(state) {return (!state.negative);}).length>=5:Skill 127
Random 50%: Skill 123, Lowest hp
Random 60%: Skill 124, Lowest hp
Always: Skill 126

hp% param <= 30%: Skill 128, Lowest hp
Eval ($gameTroop.turnCount()+2)%5 == 1: Skill 112
Eval !user.isStateAffected(21,110): Skill 110, Lowest mdm
Random 50%: Skill 109
Random 80%: Skill 111


Eval $gameTroop.turnCount()%3 == 1: Skill 36
Eval user.hpRate() <= 0.35: Skill 38
Random 30%: Skill 40, Heighest pdm
Random 40%: Skill 37
Always: Skill 39


//通用药师AI
hp% param <= 50%: Skill 49, Lowest hp
hp% param <= 20%: Skill 48, Lowest hp
state === state 7: Skill 44
state === state 8: Skill 45
state === state 10: Skill 47
state === state 4: Skill 50
Random 50%: Skill 61
party alive members >= 3: Skill 63
Always: Skill 60


Random 25%: Skill 55
Random 40%: Skill 56
Random 60%: Skill 58
Random 90%: Skill 59

//咒术师
Eval user.isStateAffected(22, 105): Skill 103
Eval $gameTroop.turnCount()%5 == 1: Skill 102
hp% param <= 30%: Skill 104, Lowest hp
Eval user.mp <= 300: Skill 100
Random 20%: Skill 99
Random 30%: Skill 105
Random 40%: Skill 101, Lowest pyros_resist


