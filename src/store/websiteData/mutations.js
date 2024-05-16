 
import { getPath } from '@/_common/helpers/pathResolver';

export default {
    /*=============================================m_ÔÔ_m=============================================\
        DESIGN
    \================================================================================================*/
    setFullDesign(state, designInfo) {
        state.design.info = { ...designInfo, pages: undefined, plugins: undefined };

        for (let page of designInfo.pages) {
            state.design.pages.push(page);
        }
    },
    updateDesignInfo(state, designInfo) {
        state.design.info = { ...designInfo, _isFromSocket: undefined };
    },
    setFonts(state, fonts) {
        state.design.info.fonts = fonts;
    },
 
 
    /*=============================================m_ÔÔ_m=============================================\
        PAGE
    \================================================================================================*/
    setPageData(state, data) {
        state.sections = { ...state.sections, ...data.sections };
        state.wwObjects = { ...state.wwObjects, ...data.wwObjects };

        for (const page of state.design.pages) {
            if (page && page.id === data.page.id) {
                for (const key of Object.keys(data.page)) {
                    page[key] = data.page[key];
                }
                page.sections = Object.values(data.sections).map(section => ({
                    ...((page.sections || []).find(pageSection => pageSection.uid === section.uid) || {}),
                    ...section,
                }));
                page.pageLoaded = true;
                state.pageId = data.page.id;
            } else {
                if (page) {
                    page.pageLoaded = false;
                }
            }
        }

        //wwLib.wwLog.info(state)
    },
    setPageId(state, id) {
        state.pageId = id;
    },
 
 
    /*=============================================m_ÔÔ_m=============================================\
        PLUGINS
    \================================================================================================*/
    addPlugin(state, plugin) {
        const pluginIndexFound = state.plugins.findIndex(elem => elem.name === plugin.name);
        if (pluginIndexFound !== -1) {
            const pluginFound = state.plugins[pluginIndexFound];
            const pluginMerge = pluginFound.isDev ? { ...pluginFound, ...plugin } : { ...plugin, ...pluginFound };
            state.plugins.splice(pluginIndexFound, 1, pluginMerge);
        } else {
            state.plugins.push({
                id: plugin.id,
                isDev: plugin.isDev,
                isLoaded: plugin.isLoaded,
                name: plugin.name,
                settings: plugin.settings,
             });
        }
    },
    updatePlugin(state, { pluginId, settings, isDev, isLoaded }) {
        const plugin = state.plugins.find(plugin => plugin.name === pluginId || plugin.id === pluginId);
        if (!plugin) return;
        if (settings) plugin.settings = settings;
        if (typeof isDev === 'boolean') plugin.isDev = isDev;
        if (typeof isLoaded === 'boolean') plugin.isLoaded = isLoaded;
    },
};
