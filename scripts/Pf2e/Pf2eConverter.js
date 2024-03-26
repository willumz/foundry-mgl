import {convertStringFromImperialToMetric, convertText, convertValueToMetric} from "../Utils/ConversionEngineNew.js";
import {capitalize, copyObject} from "../Utils/Utils.js";

const convertTrait = (trait) => trait.replace(/reach-([0-9]+)/, (_0, value) => `Reach ${convertValueToMetric(value, 'ft')} m`);

const convertInconsistentText = (speed) => speed?.replace(/([0-9]+)(\W|&nbsp;| cubic |-)?(feet|inch|foot|ft\.|pounds|lbs\.|pound|lbs|lb|ft)?/, (_0, number, separator, label) => {
    return `${convertValueToMetric(number, label ? label : 'ft')}${separator || ''}${label ? convertStringFromImperialToMetric(label) : ''}`
})

const speedConverter = (speedObject) => {
    if (!speedObject) return speedObject;
    speedObject.value = convertInconsistentText(speedObject?.value);
    speedObject.otherSpeeds.map((otherSpeed) => {
        otherSpeed.value = convertInconsistentText(otherSpeed?.value);
    })
    return speedObject;
}

const convertTranslations = (text) => {
    text = convertText(text);
    text = convertStringFromImperialToMetric(text);
    return text;
}

const addNewTranslationsForMetric = (object, prop) => {
    const convertedProp = convertTranslations(object[prop]);
    const match = prop.match(/Trait([A-Za-z]+)([0-9]+)/);
    if (match) {
        const newProp = `Trait${match[1]}${convertValueToMetric(match[2], 'ft')}`;
        game.i18n.translations.PF2EM[newProp] = convertedProp;
        return;
    }
    const weaponMatch = prop.match(/WeaponRange([0-9]+)/);
    if (weaponMatch) {
        const newProp = `WeaponRange${convertValueToMetric(weaponMatch[1], 'ft')}`;
        game.i18n.translations.PF2EM[newProp] = convertedProp;
        return;
    }
    const areaMatch = prop.match(/AreaSize([0-9]+)/);
    if (areaMatch) {
        const newProp = `AreaSize${String(convertValueToMetric(areaMatch[1], 'ft')).replace('.', ',')}`;
        game.i18n.translations.PF2EM[newProp] = convertedProp;
        return;
    }
    object[prop] = convertedProp;
}

const convertVehicleSizes = (obj) => ({
    high: convertInconsistentText(obj.high),
    long: convertInconsistentText(obj.long),
    wide: convertInconsistentText(obj.wide)
})


const convertI18NObject = (obj) => {
    for (const prop in obj) {
        const value = obj[prop];
        if (typeof value === 'string') addNewTranslationsForMetric(obj, prop);
        else convertI18NObject(value);
    }
}

const addNewSizes = () => {
    Object.keys(CONFIG.PF2E.areaSizes).forEach((key) => {
        const convertedKey = convertValueToMetric(key, 'ft');
        CONFIG.PF2E.areaSizes[convertedKey] = `PF2EM.AreaSize${String(convertedKey).replace('.', ',')}`;
    });
    Object.keys(CONFIG.PF2E.weaponRange).forEach((key) => {
        if (key === 'melee' || key === 'reach') return;
        const convertedKey = convertValueToMetric(key, 'ft');
        CONFIG.PF2E.weaponRange[convertedKey] = `PF2EM.WeaponRange${convertedKey}`;
    });
    Object.keys(CONFIG.PF2E.weaponTraits).forEach((key) => {
        const match = key.match(/([a-z]+)-([a-z]+)?-?([0-9]+)/);
        if (!match) return;
        const convertedKey = `${match[1]}-${match[2] ? match[2] : ''}-${convertValueToMetric(match[3], 'ft')}`;
        CONFIG.PF2E.weaponTraits[convertedKey] = `PF2EM.Trait${capitalize(match[1])}${match[2] ? capitalize(match[2]) : ''}${convertValueToMetric(match[3], 'ft')}`;
    });
}

const updateItems = async (items) => {
    for (const item of items) await updateItem(item);
}

const updateItem = async (item) => {
    const itemCopy = copyObject(item.data);
    if (item.getFlag("foundry-mgl", "converted")) return;

    if (itemCopy.data.area) itemCopy.data.area.value = convertValueToMetric(itemCopy.data.area.value, 'ft');
    if (itemCopy.data.areasize) itemCopy.data.areasize.value = convertText(itemCopy.data.areasize.value);
    itemCopy.data.description.value = convertText(itemCopy.data.description.value);
    if (itemCopy.data.range) itemCopy.data.range.value = convertInconsistentText(itemCopy.data.range.value);
    if (itemCopy.data.traits.value) itemCopy.data.traits.value = itemCopy.data.traits.value.map((trait) => convertTrait(trait));

    item.setFlag("foundry-mgl", "converted", true);
    await item.update(itemCopy);
}

const updateActor = async (actor) => {
    const actorCopy = copyObject(actor.data);
    if (actor.getFlag("foundry-mgl", "converted")) return;

    if (Array.isArray(actorCopy.data.traits.senses))
        actorCopy.data.traits.senses.map((sense)=> {
            sense.value = convertInconsistentText(sense.value);
            return sense;
        })
    else if (actorCopy?.data?.traits?.senses?.value) actorCopy.data.traits.senses.value = convertText(actorCopy?.data?.traits?.senses?.value);

    actorCopy.data.attributes.speed = speedConverter(actorCopy?.data?.attributes?.speed);
    if (actorCopy?.data?.details?.speed) actorCopy.data.details.speed = convertText(actorCopy?.data?.details?.speed);
    if (actorCopy.type === 'vehicle') actorCopy.data.details.space = convertVehicleSizes(actorCopy?.data?.details?.space)

    await actor.setFlag("foundry-mgl", "converted", true);
    await actor.update(actorCopy);
    await updateItems(actor.data.items);
}

export {updateActor, updateItem, speedConverter, convertInconsistentText, convertTrait, convertI18NObject, addNewSizes, convertVehicleSizes}
