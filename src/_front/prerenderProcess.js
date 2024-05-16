export default {
    waitElementUpdates: async function () {
        await new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 10000);
        });
    },
    getPageCSS: async function () {
        await window.prerenderProcess.waitElementUpdates();

        console.log('waitElementUpdates OK');

        return await window.prerenderProcess.extractInlineStyle();
    },
    getClassName(element) {
        let parentObject = element.closest('[data-ww-uid]');

        let className;
        if (parentObject) {
            if (parentObject.attributes['data-ww-uid']?.value) {
                const splited = parentObject.attributes['data-ww-uid'].value.split('-');
                const troncatedUid = splited[splited.length - 1];
                let repeatIndex;
                if (
                    parentObject.attributes['data-ww-repeat-index']?.value &&
                    !isNaN(parentObject.attributes['data-ww-repeat-index'].value)
                )
                    repeatIndex = parentObject.attributes['data-ww-repeat-index'].value;
                let libraryComponentUid;
                if (parentObject.attributes['data-ww-comp-uid']?.value) {
                    const _splitted = parentObject.attributes['data-ww-comp-uid'].value.split('-');
                    libraryComponentUid = _splitted[_splitted.length - 1];
                }
                className = `ww-style-${troncatedUid}-${element.attributes['ww-responsive'].value}${
                    libraryComponentUid ? `-${libraryComponentUid}` : ''
                }${repeatIndex ? `-${repeatIndex}` : ''}`;
            }
        } else {
            parentObject = element.closest('[data-section-uid]');
            if (parentObject.attributes['data-section-uid']?.value) {
                const splited = parentObject.attributes['data-section-uid'].value.split('-');
                const troncatedUid = splited[splited.length - 1];
                className = `ww-style-${troncatedUid}-${element.attributes['ww-responsive'].value}`;
            }
        }

        return className;
    },
    extractInlineStyle: async function () {
        console.log('extractInlineStyle');
        const wwResponsives = document.querySelectorAll('[ww-responsive]');
        let style = {};
        for (const wwResponsive of wwResponsives) {
            const className = window.prerenderProcess.getClassName(wwResponsive);

            const regexPropValue = /([^:]*):(.*)/;
            if (className) {
                let dataVattr = 'data-v-unknown';
                for (const attr of wwResponsive.attributes) {
                    if (attr.name && attr.name.startsWith('data-v-')) {
                        dataVattr = attr.name;
                        break;
                    }
                }
                if (wwResponsive.style) {
                    style[`${className}[ww-responsive][${dataVattr}]`] = wwResponsive.style.cssText
                        .split(';')
                        .reduce((style, declaration) => {
                            const match = declaration.match(regexPropValue);

                            if (match && match.length >= 3) {
                                const prop = match[1];
                                const value = match[2];
                                if (prop && value) {
                                    style[prop] = value;
                                }
                            }
                            return style;
                        }, {});
                }
            }
        }

        await new Promise(resolve => {
            setTimeout(resolve, 3000);
        });

        console.log('extractInlineStyle DONE');
        return style;
    },
    generateCss: function (styles, screenSize) {
        let css = '';

        const media = this.screenSizes[screenSize].query ? `@media (${this.screenSizes[screenSize].query})` : '';

        let style = '';
        for (const className in styles) {
            const classStyle = Object.keys(styles[className])
                .map(prop => `${prop}:${styles[className][prop]}`)
                .join(';');

            if (classStyle) {
                style += `.${className}{${classStyle}}`;
            }
        }

        if (style) {
            if (media) {
                css += `${media}{${style}}`;
            } else {
                css += `${style}`;
            }
        }

        return css;
    },
    addCss: function (styles, screenSize) {
        const css = window.prerenderProcess.generateCss(styles, screenSize);
        const headCss = document.createElement('style');
        headCss.setAttribute('generated-css', screenSize);
        headCss.setAttribute('generated-media', this.screenSizes[screenSize].queryCss);
        headCss.innerText = css;
        document.head.append(headCss);
    },
    screenSize: null,
    screenSizes: {
        default: {
            order: 0,
            icon: 'move',
            query: null,
            queryCss: '(min-width: 992px)',
            defaultWidth: null,
            defaultHeight: null,
            prerenderWidth: 1920,
            prerenderHeight: 1080,
        },
        tablet: {
            order: 1,
            icon: 'tablet',
            query: 'max-width: 991px',
            queryCss: '(min-width: 768px) and (max-width: 991px)',
            defaultWidth: 770,
            defaultHeight: (770 * 14) / 9,
            prerenderWidth: 991,
            prerenderHeight: Math.round((991 * 14) / 9),
        },
        mobile: {
            order: 2,
            icon: 'mobile',
            query: 'max-width: 767px',
            queryCss: '(max-width: 767px)',
            defaultWidth: 400,
            defaultHeight: (400 * 13) / 9,
            prerenderWidth: 767,
            prerenderHeight: Math.round((767 * 13) / 9),
        },
    },
    start: async function (screenSize) {
        if (`${process.env.VUE_APP_PRERENDER_DISABLED}` !== 'true') {
            window.prerenderProcess.screenSize = screenSize;

            const styles = await window.prerenderProcess.getPageCSS();
            window.prerenderProcess.addCss(styles, screenSize);
        } else {
            const headCss = document.createElement('style');
            headCss.setAttribute('generated-css', screenSize);
            headCss.setAttribute('generated-media', this.screenSizes[screenSize].queryCss);
            headCss.innerText = '';
            document.head.append(headCss);
        }
    },
    finalize: async function () {
        if (`${process.env.VUE_APP_PRERENDER_DISABLED}` !== 'true') {
            const rootNode = window.$rootNode;

            function insertBefore(parentElement, targetElement, element) {
                parentElement.insertBefore(element, targetElement);
            }
            function insertAfter(parentElement, targetElement, element) {
                if (!parentElement.children || !parentElement.children.length) {
                    parentElement.append(element);
                } else if (parentElement.children[parentElement.children.length - 1] === targetElement) {
                    parentElement.append(element);
                } else {
                    parentElement.insertBefore(element, targetElement.nextSibling);
                }
            }

            // j'ai passé des heures à faire ça alors je vais pas non plus t'expliquer, tu te débrouilles.
            // (Peut etre que Flo s'en souvient, demande lui.)
            function addFragmentNode(node) {
                let vnode = node;
                if (!vnode) return;

                if (vnode.type && vnode.type.toString().startsWith('Symbol') && vnode.el) {
                    const parentElement = vnode.el.parentElement;
                    const openFragmentElement = document.createComment('[');
                    const closeFragmentElement = document.createComment(']');

                    if (vnode.anchor) {
                        insertBefore(parentElement, vnode.el, openFragmentElement);
                        insertAfter(parentElement, vnode.anchor, closeFragmentElement);
                    }
                }

                if (vnode.children && Array.isArray(vnode.children)) {
                    for (const child of vnode.children) {
                        addFragmentNode(child);
                    }
                } else if (vnode.component && vnode.component.subTree) {
                    addFragmentNode(vnode.component.subTree);
                }
            }

            addFragmentNode(rootNode._.subTree);

            const wwResponsives = document.querySelectorAll('[ww-responsive]');
            for (const wwResponsive of wwResponsives) {
                wwResponsive.style.cssText = '';
                const className = window.prerenderProcess.getClassName(wwResponsive);
                wwResponsive.classList.add(className);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    },
};
