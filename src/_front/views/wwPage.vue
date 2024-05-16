<template>
    <wwPageLoadProgress />
    <div :ww-page-id="page.id" class="website-wrapper">
        <!-- __WW_PAGE_MADE_WITH_WEWEB__ -->
        <div v-if="page && page.pageLoaded" class="sections-wrapper">
            <template v-for="(section, index) in sections" :key="section && section.uid">
                <!-- wwFront:start -->
                <div class="placeholder-section" :data-placeholder-section-uid="section.uid"></div>
                <LazyHydrate
                    :immediate="index < 2 || getForceHydration(section && section.uid)"
                    :target="getTarget(section)"
                    :disable-hydration="getDisableHydration(section)"
                >
                    <!-- wwFront:end -->
                    <wwSection
                        v-if="section"
                        :uid="section.uid"
                        :section-index="index"
                        :index="index"
                        :ww-responsive="`ww-section-${index}`"
                    />
                    <div v-else :style="{ backgroundColor: 'red', minHeight: '300px' }">EMPTY SECTION {{ index }}</div>
                    <!-- wwFront:start -->
                </LazyHydrate>
                <!-- wwFront:end -->
            </template>

         </div>
        <!-- POPUPS -->
        <transition name="ww-front-popups" tag="div">
            <wwLinkPopup
                v-if="activeLinkPopup"
                :content="activeLinkPopup.content"
                :background="activeLinkPopup.background"
                :section-id="activeLinkPopup.sectionId"
            />
        </transition>
    </div>
</template>

<script>
import { computed } from 'vue';
import { mapGetters, useStore } from 'vuex';
import { getComponentConfiguration } from '@/_common/helpers/component/component';
import wwPageLoadProgress from '@/_front/components/wwPageLoadProgress';
import { getBackgroundStyle } from '@/_front/helpers/wwBackgroungStyle';

/* wwFront:start */
import { useHead } from '@vueuse/head';
/* wwFront:end */

 
export default {
    components: {
        wwPageLoadProgress,
    },
    setup() {
        const store = useStore();
        const page = computed(() => store.getters['websiteData/getPage'] || { id: null, meta: {} });
        const designInfo = computed(() => store.getters['websiteData/getDesignInfo'] || {});

        /* wwFront:start */
        const langs = computed(() => {
            return (designInfo.value && designInfo.value.langs) || [{ lang: 'en', default: true }];
        });
        const defaultLang = computed(() => langs.value.find(({ default: isDefault }) => isDefault) || {});
        const homePage = computed(
            () => store.getters['websiteData/getPageById'](designInfo.value.homePageId) || { id: null, meta: {} }
        );

        const isHomepage = computed(() => {
            if (!page.value) return;
            const homepageId = designInfo.value && designInfo.value.homePageId;
            return page.value.id === homepageId;
        });

        const langLinks = computed(() => {
            if (!page.value || !page.value.langs) return [];
            const langLinks = [];
            for (const lang of page.value.langs) {
                const usePrefix = lang !== defaultLang.value.lang || defaultLang.value.isDefaultPath;
                let currentRoute = usePrefix ? `/${lang}/` : '/';
                if (!isHomepage.value) {
                    currentRoute = `${currentRoute}${currentRoute.endsWith('/') ? '' : '/'}${
                        page.value.paths[lang] || page.value.paths.default
                    }`;
                }

                langLinks.push({
                    rel: 'alternate',
                    hreflang: lang,
                    href: currentRoute,
                });

                if (lang === defaultLang.value.lang) {
                    langLinks.push({
                        rel: 'alternate',
                        hreflang: 'x-default',
                        href: currentRoute,
                    });
                }
            }

            return langLinks;
        });

        useHead({
            // eslint-disable-next-line no-undef
            title: computed(() => wwLib.wwLang.getText(page.value.title) || wwLib.wwLang.getText(homePage.value.title)),
            htmlAttrs: {
                lang: wwLib.wwLang.lang,
                amp: false,
            },
            meta: [
                // eslint-disable-next-line no-undef
                {
                    name: 'robots',
                    content:
                        window.location.host.indexOf('.weweb-preview') !== -1 || page.value.hideFromSitemap
                            ? 'noindex, nofollow'
                            : 'index, follow',
                },
                // eslint-disable-next-line no-undef
                {
                    name: 'title',
                    content: computed(
                        () => wwLib.wwLang.getText(page.value.title) || wwLib.wwLang.getText(homePage.value.title)
                    ),
                },
                // eslint-disable-next-line no-undef
                {
                    name: 'description',
                    content: computed(
                        () =>
                            wwLib.wwLang.getText((page.value.meta || {}).desc) ||
                            wwLib.wwLang.getText((homePage.value.meta || {}).desc)
                    ),
                },
                // eslint-disable-next-line no-undef
                {
                    name: 'keywords',
                    content: computed(
                        () =>
                            wwLib.wwLang.getText((page.value.meta || {}).keywords) ||
                            wwLib.wwLang.getText((homePage.value.meta || {}).keywords)
                    ),
                },
                // eslint-disable-next-line no-undef
                {
                    name: 'image',
                    content: computed(() => page.value.metaImage || homePage.value.metaImage),
                },
                // eslint-disable-next-line no-undef
                {
                    itemprop: 'name',
                    content: computed(
                        () => wwLib.wwLang.getText(page.value.title) || wwLib.wwLang.getText(homePage.value.title)
                    ),
                },
                // eslint-disable-next-line no-undef
                {
                    itemprop: 'description',
                    content: computed(
                        () =>
                            wwLib.wwLang.getText((page.value.meta || {}).desc) ||
                            wwLib.wwLang.getText((homePage.value.meta || {}).desc)
                    ),
                },
                // eslint-disable-next-line no-undef
                { itemprop: 'image', content: computed(() => page.value.metaImage || homePage.value.metaImage) },
                // eslint-disable-next-line no-undef
                {
                    name: 'twitter:card',
                    content: 'summary',
                },
                // eslint-disable-next-line no-undef
                {
                    name: 'twitter:title',
                    content: computed(
                        () =>
                            wwLib.wwLang.getText((page.value.meta || {}).socialTitle) ||
                            wwLib.wwLang.getText(page.value.title) ||
                            wwLib.wwLang.getText((homePage.value.meta || {}).socialTitle) ||
                            wwLib.wwLang.getText(homePage.value.title)
                    ),
                },
                // eslint-disable-next-line no-undef
                {
                    name: 'twitter:description',
                    // eslint-disable-next-line no-undef
                    content: computed(
                        () =>
                            wwLib.wwLang.getText((page.value.meta || {}).socialDesc) ||
                            wwLib.wwLang.getText((page.value.meta || {}).desc) ||
                            wwLib.wwLang.getText((homePage.value.meta || {}).socialDesc) ||
                            wwLib.wwLang.getText((homePage.value.meta || {}).desc)
                    ),
                },
                // eslint-disable-next-line no-undef
                {
                    property: 'twitter:image',
                    content: computed(() => page.value.metaImage || homePage.value.metaImage),
                },
                // eslint-disable-next-line no-undef
                {
                    property: 'og:title',
                    content: computed(
                        () =>
                            wwLib.wwLang.getText((page.value.meta || {}).socialTitle) ||
                            wwLib.wwLang.getText(page.value.title) ||
                            wwLib.wwLang.getText((homePage.value.meta || {}).socialTitle) ||
                            wwLib.wwLang.getText(homePage.value.title)
                    ),
                },
                // eslint-disable-next-line no-undef
                {
                    property: 'og:description',
                    // eslint-disable-next-line no-undef
                    content: computed(
                        () =>
                            wwLib.wwLang.getText((page.value.meta || {}).socialDesc) ||
                            wwLib.wwLang.getText((page.value.meta || {}).desc) ||
                            wwLib.wwLang.getText((homePage.value.meta || {}).socialDesc) ||
                            wwLib.wwLang.getText((homePage.value.meta || {}).desc)
                    ),
                },
                // eslint-disable-next-line no-undef
                { property: 'og:image', content: computed(() => page.value.metaImage || homePage.value.metaImage) },
                // eslint-disable-next-line no-undef
                {
                    property: 'og:site_name',
                    content: computed(
                        () => wwLib.wwLang.getText(page.value.title) || wwLib.wwLang.getText(homePage.value.title)
                    ),
                },
            ],
            link: computed(() => [
                { rel: 'icon', href: page.value.favicon || homePage.value.favicon },
                ...langLinks.value,
            ]),
            // eslint-disable-next-line no-undef
            script: [],
        });
        /* wwFront:end */
        return {
            designInfo,
            page,
            sections: computed(() => page.value.sections || []),
            mousePosition: {
                x: 0,
                y: 0,
            },
         };
    },
    data() {
        return {
         };
    },
    computed: {
        ...mapGetters({
            designInfo: 'websiteData/getDesignInfo',
            activeLinkPopup: 'front/getActiveLinkPopup',
            screen: 'front/getScreenSize',
            theme: 'front/getTheme',
         }),
        background() {
            return getBackgroundStyle(this.designInfo.background);
        },
    },
    watch: {
        activeLinkPopup() {
            if (this.activeLinkPopup) {
                document.querySelector('html').classList.add('ww-link-popup-open');
            } else {
                document.querySelector('html').classList.remove('ww-link-popup-open');
            }
        },
         theme() {
            this.setTheme();
        },
        background() {
            this.setBackground();
        },
    },
    mounted() {
         this.setTheme();
        this.setBackground();
    },
     methods: {
        setTheme() {
            if (this.theme === 'dark') {
                wwLib.getFrontDocument().documentElement.classList.add('ww-app-theme-dark');
            } else {
                wwLib.getFrontDocument().documentElement.classList.remove('ww-app-theme-dark');
            }
        },
        setBackground() {
            wwLib.getFrontDocument().documentElement.style.background = this.background;
        },
        getTarget(section) {
            return `[data-placeholder-section-uid="${section.uid}"],[data-section-uid="${section.uid}"]`;
        },
        getDisableHydration(section) {
             // eslint-disable-next-line no-unreachable
            if (window.__WW_IS_PRERENDER__ || this.designInfo.prerenderDisabled) return false;
            const state = wwLib.$store.getters['websiteData/getSectionState'](section.uid);
            return state.hydrate === false ? true : false;
        },
        getForceHydration(uid) {
            if (this.designInfo.prerenderDisabled) return true;
            const configuration = getComponentConfiguration('section', uid);
            return configuration && configuration.options && configuration.options.forceHydration;
        },
     },
};
</script>

<style lang="scss">
html {
    overflow-x: hidden;
    width: 100%;

    &.ww-link-popup-open {
        overflow-y: hidden;
    }
}
 </style>

<style scoped lang="scss">
.made-with-weweb {
    position: fixed;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    z-index: 9999999999;
    color: #1e2324;
    background: #ffffff;
    border: 1px solid #f4f7f7;
    box-shadow: 0px 2px 4px #00000069;
    border-radius: 2px;
    padding: 4px 6px;
    transition: all 0.3s ease;

    &:hover {
        color: #ffffff;
        background: #099af2;
        border-color: #099af2;
    }
}

.website-wrapper {
    height: 100%;
    // will-change: transform;
    .placeholder-section {
        opacity: 0;
        height: 0;
        width: 0;
        overflow: hidden;
        pointer-events: none;
    }

    .sections-wrapper {
        position: relative;
        isolation: isolate;
     }
}
.ww-front-popups-enter-active,
.ww-front-popups-leave-active {
    transition: all 0.3s;
}
.ww-front-popups-enter-from, .ww-front-popups-leave-to /* .list-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: scale(0.95);
}
</style>
