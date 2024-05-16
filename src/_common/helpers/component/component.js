import { TEXT_CONFIGURATION, LAYOUT_CONFIGURATION, GRID_CONFIGURATION } from './elementConfiguration';

export function getComponentVueComponentName(type, uid, noLog = false) {
    const baseUid = getComponentBaseUid(type, uid, noLog);
    return getComponentBaseVueComponentName(type, baseUid);
}

export function getComponentBaseVueComponentName(type, baseUid) {
    if (!baseUid) return null;
    if (type === 'element') {
        return `wwobject-${baseUid}`;
    } else if (type === 'section') {
        return `section-${baseUid}`;
    }
    return null;
}

export function getComponentBaseUid(type, uid, noLog = false) {
    if (type === 'element') {
        const baseId = wwLib.$store.getters['websiteData/getWwObjectBaseId'](uid);
        if (!baseId) {
            return null;
        }
        return baseId;
    } else if (type === 'libraryComponent') {
        const baseId = wwLib.$store.getters['websiteData/getWwObject'](uid)?.libraryComponentBaseId;
        if (!baseId) {
            return null;
        }
        return baseId;
    } else if (type === 'section') {
        const baseId = wwLib.$store.getters['websiteData/getSectionBaseId'](uid);
        if (!baseId) {
            if (!noLog) wwLib.wwLog.error(`Component base not found : ${type} / ${uid}`);
            return null;
        }
        return baseId;
    }
    return null;
}

function _getIcon(type, config, uid) {
    const { icon, deprecated } = config.editor || {};
    if (deprecated) return 'warning';
    if (icon) return icon;
    if (type === 'element') {
        if (uid && !wwLib.$store.getters['websiteData/getWwObjects'][uid]) return 'warning';
        return 'element';
    } else if (type === 'section') {
        return 'section';
    } else if (type === 'libraryComponent') {
        return 'component';
    } else {
        return 'options';
    }
}

export function getComponentIcon(type, uid) {
    const config = getComponentConfiguration(type, uid);
    return _getIcon(type, config, uid);
}

export function getComponentBaseIcon(type, baseUid) {
    const config = getComponentBaseConfiguration(type, baseUid);
    return _getIcon(type, config);
}

export function inheritFrom(configuration, from) {
    if (configuration.inherit === from) return true;
    if (configuration.inherit && configuration.inherit.type === from) {
        return configuration.inherit;
    }
    if (!Array.isArray(configuration.inherit)) return false;
    return configuration.inherit.find(el => el === from || (el && el.type === from));
}

function _getComponentConfiguration(name) {
    if (!name) return {};
    let configuration = wwLib.$store.getters['front/getComponentConfig'](name) || {};
    const inheritFromText = inheritFrom(configuration, 'ww-text');
    if (inheritFromText) {
        if (!Array.isArray(inheritFromText.exclude)) {
            configuration = {
                ...configuration,
                properties: { ...(configuration.properties || {}), ...TEXT_CONFIGURATION.properties },
            };
        } else {
            configuration = {
                ...configuration,
                properties: { ...(configuration.properties || {}) },
            };
            for (const [key, value] of Object.entries(TEXT_CONFIGURATION.properties)) {
                if (!inheritFromText.exclude.some(k => `_ww-text_${k}` === key)) {
                    configuration.properties[key] = value;
                }
            }
        }
    }

    const inheritFromLayout = inheritFrom(configuration, 'ww-layout');
    if (inheritFromLayout) {
        if (!Array.isArray(inheritFromLayout.exclude)) {
            configuration = {
                ...configuration,
                properties: {
                    ...(configuration.properties || {}),
                    ...LAYOUT_CONFIGURATION.properties,
                    ...GRID_CONFIGURATION.properties,
                },
            };
        } else {
            configuration = {
                ...configuration,
                properties: {
                    ...(configuration.properties || {}),
                    ...LAYOUT_CONFIGURATION.properties,
                    ...GRID_CONFIGURATION.properties,
                },
            };
            for (const [key, value] of Object.entries(LAYOUT_CONFIGURATION.properties)) {
                if (!inheritFromLayout.exclude.some(k => `_ww-layout_${k}` === key)) {
                    configuration.properties[key] = value;
                }
            }
        }
    }

    return configuration;
}

export function getComponentConfiguration(type, uid, noLog = false) {
    if (type === 'libraryComponent') {
        const baseUid = getComponentBaseUid(type, uid, noLog);
        return wwLib.$store.getters['libraries/getComponents'][baseUid]?.configuration || {};
    }
    const name = getComponentVueComponentName(type, uid, noLog);
    return _getComponentConfiguration(name);
}

export function getComponentBaseConfiguration(type, baseUid) {
    if (type === 'libraryComponent') {
        return wwLib.$store.getters['libraries/getComponents'][baseUid]?.configuration || {};
    }
    const name = getComponentBaseVueComponentName(type, baseUid);
    return _getComponentConfiguration(name);
}

function _getLabel(type, config) {
    if (!type) return '';
    const { label, deprecated } = config.editor || {};
    let returnLabel = '';
    if (type === 'section') {
        if (wwLib.wwManagerLang) {
            returnLabel = wwLib.wwManagerLang.getText(label) || 'Section';
        } else {
            returnLabel = label && label.en ? label.en : 'Section';
        }
    } else {
        if (wwLib.wwManagerLang) {
            returnLabel = wwLib.wwManagerLang.getText(label) || 'Element';
        } else {
            returnLabel = label && label.en ? label.en : 'Element';
        }
    }
    return `${returnLabel}${deprecated ? ' - Deprecated' : ''}`;
}

export function getComponentBaseLabel(type, baseUid) {
    if (type === 'libraryComponent') {
        const longName = wwLib.$store.getters['libraries/getComponents'][baseUid]?.name || 'Component';
        const pathes = longName.split('/');
        return pathes[pathes.length - 1];
    }
    const config = getComponentBaseConfiguration(type, baseUid);
    return _getLabel(type, config);
}

export function getComponentLabel(type, uid) {
    if (!type) return '';
    const name = getComponentName(type, uid);
    if (name) return name;
    if (type === 'libraryComponent') {
        const baseUid = getComponentBaseUid(type, uid);
        return getComponentBaseLabel(type, baseUid);
    }
    const config = getComponentConfiguration(type, uid);
    return _getLabel(type, config);
}

export function getElementDomElement(componentId) {
    return wwLib.getFrontDocument().querySelector(`[data-ww-component-id="${componentId}"]`);
}

const FALSY_VALUES = ['none', 'false', false, null, undefined];
export function isComponentDisplayed(displayValue) {
    if (typeof displayValue === 'string') return !FALSY_VALUES.includes(displayValue.toLowerCase());
    return !FALSY_VALUES.includes(displayValue);
}

const FLEX_VALID_VALUES = ['block', 'inline-block', 'inline-flex', 'flex'];
const BLOCK_VALID_VALUES = ['inline-block', 'block'];
const GRID_VALID_VALUES = ['grid', 'inline-grid'];

export function getDisplayValue(displayValue, configuration) {
    const isDisplayed = isComponentDisplayed(displayValue);

    if (!isDisplayed) return 'none';

    const allowFlex = doesComponentSupportDisplayType(configuration, 'flex');
    const allowGrid = doesComponentSupportDisplayType(configuration, 'grid');

    let display;

    if (allowGrid) {
        if (typeof displayValue === 'string' && GRID_VALID_VALUES.includes(displayValue.toLowerCase())) {
            return displayValue.toLowerCase();
        }
        display = 'grid';
    }

    if (allowFlex) {
        if (typeof displayValue === 'string' && FLEX_VALID_VALUES.includes(displayValue.toLowerCase())) {
            return displayValue.toLowerCase();
        }
        display = 'flex';
    } else {
        if (typeof displayValue === 'string' && BLOCK_VALID_VALUES.includes(displayValue.toLowerCase())) {
            return displayValue.toLowerCase();
        }
        display = 'block';
    }

    return display;
}

export function doesComponentSupportDisplayType(configuration, displayType) {
    return configuration.options && configuration.options.layout && configuration.options.layout.includes(displayType);
}

export function getComponentSize(size, defaultSize = 'unset') {
    if (!size || size === 'auto') return defaultSize;
    return size;
}

export function getPageSectionsIds() {
    return Object.keys(wwLib.$store.getters['websiteData/getSections']);
}

export function getPageElementsIds() {
    const page = JSON.stringify(wwLib.$store.getters['websiteData/getFullPage']);
    const r = /"uid":"([\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})"/g;
    let matches,
        output = [];
    while ((matches = r.exec(page))) {
        output.push(matches[1]);
    }

    return output;
}

export function getComponentName(type, uid) {
    if (!type) return '';
    if (type === 'section') {
        const { sectionTitle } = wwLib.$store.getters['websiteData/getSection'](uid) || {};
        return sectionTitle;
    } else {
        const { name } = wwLib.$store.getters['websiteData/getWwObject'](uid) || { name: 'Element undefined' };
        return name;
    }
}
export function setComponentName(type, uid, value) {
    wwLib.$store.dispatch('websiteData/setComponentProperty', {
        type,
        uid,
        path: `${type === 'section' ? 'sectionTitle' : 'name'}`,
        value,
    });
}
