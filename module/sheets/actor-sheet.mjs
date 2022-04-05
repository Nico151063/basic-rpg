import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class basicRpgActorSheet extends ActorSheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["basicRpg", "sheet", "actor"],
			template: "systems/basic-rpg/templates/actor/actor-sheet.html",
			width: 680,
			height: 600,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
		});
	}

	/** @override */
	get template() {
		return `systems/basic-rpg/templates/actor/actor-${this.actor.data.type}-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		// Retrieve the data structure from the base sheet. You can inspect or log
		// the context variable to see the structure, but some key properties for
		// sheets are the actor object, the data object, whether or not it's
		// editable, the items array, and the effects array.
		const context = super.getData();

		// Use a safe clone of the actor data for further operations.
		const actorData = this.actor.data.toObject(false);

		// Add the actor's data to context.data for easier access, as well as flags.
		context.data = actorData.data;
		context.flags = actorData.flags;

		// Prepare character data and items.
		if (actorData.type == 'character') {
			this._prepareItems(context);
			this._prepareCharacterData(context);
		}

		// Prepare NPC data and items.
		if (actorData.type == 'npc') {
			this._prepareItems(context);
		}

		// Add roll data for TinyMCE editors.
		context.rollData = context.actor.getRollData();

		// Prepare active effects
		context.effects = prepareActiveEffectCategories(this.actor.effects);

		return context;
	}

	
	/**
	 * Organize and classify Items for Character sheets.
	 *
	 * @param {Object} actorData The actor to prepare.
	 *
	 * @return {undefined}
	 */
	_prepareItems(context) {
		// Initialize containers.
		const gear = [];
		const features = [];
		const skills = [];
		const spells = {
			0: [],
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
			6: [],
			7: [],
			8: [],
			9: []
		};

		// Iterate through items, allocating to containers
		for (let i of context.items) {
			i.img = i.img || DEFAULT_TOKEN;
			// Append to gear.
			if (i.type === 'item') {
				gear.push(i);
			}
			// Append to features.
			else if (i.type === 'feature') {
				features.push(i);
			}
			// Append to skills.
			else if (i.type === 'skill') {
				skills.push(i);
			}
			// Append to spells.
			else if (i.type === 'spell') {
				if (i.data.spellLevel != undefined) {
					spells[i.data.spellLevel].push(i);
				}
			}
		}

		// Assign and return
		context.gear = gear;
		context.features = features;
		context.skills = skills;
		context.spells = spells;
	}

	/**
	 * Organize and classify Items for Character sheets.
	 *
	 * @param {Object} actorData The actor to prepare.
	 *
	 * @return {undefined}
	 */
	_prepareCharacterData(actorData) {

		// Skills NIKO
		console.clear();
		console.log(actorData.skills);
		if (actorData.skills) {
			for (let [s, skl] of Object.entries(actorData.skills)) {
				skl.data.icon = this._getExperiencedIcon(skl.data.experienced);
				console.log("Skills "
					+ skl.name
					+ " : \n"
					+ "   experienced = " + skl.data.experienced
					+ " : \n"
					+ "   icon        = " + skl.data.icon
				);
			}
		}
	}



	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		
		super.activateListeners(html);

		// Render the item sheet for viewing/editing prior to the editable check.
		html.find('.item-edit').click(ev => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});

		//--------------------------------------------------------------------------
		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Add Inventory Item
		html.find('.item-create').click(this._onItemCreate.bind(this));

		// Delete Inventory Item
		html.find('.item-delete').click(ev => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});

		// Active Effect management
		html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

		// Rollable abilities.
		html.find('.rollable').dblclick(this._onRoll.bind(this));

		// Skill Experience Toggling
		html.find(".skill-experience-toggle").click(this._onToggleSkillExperience.bind(this));


		// Select Input
		html.find(".selectInput").click(this._selectInput.bind(this));



		// Drag events for macros.
		if (this.actor.isOwner) {
			let handler = ev => this._onDragStart(ev);
			html.find('li.item').each((i, li) => {
				if (li.classList.contains("inventory-header")) return;
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});
		}
	}

	/**
	 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const name = `New ${type.capitalize()}`;
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type,
			data: data
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.data["type"];

		// Finally, create the item!
		return await Item.create(itemData, {parent: this.actor});
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		// Handle item rolls.
		if (dataset.rollType) {
			if (dataset.rollType == 'item') {
				const itemId = element.closest('.item').dataset.itemId;
				const item = this.actor.items.get(itemId);
				if (item) return item.roll();
			}
		}

		// Handle rolls that supply the formula directly.
		if (dataset.roll) {
			let label = dataset.label ? `[carac] ${dataset.label}` : '';
			let roll = new Roll(dataset.roll, this.actor.getRollData());
			roll.toMessage(
				{
					speaker: ChatMessage.getSpeaker({ actor: this.actor }),
					flavor: label,
					rollMode: game.settings.get('core', 'rollMode'),
				}
			);
			return roll;
		}
	}

	/**
	 * Handle input clicks for select entire text.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_selectInput(event) {
		event.preventDefault();
		event.currentTarget.select();    
 
	
	
	
	
	}


	/**
	 * Get the font-awesome icon used to display a certain level of skill proficiency.
	 * @param {number} level  A proficiency mode defined in `CONFIG.DND5E.proficiencyLevels`.
	 * @returns {string}      HTML string for the chosen icon.
	 * @private
	 */
	_getExperiencedIcon(level) {
		const icons = {
			0: 'far fa-circle',			
			1: 'far fa-check-circle',
			2: 'fas fa-check-double'
		};
		return icons[level] || icons[0];
	}

	/**
	 * Handle toggling the experienced value of an Owned Skill within the Actor.
	 * @param {Event} event        The triggering click event.
	 */
	_onToggleSkillExperience(event) {
		event.preventDefault();
			
		// Get the current selected item
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);

		// Get the Experienced value of the current selected item
		var _experienced = item.data.data.experienced;

		// Compute value
		_experienced++;
		if (_experienced > 2) {
			_experienced = 0;
		}

		this.actor.testNicolas();

		// Update Item
		return item.update({ ["data.experienced"]: _experienced });

	}
}


