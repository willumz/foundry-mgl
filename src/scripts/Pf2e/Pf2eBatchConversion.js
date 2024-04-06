import {loading} from "../Utils/Utils.js";
import {updateActor, updateItem} from "./Pf2eConverter.js";
import {journalUpdater} from "../Dnd5e/Dnd5eConverterNew.js";
import {convertStringFromImperialToMetric, convertValueToMetric} from "../Utils/ConversionEngineNew.js";
import {createErrorMessage} from "../Utils/ErrorHandler.js";

const rollTableConverter = () => console.log("NOT IMPLEMENTED")
const sceneUpdater = (scene) => {
    const sceneClone = JSON.parse(JSON.stringify(scene));
    sceneClone.gridDistance = convertValueToMetric(sceneClone.gridDistance, sceneClone.gridUnits);
    sceneClone.gridUnits = convertStringFromImperialToMetric(sceneClone.gridUnits);

    scene.update(sceneClone).catch((e) => createErrorMessage(e, sceneClone.name, sceneClone));
}


const batchConversionMap = {
    'actors': updateActor,
    'items': updateItem,
    'tables': rollTableConverter, //TODO
    'journal': journalUpdater,
    'scenes': sceneUpdater
}

const batchConversion = async (elements, callbackFunction) => {
    const loadingBar = loading(`Batch conversion in progress`)(0)(elements.size - 1);
    for (const elem of elements) {
        await callbackFunction(elem);
        loadingBar();
    }
}

const pf2eInitBatchConversion = (elements, type) => () => batchConversion(elements, batchConversionMap[type]);

export {pf2eInitBatchConversion}
