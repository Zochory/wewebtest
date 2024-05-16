import { createApp, createSSRApp } from 'vue';
import axios from 'axios';
import { VueCookieNext } from 'vue-cookie-next';
import isEqual from 'lodash.isequal';
import isEmpty from 'lodash.isempty';
import cloneDeep from 'lodash.clonedeep';
import get from 'lodash.get';
import set from 'lodash.set';
import merge from 'lodash.merge';

/* wwFront:start */
import { createHead } from '@vueuse/head';
/* wwFront:end */

 
import App from '@/_front/App.vue';
import router from '@/_front/router';

let store;
/* wwFront:start */
// Set theme class before first global context computation to avoid flickering and wrong computed colors
if (window.localStorage?.getItem('ww-app-theme') === 'dark')
    document.documentElement.classList.add('ww-app-theme-dark');
else if (window.localStorage?.getItem('ww-app-theme') === 'light')
    document.documentElement.classList.remove('ww-app-theme-dark');

import storeImport from '@/store';
import wwLibImport from '@/wwLib';
store = storeImport;
window.wwLib = wwLibImport;

if (!window.__WW_IS_PRERENDER__ && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register(`serviceworker.js?_wwcv=${window.wwg_cacheVersion}`);
}
/* wwFront:end */
 
import wwElements from '@/_front/components/';
import prerenderProcess from './prerenderProcess';
import { addMediaQueriesListener } from '../helpers/mediaQueriesListener';
import globalServices from '@/_common/plugins/globalServices';

if (window.__WW_IS_PRERENDER__) {
    window.prerenderProcess = prerenderProcess;
}

 
require('@/assets/css');

//Set window libraries
window._ = {
    isEqual,
    isEmpty,
    cloneDeep,
    get,
    set,
    merge,
};
window.axios = axios.create({});

 
let app;
 /* wwFront:start */
if (window.__WW_IS_PRERENDER__) {
    app = createApp(App);
} else {
    app = createSSRApp(App);
}
/* wwFront:end */

const init = async function () {
    window.vm = app;

    app.use(store);
    app.use(VueCookieNext);
    app.use(wwElements);
    app.use(globalServices);
    app.config.unwrapInjectedRef = true;
    /* wwFront:start */
    app.use(createHead());
    /* wwFront:end */

 
 
    await wwLib.initFront({ store, router });

    app.use(router);

    addMediaQueriesListener(wwLib.$store.getters['front/getScreenSizes'], (screenSize, isActive) => {
        wwLib.$store.dispatch('front/setIsScreenSizeActive', { screenSize, isActive });
    });

    await router.isReady();

    // We select ourself app element, because Vue does not know how to do it properly (Editor + Front Iframe)
    const el = document.getElementById('app');
    app.mount(el);

    /* wwFront:start */
    // Needed or reactivity is not working in published app
    wwLib.scrollStore.setValues();
    /* wwFront:end */

    wwLib.$emit('wwLib:isMounted');
    wwLib.isMounted = true;
};

if (window.__WW_IS_PRERENDER__ && `${process.env.VUE_APP_PRERENDER_DISABLED}` === 'true') {
    const pageId = router.resolve(window.location.pathname).meta.pageId;
    document.querySelector('body').setAttribute('ww-page-id', pageId);

    //Fake store for prerenderer comparison.
    wwLib.$store = {
        getters: {
            'websiteData/getPageId': 0,
            'websiteData/getDesignInfo': {
                homePageId: -1,
            },
        },
    };
} else if (window === top) {
    init();
} else {
    setTimeout(init, 1);
}

/* wwFront:start */
wwLib.getFrontWindow().addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    wwLib.installPwaPrompt = e;
});
/* wwFront:end */

export default app;
