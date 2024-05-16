import { v4 as uuid } from 'uuid';

function createScript(document, attributes = {}) {
    const scriptEl = document.createElement('script');
    Object.keys(attributes).forEach(attr => scriptEl.setAttribute(attr, attributes[attr]));
    return scriptEl;
}

export default {
    getUniqueId() {
        wwLib.wwLog.warn('--DEPECRATED-- function getUniqueId');
        var d = new Date();
        return Math.floor((d.getTime() * Math.random() + Math.random() * 10000 + Math.random() * 100) / 100);
    },

    getUid() {
        return uuid();
    },

    getLinkId() {
        return uuid();
    },

    convertColorToRGB(color) {
        const result = /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})*$/i.exec(color);
        if (result) {
            const a = result[4] ? parseInt(result[4], 16) / 255 : 1;
            const rgba =
                'rgba(' +
                parseInt(result[1], 16) +
                ',' +
                parseInt(result[2], 16) +
                ',' +
                parseInt(result[3], 16) +
                ',' +
                a +
                ')';
            return rgba;
        } else {
            return color;
        }
    },
    addScriptToHead(options, allowMultipleAdd = false) {
        options = options || {};
        if (!options.link) {
            return;
        }
        return new Promise(function (resolve, reject) {
            if (!options.link) {
                return resolve();
            }

            try {
                const scriptAlreadyInDom = wwLib.getFrontDocument().head.querySelector(`script[src="${options.link}"]`);

                // Get or create unique script id
                let uniqueId;
                if (scriptAlreadyInDom && !allowMultipleAdd) {
                    uniqueId = scriptAlreadyInDom.getAttribute('id');
                    return resolve();
                } else {
                    uniqueId = Math.floor(Math.random() * 1000000000);

                    let styleToAdd = createScript(wwLib.getFrontDocument(), {
                        id: uniqueId,
                        type: 'text/javascript',
                        src: options.link,
                        async: options.async,
                        charset: options.charset,
                        ...options.attributes,
                    });

                    styleToAdd.onload = function () {
                        wwLib.$emit('wwUtils:newStyle-' + uniqueId);
                        return resolve();
                    };
                    styleToAdd.onerror = function () {
                        return reject();
                    };
                    wwLib.getFrontDocument().head.appendChild(styleToAdd);

                 }
            } catch (e) {
                return reject(e);
            }
        });
    },
    cssValuePrefix: null,
    getCssValuePrefix() {
        if (this.cssValuePrefix) {
            return this.cssValuePrefix;
        }

        var rtrnVal = ''; //default to standard syntax
        var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];

        // Create a temporary DOM object for testing
        var dom = wwLib.getFrontDocument().createElement('div');

        for (var i = 0; i < prefixes.length; i++) {
            // Attempt to set the style
            dom.style.background = prefixes[i] + 'linear-gradient(#000000, #ffffff)';

            // Detect if the style was successfully set
            if (dom.style.background) {
                rtrnVal = prefixes[i];
            }
        }

        dom = null;

        return rtrnVal;
    },
    getWwObjectEl(id) {
        return wwLib.getFrontWindow().document.querySelector(`[data-ww-uid="${id}"]`);
    },
    changeUniqueIds(data) {
        // wwLib.wwLog.warn('-- DEPRECATED changeUniqueIds --');
        function changeUniqueIds(_data) {
            if (typeof _data === 'object') {
                if (_data && _data.uid && _data.content) {
                    _data.uid = wwLib.wwUtils.getUid();
                } else if (_data && _data.uid && _data.isWwObject) {
                    const wwo = wwLib.$store.getters['websiteData/getFullWwObject'](_data.uid);
                    for (let k in wwo) {
                        _data[k] = wwo[k];
                    }
                    delete _data.isWwObject;
                    _data.uid = wwLib.wwUtils.getUid();
                }

                for (let key in _data) {
                    _data[key] = changeUniqueIds(_data[key]);
                }
            }
            return _data;
        }

        const lala = changeUniqueIds(_.cloneDeep(data));

        return lala;
    },
    removeUid(obj) {
        if (obj && typeof obj === 'object') {
            if (obj.uid && obj.content) {
                obj.isWwObject = true;
                delete obj.uid;
            }

            for (const key in obj) {
                if (obj[key] && typeof obj[key] === 'object') {
                    wwLib.wwUtils.removeUid(obj[key]);
                }
            }
        }
    },
    isWwObject(wwObject) {
        if (!wwObject) {
            return false;
        }
        if (wwObject.isWwObject) {
            return true;
        }
        return wwObject && wwObject.uniqueId && wwObject.content && wwObject.content.type;
    },

    needsPolyfill() {
        return this.isIE() || this.iOSversion() <= 10;
    },

    isIE() {
        var ua = window.navigator.userAgent; //Check the userAgent property of the window.navigator object
        var msie = ua.indexOf('MSIE '); // IE 10 or older
        var trident = ua.indexOf('Trident/'); //IE 11

        return msie > 0 || trident > 0;
    },

    iOSversion() {
        if (/iP(hone|od|ad)/.test(window.navigator.platform)) {
            // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
            var v = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
            return parseInt(v[1], 10);
        }
    },

    isWindows() {
        return navigator.platform.indexOf('Win') > -1;
    },

    isMacintosh() {
        return navigator.platform.indexOf('Mac') > -1;
    },

    scrollIntoView(element, offset = 0) {
        const rect = element.getBoundingClientRect();

        wwLib
            .getFrontDocument()
            .querySelector('html')
            .scrollTo({
                left: 0,
                top: rect.top + wwLib.getFrontWindow().scrollY - offset,
                behavior: 'smooth',
            });
    },

    getLengthUnit(value, { defaultLength, defaultUnit, round = true } = {}) {
        if (typeof value !== 'string') {
            return [0, 'auto'];
        }

        value = value || '';

        if (typeof value !== 'string') {
            return [0, 'auto'];
        }

        if (value === 'auto') {
            return [0, 'auto'];
        }
        if (value === 'unset') {
            return [0, 'unset'];
        }
        if (value === 'normal') {
            return [0, 'normal'];
        }

        const LENGTH_REGEX = new RegExp(/^(-?[\d.]+)(.*)$/);
        let [, _l, _u] = value.match(LENGTH_REGEX) || [null, defaultLength || 0, defaultUnit || 'auto'];

        _u = _u || defaultUnit || 'auto';

        return [round ? Math.round(_l) : _l, _u];
    },

    sanitize(id) {
        if (!id || typeof id !== 'string') return '';
        return id.toLowerCase().replace(/\s/g, '_');
    },

 
    transformToTwicPics(url, prefix) {
        wwLib.wwLog.warn('--DEPECRATED-- function transformToTwicPics');
        if (url.indexOf('twic=v1') !== -1) {
            return url;
        }
        if (url.startsWith(process.env.VUE_APP_CDN_URL)) {
            url = url.replace(process.env.VUE_APP_CDN_URL, '');
        }

        if (url.startsWith('https://') || url.startsWith('http://')) {
            return url;
        }

        let baseUrl = `${wwLib.wwUtils.getTwicPicsPrefix(prefix)}${url}`;

        baseUrl += baseUrl.indexOf('?') === -1 ? '?' : '&';
        baseUrl += 'twic=v1';

        return baseUrl;
    },

    getImgCdnUrl(url) {
        if (url.includes(process.env.VUE_APP_CDN_URL)) {
            return url;
        }

        if (url.startsWith('https://') || url.startsWith('http://')) {
            return url;
        }

        return process.env.VUE_APP_CDN_URL + url;
    },

    getImgExtFromUrl(url) {
        return url.split('.')[url.split('.').length - 1].toLowerCase().split('?')[0];
    },

    convertImgExtToType(ext) {
        ext = ext || 'jpg';
        switch (ext) {
            case 'jpg':
                return 'image/jpeg';

            case 'svg':
                return 'image/svg+xml';

            default:
                return 'image/' + ext;
        }
    },

    getTwicPicsPrefix(prefix) {
        wwLib.wwLog.warn('--DEPECRATED-- function getTwicPicsPrefix');
        if (prefix && prefix !== 'weweb') return `${process.env.VUE_APP_TWICPICS_BASE}${prefix}`;
        return `${process.env.VUE_APP_TWICPICS_BASE}${process.env.VUE_APP_TWICPICS_FOLDER}`;
    },

    getTwicPicsFolder() {
        wwLib.wwLog.warn('--DEPECRATED-- function getTwicPicsFolder');
        return process.env.VUE_APP_TWICPICS_FOLDER;
    },

    getCdnPrefix() {
        return process.env.VUE_APP_CDN_URL;
    },

    formatBgImgUrl(imgUrl) {
        // Escape special chars https://stackoverflow.com/a/2168861
        return imgUrl.startsWith('url(') ? imgUrl : `url("${imgUrl.replace(/[()'"]/g, '\\$&')}")`;
    },

    isEmpty(value) {
        return (
            value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && JSON.stringify(value) === '{}')
        );
    },
};
