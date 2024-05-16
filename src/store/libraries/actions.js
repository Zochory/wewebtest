 
function injectLibraryContent(dispatch, commit, library) {
    for (const section of library.sections) commit('setSection', section);
    for (const element of library.elements) commit('setElement', element);
    for (const style of library.styles) commit('initStyle', style);
    for (const classItem of library.classes) commit('setClass', classItem);
    for (const component of library.components) commit('setComponent', component);
    for (const element of library.componentsElements) dispatch('websiteData/setWwObject', element, { root: true });
}

export default {
    /*=============================================m_ÔÔ_m=============================================\
        Libraries
    \================================================================================================*/
 
    /*=============================================m_ÔÔ_m=============================================\
        Styles
    \================================================================================================*/
 
    /*=============================================m_ÔÔ_m=============================================\
        Classes
    \================================================================================================*/
    setClasses({ commit }, libraryClasses) {
        for (const libraryClass of libraryClasses) {
            commit('setClass', libraryClass);
        }
    },
 
    /*=============================================m_ÔÔ_m=============================================\
        Sections
    \================================================================================================*/
 
    /*=============================================m_ÔÔ_m=============================================\
        Elements
    \================================================================================================*/
 
    /*=============================================m_ÔÔ_m=============================================\
        Components
    \================================================================================================*/
    setComponents({ commit }, libraryComponents) {
        for (const libraryComponent of libraryComponents) {
            commit('setComponent', libraryComponent);
        }
    },
 };
