export default {
    editor: {
        label: 'Input Verification Code',
        icon: 'number',
        bubble: { icon: 'number' },
    },
    triggerEvents: [
        { name: 'change', label: { en: 'On change' }, event: { value: '' }, default: true },
        { name: 'initValueChange', label: { en: 'On init value change' }, event: { value: '' } },
        { name: 'complete', label: { en: 'On complete' }, event: { value: '' } },
    ],
    properties: {
        input: {
            defaultValue: { isWwObject: true, type: 'aeb78b9a-6fb6-4c49-931d-faedcfad67ba' },
            hidden: true,
        },
        nbrOfCode: {
            label: 'Number of code',
            type: 'Number',
            section: 'settings',
            defaultValue: 6,
            bindable: true,
        },
    },
};
