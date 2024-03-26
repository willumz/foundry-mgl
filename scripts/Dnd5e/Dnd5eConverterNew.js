import {
    actorDataConverter, actorTokenConverter, convertDistance,
    convertStringFromImperialToMetric, convertText,
    convertValueToMetric, labelConverter, relinkText,
} from "../Utils/ConversionEngineNew.js";
import {loading} from "../Utils/Utils.js";
import {createErrorMessage} from "../Utils/ErrorHandler.js";
import {createNewCompendium, createNewCompendiumMeta, relinkCompendiums, typeSelector} from "./Compendium5eConverter.js";


const itemUpdater = async (item, onlyLabel, onlyUnit) => {
    if (item.getFlag("foundry-mgl", "converted")) return;
    const itemClone = JSON.parse(JSON.stringify(item));

    if (!onlyLabel) itemClone.system.description.value = convertText(itemClone.system.description.value);
    if (!onlyLabel) itemClone.system.weight = convertValueToMetric(itemClone.system.weight, 'pound');

    itemClone.system.target = convertDistance(itemClone.system.target, onlyUnit);
    itemClone.system.range = convertDistance(itemClone.system.range, onlyUnit);

    if (item.labels.range) item.labels.range = labelConverter(item.labels.range);

    try {
        await item.setFlag("foundry-mgl", "converted", true);
    } catch (e) {
        createErrorMessage(e, `${itemClone.name}.setFlag()`, item);
    }
    try {
        await item.update(itemClone);
    } catch (e) {
        createErrorMessage(e, `${itemClone.name}.update`, itemClone);
    }
}

const itemsUpdater = async (items, onlyLabel, onlyUnit) => {
    for (const item of items) await itemUpdater(item, onlyLabel, onlyUnit);
}

const actorUpdater = async (actor, onlyLabel, onlyUnit) => {
    const actorClone = JSON.parse(JSON.stringify(actor));

    if (!actor.getFlag("foundry-mgl", "converted")) {
        actorClone.system = actorDataConverter(actorClone.system);
        actorClone.prototypeToken = actorTokenConverter(actorClone.prototypeToken);
    }

    try {
        await actor.update(actorClone);
        await actor.setFlag("foundry-mgl", "converted", true);
    } catch (e) {
        createErrorMessage(e, 'actor.update', actorClone.data);
    }

    await itemsUpdater(actor.items, onlyLabel, onlyUnit)
}

const journalUpdater = async (journal) => {
    const journalClone = JSON.parse(JSON.stringify(journal));

    for (const page of journalClone.pages) {
        page.text.content = convertText(page.text.content);
        page.text.content = await relinkText(page.text.content)

        try {
            await journal.pages.get(page._id).update(page);
        } catch (e) {
            createErrorMessage(e, page.name, journal);
        }
    }
}

const allScenesUpdater = async () => {
    for (const scene of game.scenes.entities) {
        if (scene._view === true) continue;
        const sceneClone = JSON.parse(JSON.stringify(scene));
        sceneClone.gridDistance = convertValueToMetric(sceneClone.gridDistance, sceneClone.gridUnits);
        sceneClone.gridUnits = convertStringFromImperialToMetric(sceneClone.gridUnits);

        try {
            await scene.update(sceneClone);
        } catch (e) {
            createErrorMessage(e, sceneClone.name, sceneClone);
        }
    }
}

const rollTableUpdater = async (rollTable) => {
    const rollTableClone = JSON.parse(JSON.stringify(rollTable));

    if (rollTableClone.description) rollTableClone.description = convertText(rollTableClone.description);
    rollTableClone.results.forEach((result) => {
        result.text = convertText(result.text)
    })

    try {
        await rollTable.update(rollTableClone);
    } catch (e) {
        createErrorMessage(e, rollTableClone.name, rollTableClone);
    }
}

const compendiumUpdater = (typeSelector) => async (compendium) => {
    try {
        const pack = game.packs.get(compendium.collection || compendium);
        await pack.getIndex();
        const newPack = await pack.duplicateCompendium({
            label: `${pack.metadata.label} Metrified`
        })
        await newPack.getIndex();

        const loadingBar = loading(`Converting compendium ${pack.metadata.label}`)(0)(pack.index.size - 1);
        for (const index of pack.index) {
            try {
                const entity = await newPack.getDocument(index._id);
                let entityClone = JSON.parse(JSON.stringify(entity));

                entityClone = typeSelector(entityClone, entity.constructor.name);

                await entity.update(entityClone);

                loadingBar();
            }
            catch (e) {
                createErrorMessage(e, 'compendiumUpdater', compendium);
            }
        }
    } catch (e) {
        createErrorMessage(e, 'compendiumUpdater', compendium);
    }
}

const batchCompendiumUpdater = (typeSelector, relinkTypeSelector) => (compendiums) =>  async () => {
    for (const compendium of compendiums)
        if (!compendium.includes('metrified')) await compendiumUpdater(typeSelector)(compendium);
    await relinkCompendiums(relinkTypeSelector);
}

export {actorUpdater, itemUpdater, journalUpdater, rollTableUpdater, compendiumUpdater, allScenesUpdater, batchCompendiumUpdater}
