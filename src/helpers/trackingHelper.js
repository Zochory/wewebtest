export const sendEventToSegment = ({
    uid,
    event,
    path,
    isWwObject,
    selectedTab,
    value,
    breakpoint,
    state,
    payload,
}) => {
    const analytics = wwLib.getEditorWindow().analytics;
    const type = isWwObject ? 'element' : 'section';
    const exceptions = [
        'SIDEBAR_TAB_CHANGED',
        'COMPONENT_BREAKPOINT_REMOVED',
        'COMPONENT_STATE_REMOVED',
        'COMPONENT_DATA_BOUND',
        'COMPONENT_DATA_UNBOUND',
    ];
    let send = false;

    if (!exceptions.includes(event)) {
        const last = JSON.parse(localStorage.getItem('lastSettingChanged'));
        const now = Date.now();

        if (last && last.name === camelToSnakeCase(path) && last.date <= now - 1000) {
            send = true;
        } else if (last && last.name !== camelToSnakeCase(path)) {
            send = true;
        }

        const lastSettingChanged = {
            name: camelToSnakeCase(path),
            date: Date.now(),
        };
        localStorage.setItem('lastSettingChanged', JSON.stringify(lastSettingChanged));
    }

    if (exceptions.includes(event)) {
        send = true;
    }

    const component = isWwObject
        ? wwLib.$store.getters['websiteData/getWwObject'](uid)
        : wwLib.$store.getters['websiteData/getSection'](uid);
    let source_code_name;

    if (!component) {
        send = false;
    } else {
        source_code_name = uid && isWwObject ? component.wwObjectBaseId : component.sectionBaseId;
    }

    if (send) {
        switch (event) {
            case 'COMPONENT_VALUE_UPDATED':
                analytics.track(event, {
                    component_type: type,
                    tab: selectedTab,
                    path: camelToSnakeCase(path),
                    value,
                    breakpoint,
                    state,
                    uid,
                    source_code_name,
                });
                break;
            // case 'QUICKACCESS_VALUE_UPDATED':
            //     window.parent.analytics.track(event, {
            //         type,
            //         name: camelToSnakeCase(path),
            //         value: value,
            //         breakpoint: breakpoint,
            //     });
            //     break;
            case 'SIDEBAR_TAB_CHANGED':
                analytics.track(event, {
                    component_type: type,
                    tab: selectedTab,
                });
                break;
            case 'COMPONENT_BREAKPOINT_REMOVED':
                analytics.track(event, {
                    component_type: type,
                    path: camelToSnakeCase(path),
                    breakpoint,
                    uid,
                    source_code_name,
                });
                break;
            case 'COMPONENT_STATE_REMOVED':
                analytics.track(event, {
                    component_type: type,
                    path: camelToSnakeCase(path),
                    state,
                    uid,
                    source_code_name,
                });
                break;
            case 'COMPONENT_DATA_BOUND':
                analytics.track(event, {
                    component_type: type,
                    source_code_name,
                    path: camelToSnakeCase(path),
                    uid,
                    ...payload,
                });
                break;
            case 'COMPONENT_DATA_UNBOUND':
                analytics.track(event, {
                    component_type: type,
                    path: camelToSnakeCase(path),
                    uid,
                    source_code_name,
                });
                break;
            case 'EXPLORER_DATA_CLICKED':
                analytics.track(event, {
                    component_type: type,
                    path: camelToSnakeCase(path),
                    uid,
                    source_code_name,
                    ...payload,
                });
                break;
            default:
                break;
        }
    }
};

const camelToSnakeCase = str => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};
