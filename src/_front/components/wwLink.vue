<script>
import { mapGetters } from 'vuex';
import { h, Comment, inject, resolveComponent } from 'vue';

export default {
    name: 'wwLink',
    props: {
        wwLink: { type: [Object, String, Number], default: undefined },
        disabled: { type: Boolean, default: false },
        pageIndex: { type: [Number, String], default: 0 },
        insideText: { type: Boolean, default: false },
    },
    emits: ['linkActive'],
    setup() {
        const sectionId = inject('sectionId');
        return {
            sectionId,
        };
    },
    computed: {
        ...mapGetters({
            page: 'websiteData/getPage',
            pageCollectionIndex: 'data/getPageCollectionIndex',
        }),
        tag() {
            if (this.link.type === 'none') return 'span';
            if (this.link.type === 'open-popup' || this.link.type === 'close-popup') return 'div';
             // eslint-disable-next-line no-unreachable
            if (this.link.type === 'internal' || this.link.type === 'collection') return 'router-link';
            else return 'a';
        },
        isOnSamePage() {
            /* wwFront:start */
            if (this.link.href) {
                let linkUrl, location;
                linkUrl = this.link.href;
                if (linkUrl.endsWith('/')) linkUrl = linkUrl.slice(0, -1);
                if (linkUrl.startsWith('https://')) {
                    linkUrl = linkUrl.replace('https://', '');
                }
                if (linkUrl.startsWith('http://')) {
                    linkUrl = linkUrl.replace('http://', '');
                }
                location = decodeURI(this.$route.path);
                if (location.endsWith('/')) location = location.slice(0, -1);

                return linkUrl === location;
            } else {
                return false;
            }
            /* wwFront:end */
         },
        useJS() {
            return this.tag !== 'router-link' && this.tag !== 'a';
        },
         link() {
            //NO LINK
            if (!this.wwLink || this.disabled || this.wwLink.type === 'none') {
                return { type: 'none' };
            }

            //OPEN / CLOSE POPUP
            if (this.wwLink.type === 'open-popup' || this.wwLink.type === 'close-popup') {
                return { type: this.wwLink.type, content: this.wwLink.content, background: this.wwLink.background };
            }

            const link = { type: this.wwLink.type };

            //TARGET
            if (this.wwLink.targetBlank || this.wwLink.type === 'file') link.target = '_blank';

            //DOWNLOAD
            if (this.wwLink.type === 'file') {
                if (!this.wwLink.file || typeof this.wwLink.file === 'string') {
                    link.download = true;
                } else {
                    link.download = this.wwLink.file.name;
                }
            }

            //QUERY
            if (this.wwLink.query) link.query = this.wwLink.query;

            //HREF
            switch (this.wwLink.type) {
                case 'internal':
                case 'collection': {
                    const variables = Object.values(
                        this.$store.getters['data/getPageParameterVariablesFromId'](this.wwLink.pageId)
                    );
                     /* wwFront:start */
                    if (!this.wwLink.pageId) link.href = '';
                    else {
                        const pageId = `${this.wwLink.pageId}${
                            this.wwLink.type === 'collection' ? `_${this.pageIndex}` : ''
                        }`;
                        const page =
                            this.$store.getters['websiteData/getPageById'](pageId) ||
                            this.$store.getters['websiteData/getPageByLinkId'](pageId);
                        if (!page) return { type: 'none' };
                        link.href = wwLib.wwPageHelper.getPagePath(page.id);
                        link.pageId = page.id;
                        for (const variable of variables) {
                            link.href = link.href.replace(
                                `{{${variable.id}|${variable.defaultValue || ''}}}`,
                                this.wwLink.parameters?.[variable.id]
                            );
                        }
                    }
                    /* wwFront:end */
                    break;
                }
                case 'file':
                    if (!this.wwLink.file || typeof this.wwLink.file === 'string') {
                        link.href = this.wwLink.file || 'download';
                    } else {
                        link.href = this.wwLink.file.url;
                    }
                    break;
                case 'mail':
                    link.href = `mailto:${this.wwLink.href}`;
                    break;
                case 'tel':
                    link.href = `tel:${this.wwLink.href}`;
                    break;
                default:
                    link.href = this.wwLink.href;

                    if (typeof link.href !== 'string') {
                        wwLib.wwLog.error('Link href is not a string', link.href);
                        break;
                    }

                    /* wwFront:start */
                    if (link.href && link.href.startsWith('/')) {
                        link.type = 'internal';
                    }
                    /* wwFront:end */
                    break;
            }

            //HASHTAG
            if (this.wwLink.sectionId && this.wwLink.pageId) {
                link.sectionId = this.wwLink.sectionId;
                const page =
                    this.$store.getters['websiteData/getPageById'](this.wwLink.pageId) ||
                    this.$store.getters['websiteData/getPageByLinkId'](this.wwLink.pageId);
                if (page && page.sections) {
                    const _section = page.sections.find(
                        ({ uid, linkId }) => uid === this.wwLink.sectionId || linkId === this.wwLink.sectionId
                    );
                    if (_section) {
                        link.sectionId = _section.uid;
                        link.hash = `${wwLib.wwUtils.sanitize(_section.sectionTitle)}`;
                    }
                }
            }

            //PAGE LOAD PROGRESS
            if (this.wwLink.loadProgress) {
                link.loadProgress = true;
                link.loadProgressColor = this.wwLink.loadProgressColor || 'blue';
            }

            return link;
        },
    },
    watch: {
        isOnSamePage: {
            handler(value) {
                this.$emit('linkActive', value);
            },
            immediate: true,
        },
    },
    methods: {
        closePopup(event) {
            event.stopPropagation();

            // eslint-disable-next-line vue/custom-event-name-casing
            wwLib.$emit('wwLink:closePopup');
            wwLib.$store.dispatch('front/closeActiveLinkPopup', null);
        },
        openPopup(event) {
            event.stopPropagation();

            wwLib.$store.dispatch('front/setActiveLinkPopup', {
                content: this.link.content,
                background: this.link.background,
                sectionId: this.sectionId,
            });
        },
        navigate(event, attributes) {
            // eslint-disable-next-line vue/custom-event-name-casing
            wwLib.$emit('wwLink:clicked');
            event.stopPropagation();

            //NO NAVIGATION NEEDED
            if (this.isOnSamePage && !attributes.target) {
                //SCROLL TO SECTION
                if (this.link.sectionId) {
                    const _section = this.$store.getters['websiteData/getPage'].sections.find(
                        ({ uid, linkId }) => uid === this.link.sectionId || linkId === this.link.sectionId
                    );

                    if (_section) {
                        const section = this.$store.getters['websiteData/getSection'](_section.uid);
                        wwLib.wwUtils.scrollIntoView(
                            wwLib.getFrontDocument().querySelector(`[data-section-uid="${section.uid}"]`)
                        );
                    } else {
                        wwLib.getFrontWindow().scroll({
                            top: 0,
                            left: 0,
                            behavior: 'smooth',
                        });
                    }
                }
                return;
            }

             /* wwFront:start */
            if (attributes.target) {
                window.open(attributes.href).focus();
            } else {
                if (this.link.type === 'internal') {
                    wwLib.getFrontRouter().push(attributes.href);
                } else {
                    window.location = attributes.href;
                }
            }
            /* wwFront:end */
        },
    },
    render() {
        //NO LINK
        if (this.link.type === 'none') {
            const children = this.$slots.default ? this.$slots.default() : [];
            return children.find(({ type }) => type !== Comment) || children[0] || [];
        }

        let className = 'ww-link';
        let attributes = {};
        let listeners = {};

        if (this.insideText) {
            className += ' -in-text';
        }

        switch (this.link.type) {
            case 'close-popup':
                className += ' -cursor';
                listeners.onClick = this.closePopup;
                break;
            case 'open-popup':
                className += ' -cursor';
                listeners.onClick = this.openPopup;
                break;
            default: {
                // eslint-disable-next-line no-case-declarations
                const _attributes = {};

                //HREF
                _attributes.href = this.link.href;
                if (
                    (this.link.type === 'internal' || this.link.type === 'collection') &&
                    !(_attributes.href || '').endsWith('/')
                ) {
                    _attributes.href = `${_attributes.href}/`;
                }

                //QUERY
                if (this.link.query && this.link.query.length) {
                    const query = this.link.query
                        .map(({ name, value }) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
                        .join('&');
                    _attributes.href = `${_attributes.href}${_attributes.href.indexOf('?') !== -1 ? '&' : '?'}${query}`;
                }

                //HASHTAG
                if (this.link.hash) _attributes.href = `${_attributes.href}#${this.link.hash}`;

                //TO
                _attributes.to = _attributes.href;

                //TARGET
                if (this.link.target) _attributes.target = this.link.target;

                //DOWNLOAD
                if (this.link.download) _attributes.download = this.link.download;

                className += ' -cursor';

                //NAVIGATE
                const scrollToSection = this.isOnSamePage && this.link.hash && this.link.target !== '_blank';

                if (this.useJS || scrollToSection) {
                    listeners.onClick = event => {
                        if (this.link.loadProgress && !this.isOnSamePage)
                            wwLib.$store.dispatch('front/showPageLoadProgress', { color: this.link.loadProgressColor });
                        this.navigate(event, _attributes);
                    };
                } else {
                    listeners.onClick = event => {
                        // eslint-disable-next-line vue/custom-event-name-casing
                        wwLib.$emit('wwLink:clicked');
                        if (this.link.loadProgress && !this.isOnSamePage)
                            wwLib.$store.dispatch('front/showPageLoadProgress', { color: this.link.loadProgressColor });

                        event.stopPropagation();
                    };
                }

                attributes = _attributes;
                break;
            }
        }

        //RENDER LINK
        return h(
            this.tag === 'router-link' ? resolveComponent('router-link') : this.tag,
            { class: className, ...attributes, ...listeners },
            this.$slots.default ? this.$slots.default() : []
        );
    },
};
</script>

<style lang="scss">
.ww-link {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    display: block;

    &.-in-text {
        width: unset;
        height: unset;
        display: inline-block;
        text-decoration: inherit;
    }

    &.-btn {
        font-family: inherit;
        font-size: 100%;
        margin: 0;
        overflow: visible;
        text-transform: none;
        padding: 0;
        outline: none;
        border: none;
        background-color: inherit;
        cursor: pointer !important;
    }
    &.-cursor {
        cursor: pointer !important;

        & * {
            cursor: pointer !important;
        }
    }
}
</style>
