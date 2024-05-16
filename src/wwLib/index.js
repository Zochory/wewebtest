import emitter from 'tiny-emitter/instance';
import services from './services/';
import { ref } from 'vue';

 /* wwFront:start */
// eslint-disable-next-line no-undef
import plugin_69d4a5bb_09a3_4f3d_a94e_667c21c057eb from '@/components/plugins/plugin-69d4a5bb-09a3-4f3d-a94e-667c21c057eb/src/wwPlugin.js';
import plugin_f9ef41c3_1c53_4857_855b_f2f6a40b7186 from '@/components/plugins/plugin-f9ef41c3-1c53-4857-855b-f2f6a40b7186/src/wwPlugin.js';
import plugin_1fa0dd68_5069_436c_9a7d_3b54c340f1fa from '@/components/plugins/plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa/src/wwPlugin.js';
import plugin_97e7b1ae_f88a_4697_849c_ee56ab49bb48 from '@/components/plugins/plugin-97e7b1ae-f88a-4697-849c-ee56ab49bb48/src/wwPlugin.js';
import plugin_2bd1c688_31c5_443e_ae25_59aa5b6431fb from '@/components/plugins/plugin-2bd1c688-31c5-443e-ae25-59aa5b6431fb/src/wwPlugin.js';
;
/* wwFront:end */

import { computed, reactive, inject } from 'vue';
import { executeWorkflow } from '@/_common/helpers/code/workflows';
import { executeWorkflows } from '@/_common/helpers/data/workflows';
import useLayoutStyle from '@/_front/use/useLayoutStyle';

const pageSanitizer = page => {
    const keysToInclude = [
        'id',
        'name',
        'favicon',
        'metaImage',
        'pageLoaded',
        'paths',
        'langs',
        'meta',
        'folder',
        'title',
        'sections',
        'pageUserGroups',
    ];

    const _page = {};
    keysToInclude.forEach(key => {
        _page[key] = page[key];
    });

    _page.meta && delete _page.meta.__typename;
    for (const section of _page.sections || []) {
        delete section.__typename;
    }

    const lang = wwLib.$store.getters['front/getLang'];
    if (_page.paths) _page.path = _page.paths[lang] || _page.paths.default;
    else _page.path = null;

    _page.lang = lang;

    return _page;
};

export default {
    ...services,
     $on(event, fn) {
        emitter.on(event, fn);
    },
    $once(event, fn) {
        emitter.once(event, fn);
    },
    $emit(event, ...args) {
        if (!event) {
            return;
        }
        emitter.emit(event, ...args);
    },
    $off(event, fn) {
        emitter.off(event, fn);
    },
     front: {},
    $focus: null,
    env: process.env.NODE_ENV,
    envMode: process.env.VUE_APP_ENV_MODE,

    async initFront({ router, store }) {
 
        this.front.router = router;
        /* wwFront:start */
        this.$store = store;
        /* wwFront:end */

        //Init services
        this.wwLog.init();

 
        wwLib.logStore.verbose('Starting the application...');
        await this.wwWebsiteData.init();

        /* wwFront:start */
        // eslint-disable-next-line no-undef
        wwLib.wwPluginHelper.registerPlugin('plugin-69d4a5bb-09a3-4f3d-a94e-667c21c057eb', plugin_69d4a5bb_09a3_4f3d_a94e_667c21c057eb);
wwLib.wwPluginHelper.registerPlugin('plugin-f9ef41c3-1c53-4857-855b-f2f6a40b7186', plugin_f9ef41c3_1c53_4857_855b_f2f6a40b7186);
wwLib.wwPluginHelper.registerPlugin('plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa', plugin_1fa0dd68_5069_436c_9a7d_3b54c340f1fa);
wwLib.wwPluginHelper.registerPlugin('plugin-97e7b1ae-f88a-4697-849c-ee56ab49bb48', plugin_97e7b1ae_f88a_4697_849c_ee56ab49bb48);
wwLib.wwPluginHelper.registerPlugin('plugin-2bd1c688-31c5-443e-ae25-59aa5b6431fb', plugin_2bd1c688_31c5_443e_ae25_59aa5b6431fb);
;
        /* wwFront:end */

 
        services.scrollStore.start();
    },
 
    /*=============================================m_ÔÔ_m=============================================\
      GET FRONT
    \================================================================================================*/
    getFrontWindow() {
        if (document.querySelector('.ww-manager-iframe')) {
            return document.querySelector('.ww-manager-iframe').contentWindow;
        }
        return window;
    },
    getFrontDocument() {
        return this.getFrontWindow().document;
    },
    getFrontRouter() {
        return this.front.router;
    },
    getFrontStore() {
        this.wwLog.warn('[DEPRECATED] method getFrontStore. Use $store directly');
        return this.$store;
    },

    /*=============================================m_ÔÔ_m=============================================\
      GET MANAGER
    \================================================================================================*/
    getManagerWindow() {
        this.wwLog.warn('[DEPRECATED], getManagerWindow is deprecated. Use getEditorWindow');
        return this.getEditorWindow();
    },
    getEditorWindow() {
        /* wwEditor:front */
        return window.top;
        /* wwEditor:end */
        // eslint-disable-next-line no-unreachable
        return null;
    },
    getManagerDocument() {
        this.wwLog.warn('[DEPRECATED], getManagerDocument is deprecated. Use getEditorDocument');
        return this.getEditorDocument();
    },
    getEditorDocument() {
        /* wwEditor:front */
        return wwLib.getEditorWindow().document;
        /* wwEditor:end */
        // eslint-disable-next-line no-unreachable
        return null;
    },
    getManagerRouter() {
        this.wwLog.warn('[DEPRECATED], getManagerRouter is deprecated. Use getEditorRouter');
        return this.getEditorRouter();
    },
    getEditorRouter() {
        return this.editor.router;
    },
    getEditorStore() {
        this.wwLog.warn('[DEPRECATED] method getEditorStore. Use $store directly');
        return this.$store;
    },

    /*=============================================m_ÔÔ_m=============================================\
      PRIVATE API
      TODO: MOVE THEM TO HELPERS
    \================================================================================================*/
    goTo(route, query = {}, options = {}) {
 
        /* wwFront:start */
        //Add leading '/'
        if (route && typeof route === 'string' && !route.startsWith('/')) {
            route = `/${route}`;
        }

        //Add trailling '/'
        if (route && typeof route === 'string' && !route.endsWith('/')) {
            route = `${route}/`;
        }

        route = wwLib.getFrontRouter().resolve({ path: route, query, hash: options.hash });
        if (options && options.openInNewTab) window.open(route.href, '_blank').focus();
        //Prevent page change if same page
        else if (route.href === wwLib.getFrontRouter().currentRoute.value.href && !options.hash) return;
        else {
            wwLib.getFrontRouter().push(route);
            if (route.name === wwLib.getFrontRouter().currentRoute.value.name && options.hash) {
                const section = wwLib.getFrontDocument().getElementById(options.hash.replace('#', ''));
                section
                    ? wwLib.wwUtils.scrollIntoView(section)
                    : wwLib.getFrontWindow().scroll({
                          top: 0,
                          left: 0,
                          behavior: 'smooth',
                      });
            }
        }
        /* wwFront:end */
    },
    getResponsiveStyleProp({ store, style, uid, states = [], prop }) {
        store = store || wwLib.getFrontWindow().wwLib.$store;
        if (!style && uid) {
            const wwObject = this.$store.getters['websiteData/getWwObject'](uid);
            if (!wwObject) return '';
            style = (wwObject._state || {}).style || {};
        }

        const screenSizes = store.getters['front/getScreenSizes'];
        const screenSize = store.getters['front/getScreenSize'];

        let value = '';

        for (const media in screenSizes) {
            if (style[media] && typeof style[media][prop] !== 'undefined') {
                value = style[media][prop];
            }
            if (media === screenSize) {
                break;
            }
        }
        for (const state of states) {
            for (const media in screenSizes) {
                if (style[`${state}_${media}`] && style[`${state}_${media}`][prop]) {
                    value = style[`${state}_${media}`][prop];
                }
                if (media === screenSize) {
                    break;
                }
            }
        }

        return value;
    },
    globalContext: reactive({
        page: computed(() => {
            const page = wwLib.$store.getters['websiteData/getPage'];
            if (!page) return {};
            else if (!page.cmsDataSetPath) return { ...pageSanitizer(page) };
            return { ...pageSanitizer(page), data: wwLib.$store.getters['data/getPageCollectionData'] };
        }),
        pageParameters: computed(() => {
            return Object.values(wwLib.$store.getters['data/getPageParameterVariables']).reduce((acc, variable) => {
                acc[variable.id] = variable.value;
                return acc;
            }, {});
        }),
        pages: computed(() => {
            return wwLib.$store.getters['websiteData/getPages'].reduce((acc, page) => {
                acc[page.id] = pageSanitizer(page);
                return acc;
            }, {});
        }),
        colors: computed(() => {
            const theme = wwLib.$store.getters['front/getTheme'];
             /* wwFront:start */
            // eslint-disable-next-line no-unreachable
            const regexUid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
            const styles = Array.from(document.styleSheets)
                .filter(sheet => sheet.href === null || sheet.href.startsWith(window.location.origin))
                .reduce(
                    (acc, sheet) =>
                        (acc = [
                            ...acc,
                            ...Array.from(sheet.cssRules).reduce(
                                (def, rule) =>
                                    (def =
                                        rule.selectorText === ':root'
                                            ? [...def, ...Array.from(rule.style).filter(name => name.startsWith('--'))]
                                            : def),
                                []
                            ),
                        ]),
                    []
                );
            return [...styles].reduce((acc, style) => {
                const colorId = style.replace('--', '');
                const colorToken = getComputedStyle(wwLib.getFrontDocument().documentElement).getPropertyValue(style);
                if (colorId.match(regexUid) && CSS.supports('color', colorToken)) acc[colorId] = colorToken;
                return acc;
            }, {});
            /* wwFront:end */
        }),
        spacings: computed(() => {
             /* wwFront:start */
            // eslint-disable-next-line no-unreachable
            const regexUid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
            const styles = Array.from(document.styleSheets)
                .filter(sheet => sheet.href === null || sheet.href.startsWith(window.location.origin))
                .reduce(
                    (acc, sheet) =>
                        (acc = [
                            ...acc,
                            ...Array.from(sheet.cssRules).reduce(
                                (def, rule) =>
                                    (def =
                                        rule.selectorText === ':root'
                                            ? [...def, ...Array.from(rule.style).filter(name => name.startsWith('--'))]
                                            : def),
                                []
                            ),
                        ]),
                    []
                );
            return [...styles].reduce((acc, style) => {
                const spacingId = style.replace('--', '');
                const spacingToken = getComputedStyle(wwLib.getFrontDocument().documentElement).getPropertyValue(style);
                if (spacingId.match(regexUid) && CSS.supports('margin-top', spacingToken))
                    acc[spacingId] = spacingToken;
                return acc;
            }, {});
            /* wwFront:end */
        }),
        typographies: computed(() => {
             /* wwFront:start */
            // eslint-disable-next-line no-unreachable
            const regexUid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
            const styles = Array.from(document.styleSheets)
                .filter(sheet => sheet.href === null || sheet.href.startsWith(window.location.origin))
                .reduce(
                    (acc, sheet) =>
                        (acc = [
                            ...acc,
                            ...Array.from(sheet.cssRules).reduce(
                                (def, rule) =>
                                    (def =
                                        rule.selectorText === ':root'
                                            ? [...def, ...Array.from(rule.style).filter(name => name.startsWith('--'))]
                                            : def),
                                []
                            ),
                        ]),
                    []
                );
            return [...styles].reduce((acc, style) => {
                const typographyId = style.replace('--', '');
                const typographhyToken = getComputedStyle(wwLib.getFrontDocument().documentElement).getPropertyValue(
                    style
                );
                if (typographyId.match(regexUid) && CSS.supports('font', typographhyToken))
                    acc[typographyId] = typographhyToken;
                return acc;
            }, {});
            /* wwFront:end */
        }),
        browser: computed(() => {
            const router = wwLib.manager ? wwLib.getEditorRouter() : wwLib.getFrontRouter();
            const currentRoute = router.currentRoute.value;
            let currentQueries = currentRoute.query;
             return {
                url: window.location.origin + currentRoute.fullPath,
                path: currentRoute.path,
                // verify if auth plugin
                 /* wwFront:start */
                // eslint-disable-next-line no-dupe-keys
                source: currentQueries._source,
                /* wwFront:end */
                query: currentQueries,
                domain: window.location.hostname,
                baseUrl: window.location.origin,
                breakpoint: wwLib.$store.getters['front/getScreenSize'],
                environment: wwLib.manager
                    ? 'editor'
                    : window.location.host.includes('-staging.' + process.env.VUE_APP_PREVIEW_URL)
                    ? 'staging'
                    : window.location.host.includes(process.env.VUE_APP_PREVIEW_URL)
                    ? 'preview'
                    : 'production',
                theme: wwLib.$store.getters['front/getTheme'],
            };
        }),
        screen: services.scrollStore.screen,
        componentPositionInfo: services.scrollStore.componentPositionInfo,
    }),
    pageData: computed(() => {
        const lang = wwLib.$store.getters['front/getLang'];
        const cmsDataSetPath = wwLib.$store.getters['websiteData/getPage'].cmsDataSetPath;
        if (!cmsDataSetPath) {
            return { lang };
        }

        return { lang, data: wwLib.$store.getters['data/getPageCollectionData'] };
    }),
    getDataValue({ binding, bindingContext = undefined, forcedCmsDataset = undefined }) {
        if (!binding) return { find: false };

        // Binding to parent data
        if (binding.startsWith('__wwParent.')) {
            binding = binding.replace('__wwParent.', '');
            const value = _.get(bindingContext, binding, undefined);
            if (value === undefined) return { find: false };
            return { value, find: true };
        }

        // Binding to page
        if (binding.startsWith('__wwPage.') && !forcedCmsDataset) {
            binding = binding.replace('__wwPage.', '');
            const value = _.get(wwLib.pageData.value, binding, undefined);
            if (value === undefined) return { find: false };
            return { value, find: true };
        }

        if (binding.startsWith('__wwPage.data') && forcedCmsDataset) {
            binding = binding.replace('__wwPage.data', `${forcedCmsDataset}[0]`);
        }

        // Binding to collections
        const data = wwLib.$store.getters['data/getCollections'];
        const value = _.get(data, binding, undefined);
        if (value === undefined) return { find: false };
        return { value, find: true };
    },

    getStyleFromColor(color) {
        if (!color) return {};
        if (typeof color === 'object') {
            if (color.type === 'none') return {};
            if (color.type === 'gradient' && color.value && color.value.value)
                return { backgroundImage: color.value.value };
            else return { backgroundColor: color.value };
        } else {
            if (color.startsWith('var')) return { backgroundColor: color };
            if (color.includes('gradient')) return { backgroundImage: color };
            return { backgroundColor: color };
        }
    },
    getStyleFromToken(token) {
        if (!token || typeof token !== 'string') return null;
        const VAR_REGEXP = /^var\(--(.+)\s*,\s*(.+)\)$/;
        let [, styleId] = token.match(VAR_REGEXP) || [];

        if (styleId) {
            styleId = styleId.split(',')[0];
 
            /* wwFront:start */
            // eslint-disable-next-line no-unreachable
            return (
                getComputedStyle(
                    wwLib.getFrontDocument().getElementsByClassName('website-wrapper')[0]
                ).getPropertyValue(`--${styleId}`) || null
            );
            /* wwFront:end */
        } else {
            return null;
        }
    },
    getTypoFromToken(token) {
        if (!token) token = '400 12px/normal var(--ww-default-font-family, sans-serif)';
        let [fontStyle, fontWeight, sizes, ...familyParts] = token.split(' ');
        if (fontStyle !== 'italic') {
            [fontWeight, sizes, ...familyParts] = token.split(' ');
            fontStyle = null;
        }
        const [fontSize, lineHeight] = sizes.split('/');
        let fontFamily = familyParts && familyParts.length ? familyParts.join(' ') : undefined;
        if (fontFamily && fontFamily.startsWith('var(--')) {
            fontFamily = undefined;
        }
        fontWeight = parseInt(fontWeight || 400);
        if (isNaN(fontWeight)) {
            fontWeight = 400;
        }
        return {
            fontWeight,
            fontSize,
            lineHeight: lineHeight || 'normal',
            fontFamily,
            fontStyle,
        };
    },

    /*=============================================m_ÔÔ_m=============================================\
      PUBLIC API
    \================================================================================================*/
    element(value) {
        if (typeof value === 'object') {
            return { isWwObject: true, ...value };
        } else {
            return { isWwObject: true, type: value };
        }
    },
    resolveObjectPropertyPath(object, path) {
        return _.get(object, path);
    },
    getTextStyleFromContent(content) {
        const style = {
            ...(content['_ww-text_font']
                ? {
                      fontSize: 'unset',
                      fontFamily: 'unset',
                      lineHeight: 'unset',
                      fontWeight: 'unset',
                      fontStyle: 'unset',
                      font: content['_ww-text_font'] || '',
                  }
                : {
                      fontSize: content['_ww-text_fontSize'],
                      fontFamily: content['_ww-text_fontFamily'] || 'var(--ww-default-font-family)',
                      lineHeight: content['_ww-text_lineHeight'],
                      fontWeight: content['_ww-text_fontWeight'],
                      fontStyle: content['_ww-text_fontStyle'],
                  }),
            textAlign: content['_ww-text_textAlign'],
            color: content['_ww-text_color'],
            textTransform: content['_ww-text_textTransform'],
            textShadow: content['_ww-text_textShadow'],
            letterSpacing: content['_ww-text_letterSpacing'],
            wordSpacing: content['_ww-text_wordSpacing'],
            textDecoration: content['_ww-text_textDecoration'],
            textDecorationStyle: content['_ww-text_textDecorationStyle'],
            textDecorationColor: content['_ww-text_textDecorationColor'],
            overflow: content['_ww-text_nowrap'] ? 'hidden' : 'initial',
            textOverflow: content['_ww-text_ellipsis'] ? 'ellipsis' : 'initial',
            whiteSpace: content['_ww-text_nowrap'] ? 'nowrap' : 'initial',
            whiteSpaceCollapse: 'preserve',
        };
        return style;
    },
    async executeWorkflow(workflowId, parameters) {
        if (!workflowId) throw new Error('No workflow provided.');
        const workflow = wwLib.$store.getters['data/getGlobalWorkflows'][workflowId];
        if (!workflow) throw new Error('Workflow not found.');
        const execution = await executeWorkflow(workflow, {
            context: {
                parameters,
                workflow: wwLib.$store.getters['data/getWorkflowResults'](workflowId),
            },
        });
        if (execution.error) {
            throw execution.error;
        }
        return execution.result;
    },
    executeTrigger(triggerId, payload) {
        executeWorkflows(triggerId, { event: payload });
    },
    getValidHTML(html) {
        const doc = document.createElement('div');
        doc.innerHTML = html;
        return doc.innerHTML;
    },
    useLayoutStyle,
    /*=============================================m_ÔÔ_m=============================================\
      PUBLIC API EDITOR ONLY
    \================================================================================================*/
     useCreateElement() {
        const parentRawData = inject('componentData', ref({}));
        return {
            async createElement(type, { content, _state } = {}, { keepChildren } = {}) {
                /* wwFront:start */
                wwLib.wwLog.warn('The function "createElement" should not be called on the production website.');
                /* wwFront:end */
             },
            async createElementFromTemplate(template, { keepChildren } = {}) {
                /* wwFront:start */
                wwLib.wwLog.warn(
                    'The function "createElementFromTemplate" should not be called on the production website.'
                );
                /* wwFront:end */
             },
            async cloneElement(uid, { name } = {}) {
                /* wwFront:start */
                wwLib.wwLog.warn('The function "cloneElement" should not be called on the production website.');
                /* wwFront:end */
             },
        };
    },
};
