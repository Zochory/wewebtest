import { registerVariable, unregisterVariable } from '@/_common/helpers/data/variables';

export default {
    setCollections({ commit }, collections) {
        for (const collection of collections) {
            if (!collection) continue;
            commit('setCollection', { ...collection, isFetching: collection.mode !== 'static' });
            commit('setCollectionFetching', {
                id: collection.id,
                isFetching: false,
                isFetched: collection.mode === 'static',
            });
        }
    },
    setNewCollections({ commit, state }, collections) {
        /* wwFront:start */
        for (const collection of Object.values(state.collections)) {
            if (collection.mode === 'static') continue;
            if (collection.config.isPersistentOnNav) continue;
            commit('deleteCollection', collection.id);
        }
        /* wwFront:end */
        for (const collection of collections) {
            if (!collection) continue;
            if (state.collections[collection.id]) continue;
            commit('setCollection', { ...collection, isFetching: collection.mode !== 'static' });
            commit('setCollectionFetching', {
                id: collection.id,
                isFetching: false,
                isFetched: collection.mode === 'static',
            });
        }
    },
    setCollectionOffset({ commit }, { collectionId, offset }) {
        commit('setCollectionOffset', { collectionId, offset });
    },
    setCollection({ commit }, collection) {
        commit('setCollection', collection);
    },
     setCollectionFetching({ commit }, { id, isFetching, isFetched }) {
        commit('setCollectionFetching', { id, isFetching, isFetched });
    },
    // Variables
    setVariables({ dispatch }, variables) {
        for (const variable of variables) {
            dispatch('setVariable', { ...variable, defaultValue: variable.value });
        }
    },
    setNewVariables({ dispatch, state }, variables) {
        for (const variable of variables) {
            if (!state.variables[variable.id]) {
                dispatch('setVariable', { ...variable, defaultValue: variable.value });
            }
        }
    },
    setVariable({ commit }, variable) {
        if (!variable) return;
        commit('setVariable', { ...variable, defaultValue: variable.value });
        registerVariable(variable.id);
    },
    setPluginVariable({ commit }, variable) {
        if (!variable) return;
        commit('setPluginVariable', variable);
    },
    setComponentVariable({ commit }, variable) {
        if (!variable) return;
        commit('setComponentVariable', variable);

        //TODO : HACK TO PRESERVE COMPUTED ON COMPONENTS UNMOUT
        setTimeout(() => {
            registerVariable(variable.id);
        });
    },
    removeComponentVariables({ commit, getters, rootGetters }) {
        const componentVariables = getters['getComponentVariables'];
        const sectionsId = (rootGetters['websiteData/getPage'].sections || []).map(section => section.uid);

        for (const componentVariable of Object.values(componentVariables)) {
            if (!sectionsId.includes(componentVariable.sectionId)) {
                unregisterVariable(componentVariable.id);
                commit('removeComponentVariable', componentVariable.id);
            }
        }
    },
    setPageParameterVariables({ commit, getters, rootGetters }) {
        commit('removePageParameterVariables');
        const page = rootGetters['websiteData/getPage'];
        let params = {};
         /* wwFront:start */
        params = wwLib.getFrontRouter().currentRoute._value.params;
        /* wwFront:end */
        const variables = getters['getPageParameterVariablesFromId'](page.id);
        for (const variable of variables) {
            commit('setPageParameterVariable', {
                ...variable,
                 /* wwFront:start */
                value: params[variable.id],
                /* wwFront:end */
            });
        }
    },
    removePageParameterVariables({ commit }) {
        commit('removePageParameterVariables');
    },
    setVariableValue({ commit }, { variableId, value, ignoreQuery, path, index, arrayUpdateType, workflowContext }) {
        commit('setVariableValue', { variableId, value, ignoreQuery, path, index, arrayUpdateType, workflowContext });
    },
     // Formulas
    setFormulas({ dispatch }, formulas) {
        for (const formula of formulas) {
            dispatch('setFormula', formula);
        }
    },
    setFormula({ commit }, formula) {
        if (!formula) return;
        commit('setFormula', formula);
    },
     setPluginFormula({ commit }, formula) {
        if (!formula) return;
        commit('setPluginFormula', formula);
    },
    /*=============================================m_ÔÔ_m=============================================\
        WORKFLOWS
    \================================================================================================*/
    setWorkflowActionResult({ commit }, data) {
        commit('setWorkflowActionResult', data);
    },
    setWorkflowError({ commit }, data) {
        commit('setWorkflowError', data);
    },
    setWorkflowActionLoop({ commit }, data) {
        commit('setWorkflowActionLoop', data);
    },
    initGlobalWorkflows({ dispatch }, workflows) {
        for (const worfklowData of workflows) {
            dispatch('initGlobalWorkflow', worfklowData);
        }
    },
    initGlobalWorkflow({ commit }, worfklowData) {
        if (!worfklowData) return;
        commit('initGlobalWorkflow', worfklowData);
    },
    setGlobalWorkflows({ dispatch }, workflows) {
        for (const worfklowData of workflows) {
            dispatch('setGlobalWorkflow', worfklowData);
        }
    },
    setGlobalWorkflow({ commit }, worfklowData) {
        if (!worfklowData) return;
        commit('setGlobalWorkflow', worfklowData);
    },
    resetWorkflowsResult({ commit }) {
        commit('resetWorkflowsResult');
    },
 };
