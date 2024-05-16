 
export default {
    async init() {
        /* wwFront:start */
        const designInfo = wwLib.getFrontWindow().wwg_designInfo;
        await wwLib.$store.dispatch('websiteData/setFullDesign', designInfo);
        const classes = wwLib.getFrontWindow().wwg_classes;
        await wwLib.$store.dispatch('libraries/setClasses', classes);
        /* wwFront:end */
     },

    getWebsiteName() {
        return wwLib.$store.getters['websiteData/getDesignInfo'].name;
    },

    async fetchPage(pageId, path) {
 
        // eslint-disable-next-line vue/custom-event-name-casing
        wwLib.$emit('wwPage:open', {
            page: _.cloneDeep(wwLib.wwWebsiteData.getCurrentPage()),
        });
        wwLib.logStore.verbose(`Loading page: _wwPage(${pageId})...`);

 
        await wwLib.wwWebsiteData.fetchData(pageId, path);
        /* wwFront:start */
        await wwLib.$store.dispatch('websiteData/setPageId', pageId);
        /* wwFront:end */

        wwLib.logStore.verbose('Page loaded');
    },

 
    async fetchData(pageId, path) {
        if (!pageId) return;

        let page;

        /* wwFront:start */
        try {
            const lang = window.location.pathname.startsWith(`/${wwLib.wwLang.lang}/`) ? wwLib.wwLang.lang : '';
            let url = `/public/data/${pageId.split('_')[0]}.json?wwlang=${lang}&_wwcv=${window.wwg_cacheVersion}`;
            if (path) url = `${url}&path=${path}`;
            const {
                data: {
                    cacheVersion,
                    page: pageData,
                    sections,
                    wwObjects,
                    collections,
                    variables,
                    formulas,
                    workflows,
                    libraryComponents,
                },
            } = await axios.get(url);

            //data.json contains a different cacheVersion
            //due to a publish before the navigation
            if (cacheVersion != window.wwg_cacheVersion) {
                throw { reloadUrl: true };
            }

            if (pageData.cmsDataSetPath) {
                url = `/public/data/${pageId}.json?wwlang=${lang}&_wwcv=${window.wwg_cacheVersion}`;
                if (path) url = `${url}&path=${path}`;
                const {
                    data: { page: pageIndexData },
                } = await axios.get(url);

                for (const key in pageIndexData) {
                    pageData[key] = pageIndexData[key];
                }
            }

            if (collections) {
                const promises = [];
                for (const collection of Object.values(collections).filter(
                    collection => collection.mode === 'static'
                )) {
                    if (!wwLib.$store.getters['data/getCollections'][collection.id])
                        promises.push(
                            axios
                                .get(`/public/collections/${collection.id}.json?_wwcv=${window.wwg_cacheVersion}`)
                                .then(({ data }) => (collection.data = data))
                                .catch(err => wwLib.wwLog.error(err))
                        );
                }
                await Promise.all(promises);
            }
            page = { page: pageData, sections, wwObjects };

            await wwLib.wwWebsiteData.setAllData({
                page,
                collections,
                variables,
                formulas,
                workflows,
                libraryComponents,
            });
        } catch (err) {
            throw { redirectUrl: err.response.data.redirectUrl };
        }
        /* wwFront:end */

 
        // eslint-disable-next-line vue/custom-event-name-casing
        wwLib.$emit('wwStore:dataLoaded');
    },

 
    /* wwFront:start */
    async setAllData(data) {
        await wwLib.$store.dispatch('websiteData/setAllData', data);
    },
    /* wwFront:end */

    getDesign() {
        return wwLib.$store.getters['websiteData/getDesign'] || null;
    },

    getInfo() {
        const design = this.getDesign();
        return design.info;
    },

    getPages() {
        const design = this.getDesign();
        return design.pages;
    },

    async getPage(pageId) {
        try {
            const result = await wwLib.$apollo.query({
                query: GET_PAGE,
                variables: {
                    designId: wwLib.$store.getters['websiteData/getDesignInfo'].id,
                    designVersionId: wwLib.$store.getters['websiteData/getDesignInfo'].designVersionId,
                    pageId: pageId,
                },
                fetchPolicy: 'no-cache',
            });
            return result.data.getPage;
        } catch (err) {
            wwLib.wwLog.error(err);
        }
    },

    async getPageInfo(pageId) {
        try {
            const result = await wwLib.$apollo.query({
                query: GET_PAGE_WITHOUT_WWOBJECTS,
                variables: {
                    designId: wwLib.$store.getters['websiteData/getDesignInfo'].id,
                    designVersionId: wwLib.$store.getters['websiteData/getDesignInfo'].designVersionId,
                    pageId: pageId,
                },
                fetchPolicy: 'no-cache',
            });
            return result.data.getPage;
        } catch (err) {
            wwLib.wwLog.error(err);
        }
    },

    getCurrentPage() {
        return wwLib.$store.getters['websiteData/getPage'];
    },

    getCurrentPageId() {
        return wwLib.$store.getters['websiteData/getPageId'];
    },

    getPageRoute(pageIdOrLinkId, allowHomePageId) {
        const pages = this.getPages();
        const info = this.getInfo();
        for (const page of pages) {
            if (page.linkId == pageIdOrLinkId || page.id == pageIdOrLinkId) {
                if (allowHomePageId && page.id == info.homePageId) {
                    return '';
                }
                return page.paths[wwLib.wwLang.lang];
            }
        }
        return '';
    },

    getPageId(pageRoute) {
        const pages = this.getPages();
        const info = this.getInfo();

        for (const page of pages) {
            if (page && page.paths[wwLib.wwLang.lang] === pageRoute) {
                return page.id;
            }
            if (pageRoute == '' && (page.linkId == info.homePageId || page.id == info.homePageId)) {
                return page.id;
            }
        }
        return -1;
    },

    getPageLinkId(pageRoute) {
        this.getDesign();
        const pages = this.getPages();
        const info = this.getInfo();
        for (const page of pages) {
            if (page.paths[wwLib.wwLang.lang] === pageRoute) {
                return page.linkId;
            }
            if (pageRoute == '' && (page.linkId == info.homePageId || page.id == info.homePageId)) {
                return page.linkId;
            }
        }
        return -1;
    },

    isWeweb() {
        var sites = ['weweb', 'wewebagency'];

        const info = this.getInfo();

        if (info && sites.indexOf(info.name) !== -1) {
            return true;
        }
        return false;
    },

    getNavbar() {
        return _.cloneDeep(this.getInfo().navbar || {});
    },

 };
