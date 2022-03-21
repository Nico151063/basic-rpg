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

        console.log("**************** NIKO prepareDerivedData");

        const actorData = this.data;
        const data = actorData.data;
        const flags = actorData.flags.basicRpg || {};

        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        this._prepareCharacterData(actorData);
        this._prepareNpcData(actorData);
    }

    /**
     * Prepare Character type specific data
     */
    _prepareCharacterData(actorData) {

        // Vérification
        if (actorData.type !== 'character') return;


        // Make modifications to data here. For example:
        //const data = actorData.data;
        // Loop through ability scores, and add their modifiers to our sheet output.
        //for (let [key, caracteristique] of Object.entries(data.carac)) {
        for (let [key, caracteristique] of Object.entries(actorData.data.carac)) {
            // Calcul de la valeur dérivée 
            caracteristique.valeurDerivee = caracteristique.valeur * 5;
        }

        // Valeur de déplacement    
        actorData.data.deplacement = 10;
        // Calcul des Points de Vie
        actorData.data.pointsDeVie.max = Math.floor((actorData.data.carac.constitution.valeur + actorData.data.carac.taille.valeur) / 2);
        actorData.data.pointsDeVie.value = 12;

        // Calcul Bonus aux Dégâts
        actorData.data.bonusAuxDegats = CalculBonusAuxDegats(actorData.data.carac.force.valeur + actorData.data.carac.taille.valeur);
        // Calcul Blessures Majeures
        actorData.data.pointsDeVie.blessuresMajeures = CalculBlessuresMajeures(actorData.data.pointsDeVie.max);
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

        // Copy the carac scores to the top level, so that rolls can use
        // formulas like `@str.mod + 4`.
        if (data.carac) {
            for (let [k, v] of Object.entries(data.carac)) {
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
function CalculBonusAuxDegats(forceTaille) {

    var bonusDegats = "0";

    if (forceTaille < 13) {
        bonusDegats = "-1D6";
    }
    else if (forceTaille < 17) {
        bonusDegats = "-1D4";
    }
    else if (forceTaille < 25) {
        bonusDegats = "None";
    }
    else if (forceTaille < 33) {
        bonusDegats = "+1D4";
    }
    else if (forceTaille < 41) {
        bonusDegats = "+1D6";
    }
    else {
        var val = Math.floor((forceTaille - 9) / 16);
        bonusDegats = "+" + val + "D6";
    }

    // Debug
    console.log("bonusDegats= " + bonusDegats);


    return bonusDegats;
}


function CalculBlessuresMajeures(pointsVie) {
    var resultat = Math.floor(pointsVie / 2);
    return resultat;
}
