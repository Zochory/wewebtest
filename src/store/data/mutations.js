import set from 'lodash.set';
import { markRaw, toRaw } from 'vue';

export default {
    setCollection(state, collection) {
        if (!state.collections[collection.id]) state.collections[collection.id] = {};
        for (const key in collection) {
            if (key === 'data') {
                if (collection.data) {
                    set(state.collections[collection.id], 'data', markRaw(toRaw(collection.data)));
                } else {
                    set(state.collections[collection.id], 'data', null);
                }
            } else if (key === 'fields') {
                if (Object.keys(collection.fields).length || !state.collections[collection.id].fields)
                    set(state.collections[collection.id], 'fields', collection.fields);
            } else if (key === 'offset' || key === 'total') {
                set(state.collections[collection.id], key, collection[key] || 0);
            } else set(state.collections[collection.id], key, collection[key]);
        }
    },
    setCollectionOffset(state, { collectionId, offset }) {
        if (!state.collections[collectionId]) return;
        set(state.collections[collectionId], 'offset', offset);
    },
    deleteCollection(state, collectionId) {
        delete state.collections[collectionId];
    },
     setCollectionFetching(state, { id, isFetching, isFetched }) {
        set(state.collections[id], 'isFetching', isFetching);
        if (isFetched !== undefined) set(state.collections[id], 'isFetched', isFetched);
        else set(state.collections[id], 'isFetched', !isFetching);
    },
    // Variables
    setVariable(state, variable) {
        if (!state.variables[variable.id]) {
            state.variables[variable.id] = _.cloneDeep(variable);
        } else {
            Object.assign(state.variables[variable.id], _.cloneDeep(variable));
        }
    },
    setPluginVariable(state, variable) {
        if (!state.pluginVariables[variable.id]) {
            state.pluginVariables[variable.id] = variable;
        } else {
            Object.assign(state.pluginVariables[variable.id], variable);
        }
    },
    setComponentVariable(state, variable) {
        if (!state.componentVariables[variable.id]) {
            state.componentVariables[variable.id] = variable;
        } else {
            Object.assign(state.componentVariables[variable.id], variable);
        }
    },
    removeComponentVariable(state, variableId) {
        delete state.componentVariables[variableId];
    },
    setPageParameterVariable(state, variable) {
        if (!state.pageParameterVariables[variable.id]) {
            state.pageParameterVariables[variable.id] = variable;
        } else {
            Object.assign(state.pageParameterVariables[variable.id], variable);
        }
    },
    removePageParameterVariables(state) {
        state.pageParameterVariables = {};
    },
    setVariableValue(state, { variableId, value, ignoreQuery, path, index, arrayUpdateType, workflowContext }) {
        const currentVar =
            state.variables[variableId] ||
            state.pluginVariables[variableId] ||
            state.componentVariables[variableId] ||
            state.pageParameterVariables[variableId];
        if (!currentVar) return;
        if (typeof value === 'string') {
            switch (currentVar.type) {
                case 'query': {
                    if (!ignoreQuery) {
                        let router;
                         /* wwFront:start */
                        router = wwLib.getFrontRouter();
                        /* wwFront:end */
                        const currentPath = router.currentRoute._value.path;
                        const currentQuery = router.currentRoute._value.query;

                        const valueToSet = value !== currentVar.defaultValue ? value : undefined;

                        if (currentQuery[currentVar.queryName || currentVar.name] !== valueToSet) {
                            const query = { ...currentQuery };
                            // Apply all query variables because replace is async but we can't await here and so it produce a race condition issue on mulltiple query update
                            for (const key in state.variables) {
                                if (state.variables[key].type === 'query')
                                    query[state.variables[key].queryName || state.variables[key].name] =
                                        state.variables[key].value === '' ? undefined : state.variables[key].value;
                            }
                            query[currentVar.queryName || currentVar.name] = valueToSet;
                            router.replace({
                                path: currentPath,
                                query,
                            });
                        }
                    }
                    break;
                }
                case 'number':
                    try {
                        value = parseFloat(value);
                    } catch (error) {
                        value = 0;
                        wwLib.wwLog.error(`Unable to set variable ${variableId} value.`);
                        wwLib.wwLog.error('Expected value of type number, got :', value);
                    }
                    break;
                case 'object':
                case 'array':
                    if (!(path || arrayUpdateType)) {
                        try {
                            value = JSON.parse(value);
                        } catch (error) {
                            value = currentVar.type === 'object' ? {} : [];
                            wwLib.wwLog.error(`Unable to set variable ${variableId} value.`);
                            wwLib.wwLog.error(`Expected value of type ${currentVar.type}, got:`, value);
                        }
                    }

                    break;
            }
        } else if (
            value &&
            typeof value === 'object' &&
            ['object', 'array'].includes(currentVar.type) &&
            !currentVar.preserveReference
        ) {
            // Here we need to be sure we are not sharing object instance inside variable.
            // This may be overkill sometimes, but then we are sure to handle all corner cases when this is relevant
            value = _.cloneDeep(value);
        }

        if (currentVar.type === 'object' && path) {
            currentVar.value = currentVar.value || {};
            set(currentVar.value, path, value);
            wwLib.logStore.verbose(`Variable _wwVariable(${variableId}) update`, {
                preview: currentVar.value,
                workflowContext,
                type: workflowContext ? 'action' : null,
            });
        } else if (currentVar.type === 'array' && arrayUpdateType) {
            currentVar.value = currentVar.value || [];
            index = index || 0;
            switch (arrayUpdateType) {
                case 'update': {
                    let finalPath = `[${index}]`;
                    if (path) {
                        finalPath = `${finalPath}.${path}`;
                    }
                    set(currentVar.value, finalPath, value);
                    wwLib.logStore.verbose(`Updating partially array variable _wwVariable(${variableId}) `, {
                        preview: value,
                        workflowContext,
                        type: workflowContext ? 'action' : null,
                    });
                    break;
                }
                case 'delete':
                    currentVar.value.splice(index, 1);
                    wwLib.logStore.verbose(`Deleting item ${index} from array _wwVariable(${variableId})`, {
                        workflowContext,
                        type: workflowContext ? 'action' : null,
                    });
                    break;
                case 'insert':
                    currentVar.value.splice(index, 0, value);
                    wwLib.logStore.verbose(
                        `Inserting value into array variable at index ${index} _wwVariable(${variableId}) `,
                        {
                            preview: value,
                            workflowContext,
                            type: workflowContext ? 'action' : null,
                        }
                    );
                    break;
                case 'unshift':
                    currentVar.value.unshift(value);
                    wwLib.logStore.verbose(`Removing first element from array variable _wwVariable(${variableId}) `, {
                        workflowContext,
                        type: workflowContext ? 'action' : null,
                    });
                    break;
                case 'push':
                    currentVar.value.push(value);
                    wwLib.logStore.verbose(
                        `Adding value at the end of the array variable _wwVariable(${variableId}) `,
                        {
                            preview: value,
                            workflowContext,
                            type: workflowContext ? 'action' : null,
                        }
                    );
                    break;
                case 'shift':
                    currentVar.value.shift(value);
                    wwLib.logStore.verbose(
                        `Adding value at the start of the array variable _wwVariable(${variableId}) `,
                        {
                            preview: value,
                            workflowContext,
                            type: workflowContext ? 'action' : null,
                        }
                    );
                    break;
                case 'pop':
                    currentVar.value.pop(value);
                    wwLib.logStore.verbose(`Removing last value of the array variable _wwVariable(${variableId})`, {
                        workflowContext,
                        type: workflowContext ? 'action' : null,
                    });
                    break;
            }
        } else {
            currentVar.value = value;
            wwLib.logStore.verbose(`Setting value for _wwVariable(${variableId}) `, {
                preview: value,
                workflowContext,
                type: workflowContext ? 'action' : null,
            });
        }

        if (currentVar.isLocalStorage && window.localStorage) {
            wwLib.logStore.verbose(`Updating localStorage to synchronize with _wwVariable(${variableId})`);
            switch (currentVar.type) {
                case 'query':
                case 'string':
                    window.localStorage.setItem(`variable-${currentVar.id}`, value);
                    break;
                case 'number':
                case 'object':
                case 'array':
                case 'boolean':
                    window.localStorage.setItem(`variable-${currentVar.id}`, JSON.stringify(currentVar.value));
                    break;
            }
        }
    },
     // Formulas
    setFormula(state, formula) {
        set(state.formulas, formula.id, formula);
    },
     setPluginFormula(state, formula) {
        set(state.pluginFormulas, formula.id, formula);
    },
    /*=============================================m_ÔÔ_m=============================================\
        WORKFLOWS
    \================================================================================================*/
    setWorkflowActionResult(state, { workflowId, actionId, result, error }) {
        set(state.workflowsResults, `${workflowId}.${actionId}.result`, result);
        set(state.workflowsResults, `${workflowId}.${actionId}.error`, error);
    },
    setWorkflowError(state, { workflowId, value }) {
        set(state.workflowsResults, `${workflowId}.error`, value);
    },
    setWorkflowActionLoop(state, { workflowId, actionId, loop }) {
        set(state.workflowsResults, `${workflowId}.${actionId}.loop`, loop);
    },
    initGlobalWorkflow(state, workflowData) {
        set(state.globalWorkflows, workflowData.id, workflowData);
    },
    setGlobalWorkflow(state, workflowData) {
        set(state.globalWorkflows, workflowData.id, workflowData);
    },
    resetWorkflowsResult(state) {
        state.workflowsResults = {};
    },
 };
