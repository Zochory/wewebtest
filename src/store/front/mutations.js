export default {
    setIsPrerenderHydration(state, isPrerenderHydration) {
        state.isPrerenderHydration = isPrerenderHydration;
    },
    showPageLoadProgress(state, showPageLoadProgress) {
        state.showPageLoadProgress = showPageLoadProgress;
    },
    setTheme(state, theme) {
        state.theme = theme;
    },
    /*=============================================m_ÔÔ_m=============================================\
        LANG
    \================================================================================================*/
    setLang(state, newLang) {
         state.lang = newLang;
    },
    /*=============================================m_ÔÔ_m=============================================\
        SCREEN SIZE
    \================================================================================================*/
    setIsScreenSizeActive(state, { screenSize, isActive }) {
        state.isScreenSizeActive[screenSize] = !!isActive;
    },
    /*=============================================m_ÔÔ_m=============================================\
        COMPONENTS CONFIG
    \================================================================================================*/
    addComponentConfig(state, options) {
        const regexUid = '\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b';
        options = {
            ...options,
            name: options.name
                .replace(/section-/ + regexUid, '')
                .replace(/wwobject-/ + regexUid, '')
                .replace(/plugin-/ + regexUid, ''),
        };
        state.componentConfigs[options.name] = options;
    },
    setActiveLinkPopup(state, options) {
        const { content, background, sectionId } = options || {};
        state.activeLinkPopup = options ? { content, background, sectionId } : null;
    },
};
