import utils from './utils';
import get from 'lodash.get';
 
export default {
    /*=============================================m_ÔÔ_m=============================================\
        DESIGN
    \================================================================================================*/
    getDesign(state) {
        if (!state.design) {
            return null;
        }

        return state.design;
    },
    getDesignInfo(state) {
        if (!state.design || !state.design.info) {
            return {};
        }

        return state.design.info;
    },
 
    /*=============================================m_ÔÔ_m=============================================\
        PAGES
    \================================================================================================*/
    getPages(state) {
         // eslint-disable-next-line no-unreachable
        return state.design.pages;
    },
     getPage(state) {
        return utils.getPage(state);
    },
    getPageById: state => id => state.design.pages.find(page => page.id === id),
    getPageByLinkId: state => linkId => state.design.pages.find(page => page.linkId === linkId || page.id === linkId),
    getFullPage(state) {
        return utils.getFullPage(state);
    },
    getPageId(state) {
        return state.pageId;
    },

    /*=============================================m_ÔÔ_m=============================================\
        WWOBJECTS
    \================================================================================================*/
    getWwObject: state => id => state.wwObjects[id],
    getWwObjectState: state => id => {
        const { _state } = state.wwObjects[id] || {};
        return _state || {};
    },
    getComponentAvailableStates:
        state =>
        ({ type, uid }) => {
            let _state;
            if (type === 'section') {
                _state = (state.sections[uid] && state.sections[uid]._state) || {};
            } else {
                _state = (state.wwObjects[uid] && state.wwObjects[uid]._state) || {};
            }
            return (_state.states || []).map(state => state.id);
        },
    getComponentRawStates:
        state =>
        ({ type, uid }) => {
            let _state;
            if (type === 'section') {
                _state = (state.sections[uid] && state.sections[uid]._state) || {};
            } else {
                _state = (state.wwObjects[uid] && state.wwObjects[uid]._state) || {};
            }
            return _state.states || [];
        },
    getWwObjectContent: state => id => {
        const { content } = state.wwObjects[id] || {};
        return content || {};
    },
    getWwObjectCms: state => id => {
        const { cms } = state.wwObjects[id] || {};
        return cms || {};
    },
    getWwObjectBaseId: state => id => {
        if (!state.wwObjects[id]) return null;
        return state.wwObjects[id].wwObjectBaseId;
    },
    getWwObjectStyle: state => id => {
        const { _state = {} } = state.wwObjects[id] || {};
        return _state.style || {};
    },
    getFullWwObject:
        state =>
        (uid, asTemplate = false) => {
            return utils.parseFullObject(state, { uid, isWwObject: true }, asTemplate);
        },
    getWwObjects(state) {
        return state.wwObjects;
    },
    /*=============================================m_ÔÔ_m=============================================\
      SECTIONS
    \================================================================================================*/
    getSection(state) {
        return function (sectionId) {
            if (state.sections[sectionId]) {
                return state.sections[sectionId];
            }
            return null;
        };
    },
    getSectionTitle: state => uid => {
        return state.design.pages
            .map(page => page.sections || [])
            .flat()
            .find(section => section.uid === uid)?.sectionTitle;
    },
    getSectionState: state => id => {
        const { _state } = state.sections[id] || {};
        return _state || {};
    },
    getSectionAvailableStates: state => id => {
        return get(state, `sections.['${id}']._state.states`, []);
    },
    getSectionContent: state => id => {
        const { content } = state.sections[id] || {};
        return content || {};
    },
    getSectionBaseId: state => id => {
        if (!state.sections[id]) return null;
        return state.sections[id].sectionBaseId;
    },

    getSectionStyle: state => id => {
        const { _state = {} } = state.sections[id] || {};
        return _state.style || {};
    },
    getFullSection(state) {
        return function (sectionId) {
            if (state.sections[sectionId]) {
                let section = _.cloneDeep(state.sections[sectionId]);
                return utils.parseFullObject(state, section);
            }
            return null;
        };
    },
    getSections: state => state.sections,
    getIsSectionLinked: state => sectionId =>
        state.design.pages
            .map(page => page.sections || [])
            .flat()
            .filter(section => section.uid === sectionId).length > 1,
    /*=============================================m_ÔÔ_m=============================================\
        PLUGINS
    \================================================================================================*/
    getPlugins: state => state.plugins,
     getPluginByComponentId: state => componentId =>
        state.plugins.find(plugin => plugin.id && `plugin-${plugin.id}` === componentId),
    getPluginByName: state => name => state.plugins.find(plugin => plugin.name === name),
    getPluginById: state => id => state.plugins.find(plugin => id && plugin.id === id),
    getPluginSettings: (_, getters) => id => {
        const plugin = getters.getPluginById(id);
        return plugin && plugin.settings;
    },
    getPluginIsLoaded: (_, getters) => id => {
        const plugin = getters.getPluginById(id);
        return plugin && plugin.isLoaded;
    },
};
