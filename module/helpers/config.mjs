export const basicRpg = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {Object}
 */
 basicRpg.abilities = {  
	"STR": "basicRpg.CaracFor",
	"CON": "basicRpg.CaracCon",
	"SIZ": "basicRpg.CaracTail",
	"INT": "basicRpg.CaracInt",
	"POW": "basicRpg.CaracPou",
	"DEX": "basicRpg.CaracDex",
	"APP": "basicRpg.CaracApp",
	"EDU": "basicRpg.CaracEdu"
};

basicRpg.abilitiesAbbreviations = {
	"STR": "basicRpg.CaracForAbbr",
	"CON": "basicRpg.CaracConAbbr",
	"SIZ": "basicRpg.CaracTailAbbr",
	"INT": "basicRpg.CaracIntAbbr",
	"POW": "basicRpg.CaracPouAbbr",
	"DEX": "basicRpg.CaracDexAbbr",
	"APP": "basicRpg.CaracAppAbbr",
	"EDU": "basicRpg.CaracEduAbbr"
};

/**
 * Skill, ability, and tool proficiency levels.
 * The key for each level represents its proficiency multiplier.
 * @enum {string}
 */
basicRpg.skillExperiencedIcon = {
	0: "basicRpg.NotExperienced",
	1: "basicRpg.Experienced",	
	2: "basicRpg.Specialist"
};