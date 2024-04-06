import {
    actorDataConverter, actorTokenConverter,
    convertDistance,
    convertStringFromImperialToMetric,
    convertText,
    convertValueToMetric, relinkText
} from "../Utils/ConversionEngineNew.js";
import {loading, cache} from "../Utils/Utils.js";

const itemUpdater = (item, onlyLabel, onlyUnit) => {
    item.system.description.value = convertText(item.system.description.value);
    item.system.weight = convertValueToMetric(item.system.weight, 'pound');

    item.system.target = convertDistance(item.system.target, onlyUnit);
    item.system.range = convertDistance(item.system.range, onlyUnit);

    return item;
}

const itemsUpdater = (items) => {
    for (let i = 0; i < items.length; i++) {
        items[i] = itemUpdater(items[i]);
    }
    return items;
}

const actorUpdater = (actor) => {
    actor.system = actorDataConverter(actor.system);
    actor.prototypeToken = actorTokenConverter(actor.prototypeToken);
    actor.items = itemsUpdater(actor.items);
    return actor;
}

const rollTableUpdater = (rollTable) => {
    rollTable.name = convertText(rollTable.name);
    for (let index = 0; index < rollTable.results.length; index++)
        rollTable.results[index].text = convertText(rollTable.results[index].text)
    return rollTable;
}

const scenesUpdater = (scene) => {
    scene.grid.distance = convertValueToMetric(scene.grid.distance, scene.grid.units);
    scene.grid.units = convertStringFromImperialToMetric(scene.grid.units);
    return scene;
}

const journalUpdater = (journal) => {
    journal.content = convertText(journal.content);
    return journal;
}

const typeMap = {
    'Actor5e': actorUpdater,
    'Mars5eActor': actorUpdater,
    'Item5e': itemUpdater,
    'MarsItem5e': itemUpdater,
    'JournalEntry': journalUpdater,
    'RollTable': rollTableUpdater,
    'Scene': scenesUpdater
}

const typeSelector = (entity, type) => typeMap[type](entity) || entity;

const createNewCompendium = async (metadata) => {
    return await CompendiumCollection.createCompendium({
        entity: metadata.entity,
        label: `${metadata.label} Metrified`,
        name: `${metadata.name}-metrified`,
        package: 'foundry-mgl',
        path: `./packs/${metadata.name}-metrified.db`,
        system: "dnd5e"
    })
}

const createNewCompendiumMeta = (metadata) => {
    return {
        entity: metadata.entity,
        label: `${metadata.label} Metrified`,
        name: `${metadata.name}-metrified`,
        package: 'foundry-mgl',
        path: `./packs/${metadata.name}-metrified.db`,
        system: "dnd5e"
    };
}
export const relinkActor = async (entity, cache) => {
    for (const item in entity.items) {
        if (!entity.items.hasOwnProperty(item)) continue;
        entity.items[item].data.description.value = await relinkText(entity.items[item].data.description.value, cache)
    }
    return entity;
}

export const relinkItem = async (entity, cache) => {
    entity.data.description.value = await relinkText(entity.data.description.value, cache)
    return entity;
}

export const relinkJournals = async (entity, cache) => {
    entity.content = await relinkText(entity.content, cache);
    return entity;
}

export const relinkTypeMap = {
    'Actor5e': relinkActor,
    'Item5e': relinkItem,
    'JournalEntry': relinkJournals
}

const relinkTypeSelector = async (entity, type, cache) => relinkTypeMap[type](entity, cache);

const relinkCompendium = async (compendium, cache, relinkTypeSelector) => {
    const sourcePack = game.packs.get(compendium);
    await sourcePack.getIndex();

    const loadingBar = loading(`Relinking compendium ${sourcePack.metadata.label}`)(0)(sourcePack.index.size - 1);

    for (const index of sourcePack.index) {
        const entity = await sourcePack.getDocument(index._id);
        let entityClone = JSON.parse(JSON.stringify(entity.data))
        entityClone = await relinkTypeSelector(entityClone, entity.constructor.name, cache);
        await entity.update(entityClone);
        loadingBar();
    }
}

const relinkCompendiums = async (relinkTypeSelector) => {
    const compendiums = game.packs.keys();
    const localCache = cache();
    for (const compendium of compendiums) {
        try {
            if (compendium.includes('metrified')) await relinkCompendium(compendium, localCache, relinkTypeSelector);
        }
        catch (e) {
            console.error(e);
        }
        }
    }



export {typeSelector, createNewCompendium, relinkCompendiums, relinkCompendium, createNewCompendiumMeta, journalUpdater, relinkTypeSelector}
