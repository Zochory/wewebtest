export default {
    defaultLang: 'en',

    get lang() {
        return wwLib.$store ? wwLib.$store.getters['front/getLang'] : this.defaultLang;
    },
    set lang(lang) {
        this.setLang(lang);
    },

    setLang(lang) {
        const pageLangs = wwLib.$store.getters['websiteData/getPage'].langs || [];
        if (!pageLangs.includes(lang)) {
            return false;
        }

        var oldLang = this.lang;

        wwLib.$store.dispatch('front/setLang', lang);

        // eslint-disable-next-line vue/custom-event-name-casing
        wwLib.$emit('wwLang:changed', {
            old: oldLang,
            new: this.lang,
        });

        return true;
    },

    getText(text) {
        if (text === undefined) {
            return '';
        }
        if (text === null || typeof text !== 'object') {
            return String(text);
        }
        if (text[this.lang] !== undefined) {
            return text[this.lang];
        }
        if (text[this.defaultLang] !== undefined) {
            return text[this.defaultLang];
        }
        if (Object.keys(text).length != 0) {
            return text[Object.keys(text)[0]] || '';
        }

        return '';
    },

    setText(obj, text, lang) {
        if (typeof obj !== 'object') {
            obj = {};
        }

        lang = lang || this.lang;

        obj[lang] = text;

        return obj;
    },

    getValue(value) {
        if (typeof value !== 'object') return value;
        return value[this.defaultLang] || value;
    },
};
