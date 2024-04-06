import {loading} from "../Utils/Utils.js";
import {createErrorMessage} from "../Utils/ErrorHandler.js";
import {convertText, convertValueToMetric, relinkText} from '../Utils/ConversionEngineNew.js';
import {convertInconsistentText, convertTrait, convertVehicleSizes, speedConverter} from './Pf2eConverter.js';
import {journalUpdater, relinkActor, relinkItem, relinkJournals, typeSelector} from '../Dnd5e/Compendium5eConverter.js';

const itemConverter = (item) => {
    if (item.data.area) item.data.area.value = String(convertValueToMetric(item.data.area.value, 'ft'));
    if (item.data.areasize) item.data.areasize.value = convertText(item.data.areasize.value);
    item.data.description.value = convertText(item.data.description.value);
    if (item.data.range) item.data.range.value = convertInconsistentText(item.data.range.value);
    if (item.data.traits.value) item.data.traits.value = item.data.traits.value.map((trait) => convertTrait(trait));

    return item;
}

const itemsConverter = (items) => {
    for (let i = 0; i < items.length; i++) {
        items[i] = itemConverter(items[i]);
    }
    return items;
}

const actorConverter = (actor) => {
    actor.data.traits.senses.value = convertText(actor?.data?.traits?.senses?.value);
    actor.data.attributes.speed = speedConverter(actor?.data?.attributes?.speed);

    itemsConverter(actor.items);
}

const vehicleConverter = (vehicle) => {
    vehicle.data.details.space = convertVehicleSizes(vehicle.data.details.space);
    vehicle.data.details.speed = convertText(vehicle?.data?.details?.speed);
}

const classConverter = (entity) => {
    Object.keys(entity.data.items).forEach((key) => {
        const item = entity.data.items[key];
        const packLabel = game.packs.get(item.pack)?.metadata?.label;
        if (!packLabel) return;
        const metrifiedLabel = `${packLabel} Metrified`;
        entity.data.items[key].pack = `world.${metrifiedLabel.slugify({strict: true})}`;
    })
    entity.data.description.value = convertText(entity.data.description.value);
}


const typeMap = {
    'NPCPF2e': actorConverter,
    'FeatPF2e': itemConverter,
    'ActionPF2e': itemConverter,
    'AncestryPF2e': itemConverter,
    'BackgroundPF2e': itemConverter,
    'EffectPF2e': itemConverter,
    'ClassPF2e': classConverter,
    'ConditionPF2e': itemConverter,
    'EquipmentPF2e': itemConverter,
    'WeaponPF2e': itemConverter,
    'ArmorPF2e': itemConverter,
    'ConsumablePF2e': itemConverter,
    'KitPF2e': itemConverter,
    'TreasurePF2e': itemConverter,
    'ContainerPF2e': itemConverter,
    'SpellPF2e': itemConverter,
    'JournalEntry': journalUpdater,
    'CharacterPF2e': actorConverter,
    'VehiclePF2e': vehicleConverter,
}

const PF2eRelinkTypeMap = {
    'NPCPF2e': relinkActor,
    'FeatPF2e': relinkItem,
    'ActionPF2e': relinkItem,
    'AncestryPF2e': relinkItem,
    'BackgroundPF2e': relinkItem,
    'EffectPF2e': relinkItem,
    'ClassPF2e': relinkJournals,
    'ConditionPF2e': relinkItem,
    'EquipmentPF2e': relinkItem,
    'WeaponPF2e': relinkItem,
    'ArmorPF2e': relinkItem,
    'ConsumablePF2e': relinkItem,
    'KitPF2e': relinkItem,
    'TreasurePF2e': relinkItem,
    'ContainerPF2e': relinkItem,
    'SpellPF2e': relinkItem,
    'JournalEntry': relinkJournals,
    'CharacterPF2e': relinkActor,
    'VehiclePF2e': relinkActor,
}

const relinkTypeSelectorPf2e = (entity, type) => PF2eRelinkTypeMap?.[type]?.(entity) || entity;

const typeSelectorPf2e = (entity, type) => typeMap[type](entity) || entity;

export {typeSelectorPf2e, relinkTypeSelectorPf2e}
