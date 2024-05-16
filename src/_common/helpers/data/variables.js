import { computed } from 'vue';

function getLocalStorageVariableInitValue(variable) {
    let value = undefined;
    switch (variable.type) {
        case 'query':
        case 'string': {
            const localValue = window.localStorage?.getItem(`variable-${variable.id}`);
            // Checking null because empty string is a valid value. null ==> not defined
            value = localValue !== null ? localValue : variable.defaultValue;
            break;
        }
        case 'number':
        case 'object':
        case 'array':
        case 'boolean':
            try {
                const localValue = window.localStorage?.getItem(`variable-${variable.id}`);
                // Checking null because falsy value can be valid. null ==> not defined
                value = localValue !== null ? JSON.parse(localValue) : variable.defaultValue;
            } catch {
                value = variable.defaultValue;
                wwLib.wwLog.error('Invalid localStorage value for variable id:', variable.id);
            }
            break;
    }
    return value;
}

function getQueryVariableInitValue(variable, toRoute) {
    let value = undefined;
    const query = toRoute ? toRoute.query : {};

    Object.keys(query).forEach(name => {
        if (variable.name.toLowerCase() === name.toLowerCase()) value = query[name];
    });

    if (value === undefined && variable.isLocalStorage) {
        value = getLocalStorageVariableInitValue(variable);
    }

    return value || variable.defaultValue;
}

export function initializeCustomCodeVariables() {
    Object.values(wwLib.$store.getters['data/getAllVariables']).forEach(item => {
        registerVariable(item.id);
    });
}

export function registerVariable(variableId) {
    const item = wwLib.$store.getters['data/getVariable'](variableId);

    function get() {
        return item.value;
    }
    function set(value) {
        wwLib.$store.dispatch('data/setVariableValue', { variableId: item.id, value });
    }
    if (!item.pluginId && !item.componentUid && wwLib.globalVariables.customCodeVariables[item.name] === undefined) {
        wwLib.globalVariables.customCodeVariables[item.name] = computed({
            get,
            set,
        });
    }
    if (wwLib.globalVariables.customCodeVariables[item.id] === undefined) {
        wwLib.globalVariables.customCodeVariables[item.id] = computed({
            get,
            set,
        });
    }
}

export function unregisterVariable(variableId) {
    const item = wwLib.$store.getters['data/getVariable'](variableId);
    delete wwLib.globalVariables.customCodeVariables[item.name];
    delete wwLib.globalVariables.customCodeVariables[item.id];
}

export function resetVariables(toRoute, resetPersistant) {
    const variables = Object.values(wwLib.$store.getters['data/getVariables']);
    for (const variable of variables) {
        if (!resetPersistant && variable.type !== 'query' && variable.isPersistentOnNav) {
            continue;
        }

        let defaultValue = variable.defaultValue;

        if (variable.isLocalStorage) {
            defaultValue = getLocalStorageVariableInitValue(variable);
        }
        if (variable.type === 'query') {
            defaultValue = getQueryVariableInitValue(variable, toRoute);
        }

        wwLib.$store.dispatch('data/setVariableValue', {
            variableId: variable.id,
            value: defaultValue,
            ignoreQuery: true,
        });
    }
    wwLib.$store.dispatch('data/setPageParameterVariables');
}
