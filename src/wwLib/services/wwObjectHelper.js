const VERSION = 3;

export default class wwObjectHelper {
    static get typeAliases() {
        return {
            'ww-text': 'd7904e9d-fc9a-4d80-9e32-728e097879ad',
            'ww-image': '3a7d6379-12d3-4387-98ff-b332bb492a63',
            'ww-button': '6f8796b1-8273-498d-95fc-7013b7c63214',
            'ww-icon': '83d890fb-84f9-4386-b459-fb4be89a8e15',
            'ww-checkbox': 'af811adf-94d9-49dd-ab22-e2f29ae30299',
            'ww-video': '1494761b-1d0c-4266-aba7-7f24f824978e',
            'ww-iframe': '6d692ca2-6cdc-4805-aa0c-211102f335d0',
            'ww-columns': '21881619-a984-4847-81a9-922c3dbb5853',
            'ww-container': '086d46a0-9232-4df3-8119-7d3c8779cb1a',
            'ww-flexbox': 'b783dc65-d528-4f74-8c14-e27c934c39b1',
            'ww-hover-dropdown': '0dc461bb-103e-4b2e-80e0-846ec3c30a6e',
            'ww-map': '3265984a-eb92-4d73-b702-dbd0e4d1472e',
            'ww-expand': '53401515-b694-4c79-a88d-abeecb1de562',
            'ww-tabs': 'fa33562c-495c-4d2e-bc8f-cf5ec449bf6e',
            'navigation-menu': 'fb3e0024-f017-4193-a6a1-bc2eed330d1d',
            'ww-form-container': '25edb26f-a365-4447-8de5-4964f9f7dc77',
            'ww-form-checkbox': 'ff42ffd0-0250-44c5-9f35-c027bcf4e3ce',
            'ww-form-input': 'aeb78b9a-6fb6-4c49-931d-faedcfad67ba',
            'ww-form-dropdown': 'b10e81a1-a2b7-4597-8625-60fe0b1722e1',
            'ww-form-radio': 'd121c5c2-ab40-420d-b5e4-c50537dfe647',
        };
    }

    static getDefault(type, content = {}, _state = {}, name) {
        type = this.typeAliases[type] || type;

        if (!content.default) content = { default: content };
        return {
            isWwObject: true,
            version: VERSION,
            type,
            content,
            name,
            _state,
            wwObjectBaseId: type,
        };
    }
    // TODO: signature will complety change as soon as we are sure non external code use it anymore
    static async create(type, content, _state, parentSectionId, keepChildren, parentLibraryComponentId) {
        return await wwObjectHelper.createFromTemplate(
            wwObjectHelper.getDefault(type, content, _state, _state && _state.name),
            parentSectionId,
            keepChildren,
            parentLibraryComponentId
        );
    }
    // TODO: signature will complety change as soon as we are sure non external code use it anymore
    static async createFromTemplate(wwObjectTemplate, parentSectionId, keepChildren, parentLibraryComponentId) {
        const type = wwObjectTemplate.type;

        if (type && !wwObjectTemplate.wwObjectBaseId) {
            wwObjectTemplate.wwObjectBaseId = this.typeAliases[type] || type;
        }

        if (type && (type === 'ww-button' || type === 'ww-text')) {
            if (wwObjectTemplate.content.default.text) {
                const content = { ...wwObjectTemplate.content.default };
                content['_ww-text_text'] = content.text;
                delete content.text;
                wwObjectTemplate.content.default = content;
            }
        }

        wwObjectTemplate.parentSectionId = parentSectionId;
        wwObjectTemplate.parentLibraryComponentId = parentLibraryComponentId;

        return await wwLib.$store.dispatch('websiteData/createWwObjectFromTemplate', {
            wwObjectTemplate,
            noHistory: true,
            keepChildren,
        });
    }
    static async createLibraryComponentInstance(libraryComponentBaseId) {
        return await wwLib.$store.dispatch('websiteData/createWwObjectFromTemplate', {
            wwObjectTemplate: {
                isWwObject: true,
                libraryComponentBaseId,
                content: {},
                _state: {},
            },
            noHistory: true,
        });
    }
    // TODO: signature will complety change as soon as we are sure non external code use it anymore
    static async cloneElement(uid, parentSectionId, name, parentLibraryComponentId) {
        const template = wwObjectHelper.convertToTemplate(uid);
        const newWwObjectId = await wwObjectHelper.createFromTemplate(
            { ...template, name },
            parentSectionId,
            false,
            parentLibraryComponentId
        );
        return { isWwObject: true, uid: newWwObjectId };
    }
    static convertToTemplate(uid) {
        return wwLib.$store.getters['websiteData/getFullWwObject'](uid, true);
    }
    static getWwObject(uid) {
        return wwLib.$store.getters['websiteData/getWwObject'](uid);
    }
}
