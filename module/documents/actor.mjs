/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class basicRpgActor extends Actor {

    /** @override */
    prepareData() {
        // Prepare data for the actor. Calling the super version of this executes
        // the following, in order: data reset (to clear active effects),
        // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
        // prepareDerivedData().
        super.prepareData();
    }

    /** @override */
    prepareBaseData() {
        // Data modifications in this step occur before processing embedded
        // documents or derived data.
    }

    /**
     * @override
     * Augment the basic actor data with additional dynamic data. Typically,
     * you'll want to handle most of your calculated/derived data in this step.
     * Data calculated in this step should generally not exist in template.json
     * (such as carac modifiers rather than carac scores) and should be
     * available both inside and outside of character sheets (such as if an actor
     * is queried and has a roll executed directly from it).
     */
    prepareDerivedData() {
        const actorData = this.data;
        const data = actorData.data;
        const flags = actorData.flags.basicRpg || {};

        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        this._prepareCharacterData(actorData);
        this._prepareNpcData(actorData);
    }

    /* 
    this.actor.testNicolas();
    */
    testNicolas() {
        
        console.log("On est passé");
        
        var v1 = 12;
        return v1;
    }

    /**
     * Prepare Character type specific data
     */
    _prepareCharacterData(actorData) {

        // Vérification
        if (actorData.type !== 'character') return;
        
        // Init values        
        actorData.data.abilities.strength.derivedValue = 0;
        actorData.data.abilities.constitution.derivedValue = 0;
        actorData.data.abilities.intelligence.derivedValue = 0;
        actorData.data.abilities.power.derivedValue = 0;
        actorData.data.abilities.dexterity.derivedValue = 0;
        actorData.data.abilities.appearence.derivedValue = 0;
        actorData.data.abilities.education.derivedValue = 0;
        actorData.data.movement = 0;
        actorData.data.hitPoints = { max: 0, value: 0, majorWounds: 0 };
        actorData.data.damageBonus = "none";
        
        // Derived value calculation
        actorData.data.abilities.strength.derivedValue = actorData.data.abilities.strength.value * 5;
        actorData.data.abilities.constitution.derivedValue = actorData.data.abilities.constitution.value * 5;
        actorData.data.abilities.intelligence.derivedValue = actorData.data.abilities.intelligence.value * 5;
        actorData.data.abilities.power.derivedValue = actorData.data.abilities.power.value * 5;
        actorData.data.abilities.dexterity.derivedValue = actorData.data.abilities.dexterity.value * 5;
        actorData.data.abilities.appearence.derivedValue = actorData.data.abilities.appearence.value * 5;
        actorData.data.abilities.education.derivedValue = actorData.data.abilities.education.value * 5;


        // Movement value
        actorData.data.movement = 10;
        // Hit points calculation
        actorData.data.hitPoints.max = Math.floor((actorData.data.abilities.constitution.value + actorData.data.abilities.size.value) / 2);
        actorData.data.hitPoints.value = 12;
        if (actorData.data.hitPoints.value > actorData.data.hitPoints.max) {
            actorData.data.hitPoints.value = actorData.data.hitPoints.max;
        }
        // Damage bonus calculation
        actorData.data.damageBonus = calcDamageBonus(actorData.data.abilities.strength.value + actorData.data.abilities.size.value);
        // Major wounds calculation        
        actorData.data.hitPoints.majorWounds = calcMajorWounds(actorData.data.hitPoints.max);

    }


    /**
     * Prepare NPC type specific data.
     */
    _prepareNpcData(actorData) {
        if (actorData.type !== 'npc') return;

        // Make modifications to data here. For example:
        const data = actorData.data;
        data.xp = (data.cr * data.cr) * 100;
    }

    /**
     * Override getRollData() that's supplied to rolls.
     */
    getRollData() {
        const data = super.getRollData();

        // Prepare character roll data.
        this._getCharacterRollData(data);
        this._getNpcRollData(data);

        return data;
    }

    /**
     * Prepare character roll data.
     */
    _getCharacterRollData(data) {
        if (this.data.type !== 'character') return;

        // Copy the abilities scores to the top level, so that rolls can use
        // formulas like `@str.mod + 4`.
        if (data.abilities) {
            for (let [k, v] of Object.entries(data.abilities)) {
                data[k] = foundry.utils.deepClone(v);
            }
        }

        // Add level for easier access, or fall back to 0.
        if (data.attributes.level) {
            data.lvl = data.attributes.level.value ?? 0;
        }
    }

    /**
     * Prepare NPC roll data.
     */
    _getNpcRollData(data) {
        if (this.data.type !== 'npc') return;

        // Process additional NPC data here.
    }

}


/*
    Table. Damage Bonus 
      STR+SIZ     Damage Modifier
      2 to 12     –1D6
      13 to 16    –1D4
      17 to 24    None
      25 to 32    +1D4
      33 to 40    +1D6
      41 to 56    +2D6
      57 to 72    +3D6
      73 to 88    +4D6
      89 to 104   +5D6
      105 to 120  +6D6
      121 to 136  +7D6
      137 to 152  +8D6
      152 to 168  +9D6
      Ea. add’l   +16 +1d6
    */
function calcDamageBonus(strTai) {

    var damageBonus = "0";

    if (strTai < 13) {
        damageBonus = "-1D6";
    }
    else if (strTai < 17) {
        damageBonus = "-1D4";
    }
    else if (strTai < 25) {
        damageBonus = "None";
    }
    else if (strTai < 33) {
        damageBonus = "+1D4";
    }
    else if (strTai < 41) {
        damageBonus = "+1D6";
    }
    else {
        var val = Math.floor((strTai - 9) / 16);
        damageBonus = "+" + val + "D6";
    }

    // Debug
    console.log("bonusDegats= " + damageBonus);


    return damageBonus;
}


function calcMajorWounds(hPoints) {
    var resultat = Math.floor(hPoints / 2);
    return resultat;
}
 