export default {
    options: {
        lazyHydrate: true,
        layout: ['flex', 'grid'],
    },
    inherit: {
        type: 'ww-layout',
    },
    editor: {
        label: {
            en: 'Flexbox',
        },
        icon: 'border',
        bubble: {
            icon: 'border',
        },
    },
    customStylePropertiesOrder: ['children'],
    properties: {
        children: {
            label: {
                en: 'Items',
                fr: 'Items',
            },
            type: 'Info',
            options: {
                text: { en: 'Elements to repeat' },
            },
            hidden: (content, sidePanelContent, boundProps, wwProps) => !!(wwProps && wwProps.isFixed),
            bindable: 'repeatable',
            defaultValue: [],
        },
    },
};
