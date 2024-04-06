import {
    actorDataConverter, actorTokenConverter,
    convertDistance, convertStringFromImperialToMetric,
    convertText,
    convertValueToMetric,
    labelConverter
} from "../Utils/ConversionEngineNew.js";
import {createErrorMessage} from "../Utils/ErrorHandler.js";
import {loading} from "../Utils/Utils.js";

const itemUpdater = (item, loading) => {
    if (item.getFlag("foundry-mgl", "converted")) return;
    const itemClone = JSON.parse(JSON.stringify(item));

    itemClone.system.description.value = convertText(itemClone.system.description.value);

    itemClone.system.target = convertDistance(itemClone.system.target);
    itemClone.system.range = convertDistance(itemClone.system.range);
    itemClone.system.weight = convertValueToMetric(itemClone.system.weight, 'pound');

    if (item.labels.range) item.labels.range = labelConverter(item.labels.range);


    item.setFlag("foundry-mgl", "converted", true)
        .then(() => {
            item.update(itemClone)
                .catch((e) => createErrorMessage(e, `${itemClone.name}.update`, itemClone))
            if (loading) loading();
        })
        .catch((e) => createErrorMessage(e, `${itemClone.name}.setFlag()`, item))
}

const itemsUpdater = (items) => {
    for (const item of items) itemUpdater(item);
}

const actorUpdater = (actor, loading) => {
    const actorClone = JSON.parse(JSON.stringify(actor));

    if (!actor.getFlag("foundry-mgl", "converted")) {
        actorClone.system = actorDataConverter(actorClone.system);
        actorClone.prototypeToken = actorTokenConverter(actorClone.prototypeToken);
    }

    actor.setFlag("foundry-mgl", "converted", true)
        .then(() => {
            actor.update(actorClone)
                .then(() => {
                    itemsUpdater(actor.items);
                    loading();
                })
                .catch((e) => createErrorMessage(e, 'actor.update', actorClone.data))
        })
}

const journalUpdater = (journal, loading) => {
    const journalClone = JSON.parse(JSON.stringify(journal));

    for (const page of journalClone.pages) {
        page.text.content = convertText(page.text.content);

        try {
            journal.pages.get(page._id).update(page);
        } catch (e) {
            createErrorMessage(e, page.name, journal);
        }
    }

    journal.update(journalClone)
        .then(() => loading())
        .catch((e) => createErrorMessage(e, journalClone.name, journal))
}

const sceneUpdater = (scene, loading) => {
    const sceneClone = JSON.parse(JSON.stringify(scene));
    sceneClone.grid.distance = convertValueToMetric(sceneClone.grid.distance, sceneClone.grid.units);
    sceneClone.grid.units = convertStringFromImperialToMetric(sceneClone.grid.units);

    scene.update(sceneClone)
        .then(() => loading())
        .catch((e) => createErrorMessage(e, sceneClone.name, sceneClone));
}

const rollTableConverter = (rollTable, loading) => {
    const rollTableClone = JSON.parse(JSON.stringify(rollTable));

    rollTableClone.description = convertText(rollTableClone.description);
    rollTableClone.results.forEach((result) => {
        result.text = convertText(result.text)
    })

    rollTable.update(rollTableClone)
        .then(() => loading())
        .catch((e) => createErrorMessage(e, rollTableClone.name, rollTableClone));
}

const batchConversion = (elements, callbackFunction) => {
    const loadingBar = loading(`Batch conversion in progress`)(0)(elements.size - 1);
    for (const elem of elements) callbackFunction(elem, loadingBar);
}

const batchConversionMap = {
    'actors': actorUpdater,
    'items': itemUpdater,
    'tables': rollTableConverter,
    'journal': journalUpdater,
    'scenes': sceneUpdater
}

const initBatchConversion = (elements, type) => () => batchConversion(elements, batchConversionMap[type]);


export {initBatchConversion, sceneUpdater}
