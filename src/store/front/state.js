export default {
    isPrerenderHydration: true,
    showPageLoadProgress: false,
    /*=============================================m_ÔÔ_m=============================================\
        LANG
    \================================================================================================*/
    lang: 'en',
    /*=============================================m_ÔÔ_m=============================================\
        SCREEN SIZE
    \================================================================================================*/
    screenSize: null,

    //TODO : When comming from publisher, also inject in prerenderProcess.js
    screenSizes: {
        default: {
            order: 0,
            label: {
                en: 'Desktop',
                fr: 'Ordinateur',
            },
            breakPoint: null,
            icon: 'monitor',
            query: null,
            defaultWidth: 1100,
            defaultHeight: (1100 * 9) / 16,
            prerenderWidth: 1920,
        },
        tablet: {
            order: 1,
            label: {
                en: 'Tablet',
                fr: 'Tablette',
            },
            breakPoint: 991,
            icon: 'tablet',
            query: 'max-width: 991px',
            defaultWidth: 770,
            defaultHeight: (770 * 14) / 9,
            prerenderWidth: 991,
        },
        mobile: {
            order: 2,
            label: {
                en: 'Mobile',
                fr: 'Mobile',
            },
            breakPoint: 767,
            icon: 'mobile',
            query: 'max-width: 767px',
            defaultWidth: 400,
            defaultHeight: (400 * 13) / 9,
            prerenderWidth: 767,
        },
    },
    isScreenSizeActive: {},
    theme: window.localStorage?.getItem('ww-app-theme') || undefined,
    /*=============================================m_ÔÔ_m=============================================\
        COMPONENTS CONFIG
    \================================================================================================*/
    /* wwFront:start */
    // eslint-disable-next-line no-undef
    componentConfigs: {'plugin-69d4a5bb-09a3-4f3d-a94e-667c21c057eb': { ...require('@/components/plugins/plugin-69d4a5bb-09a3-4f3d-a94e-667c21c057eb/ww-config.js').default, name: 'plugin-69d4a5bb-09a3-4f3d-a94e-667c21c057eb' },'plugin-f9ef41c3-1c53-4857-855b-f2f6a40b7186': { ...require('@/components/plugins/plugin-f9ef41c3-1c53-4857-855b-f2f6a40b7186/ww-config.js').default, name: 'plugin-f9ef41c3-1c53-4857-855b-f2f6a40b7186' },'plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa': { ...require('@/components/plugins/plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa/ww-config.js').default, name: 'plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa' },'plugin-97e7b1ae-f88a-4697-849c-ee56ab49bb48': { ...require('@/components/plugins/plugin-97e7b1ae-f88a-4697-849c-ee56ab49bb48/ww-config.js').default, name: 'plugin-97e7b1ae-f88a-4697-849c-ee56ab49bb48' },'plugin-2bd1c688-31c5-443e-ae25-59aa5b6431fb': { ...require('@/components/plugins/plugin-2bd1c688-31c5-443e-ae25-59aa5b6431fb/ww-config.js').default, name: 'plugin-2bd1c688-31c5-443e-ae25-59aa5b6431fb' },'wwobject-d7904e9d-fc9a-4d80-9e32-728e097879ad': { ...require('@/components/wwObjects/wwobject-d7904e9d-fc9a-4d80-9e32-728e097879ad/ww-config.js').default, name: 'wwobject-d7904e9d-fc9a-4d80-9e32-728e097879ad' },'wwobject-6f8796b1-8273-498d-95fc-7013b7c63214': { ...require('@/components/wwObjects/wwobject-6f8796b1-8273-498d-95fc-7013b7c63214/ww-config.js').default, name: 'wwobject-6f8796b1-8273-498d-95fc-7013b7c63214' },'wwobject-83d890fb-84f9-4386-b459-fb4be89a8e15': { ...require('@/components/wwObjects/wwobject-83d890fb-84f9-4386-b459-fb4be89a8e15/ww-config.js').default, name: 'wwobject-83d890fb-84f9-4386-b459-fb4be89a8e15' },'wwobject-aeb78b9a-6fb6-4c49-931d-faedcfad67ba': { ...require('@/components/wwObjects/wwobject-aeb78b9a-6fb6-4c49-931d-faedcfad67ba/ww-config.js').default, name: 'wwobject-aeb78b9a-6fb6-4c49-931d-faedcfad67ba' },'wwobject-b783dc65-d528-4f74-8c14-e27c934c39b1': { ...require('@/components/wwObjects/wwobject-b783dc65-d528-4f74-8c14-e27c934c39b1/ww-config.js').default, name: 'wwobject-b783dc65-d528-4f74-8c14-e27c934c39b1' },'wwobject-3a7d6379-12d3-4387-98ff-b332bb492a63': { ...require('@/components/wwObjects/wwobject-3a7d6379-12d3-4387-98ff-b332bb492a63/ww-config.js').default, name: 'wwobject-3a7d6379-12d3-4387-98ff-b332bb492a63' },'section-99586bd3-2b15-4d6b-a025-6a50d07ca845': { ...require('@/components/sectionBases/section-99586bd3-2b15-4d6b-a025-6a50d07ca845/ww-config.js').default, name: 'section-99586bd3-2b15-4d6b-a025-6a50d07ca845' },'section-ef0ecc71-9a59-4eab-94b0-b36d66d3d61d': { ...require('@/components/sectionBases/section-ef0ecc71-9a59-4eab-94b0-b36d66d3d61d/ww-config.js').default, name: 'section-ef0ecc71-9a59-4eab-94b0-b36d66d3d61d' },'wwobject-57831abf-83ad-49ad-ba97-3bd30b035710': { ...require('@/components/wwObjects/wwobject-57831abf-83ad-49ad-ba97-3bd30b035710/ww-config.js').default, name: 'wwobject-57831abf-83ad-49ad-ba97-3bd30b035710' },'wwobject-aa27b26f-0686-4c29-98c5-8217044045b7': { ...require('@/components/wwObjects/wwobject-aa27b26f-0686-4c29-98c5-8217044045b7/ww-config.js').default, name: 'wwobject-aa27b26f-0686-4c29-98c5-8217044045b7' },'wwobject-0dc461bb-103e-4b2e-80e0-846ec3c30a6e': { ...require('@/components/wwObjects/wwobject-0dc461bb-103e-4b2e-80e0-846ec3c30a6e/ww-config.js').default, name: 'wwobject-0dc461bb-103e-4b2e-80e0-846ec3c30a6e' },'wwobject-6d692ca2-6cdc-4805-aa0c-211102f335d0': { ...require('@/components/wwObjects/wwobject-6d692ca2-6cdc-4805-aa0c-211102f335d0/ww-config.js').default, name: 'wwobject-6d692ca2-6cdc-4805-aa0c-211102f335d0' },'wwobject-69d0b3ef-b265-494c-8cd1-874da4aa1834': { ...require('@/components/wwObjects/wwobject-69d0b3ef-b265-494c-8cd1-874da4aa1834/ww-config.js').default, name: 'wwobject-69d0b3ef-b265-494c-8cd1-874da4aa1834' },'wwobject-14723a21-0178-4d92-a7e9-d1dfeaec29a7': { ...require('@/components/wwObjects/wwobject-14723a21-0178-4d92-a7e9-d1dfeaec29a7/ww-config.js').default, name: 'wwobject-14723a21-0178-4d92-a7e9-d1dfeaec29a7' },'wwobject-21881619-a984-4847-81a9-922c3dbb5853': { ...require('@/components/wwObjects/wwobject-21881619-a984-4847-81a9-922c3dbb5853/ww-config.js').default, name: 'wwobject-21881619-a984-4847-81a9-922c3dbb5853' },'wwobject-0d3e75d1-9e77-44cb-a272-8b0825fbc5da': { ...require('@/components/wwObjects/wwobject-0d3e75d1-9e77-44cb-a272-8b0825fbc5da/ww-config.js').default, name: 'wwobject-0d3e75d1-9e77-44cb-a272-8b0825fbc5da' },'wwobject-1ba25bdf-dee9-4e0e-a0b8-b3f3128c3b65': { ...require('@/components/wwObjects/wwobject-1ba25bdf-dee9-4e0e-a0b8-b3f3128c3b65/ww-config.js').default, name: 'wwobject-1ba25bdf-dee9-4e0e-a0b8-b3f3128c3b65' },'wwobject-2d18ef4c-e9e5-4dc6-a29d-01d9f797be5e': { ...require('@/components/wwObjects/wwobject-2d18ef4c-e9e5-4dc6-a29d-01d9f797be5e/ww-config.js').default, name: 'wwobject-2d18ef4c-e9e5-4dc6-a29d-01d9f797be5e' },'wwobject-4ce97e36-71b1-48d5-b89d-ef045c0e939e': { ...require('@/components/wwObjects/wwobject-4ce97e36-71b1-48d5-b89d-ef045c0e939e/ww-config.js').default, name: 'wwobject-4ce97e36-71b1-48d5-b89d-ef045c0e939e' },'wwobject-53401515-b694-4c79-a88d-abeecb1de562': { ...require('@/components/wwObjects/wwobject-53401515-b694-4c79-a88d-abeecb1de562/ww-config.js').default, name: 'wwobject-53401515-b694-4c79-a88d-abeecb1de562' },'wwobject-6047b8df-81b7-45a7-a6b3-7355fb2fa3cd': { ...require('@/components/wwObjects/wwobject-6047b8df-81b7-45a7-a6b3-7355fb2fa3cd/ww-config.js').default, name: 'wwobject-6047b8df-81b7-45a7-a6b3-7355fb2fa3cd' },'wwobject-6ba133b6-a444-414f-93a5-25cd237dd398': { ...require('@/components/wwObjects/wwobject-6ba133b6-a444-414f-93a5-25cd237dd398/ww-config.js').default, name: 'wwobject-6ba133b6-a444-414f-93a5-25cd237dd398' },'wwobject-70a53858-53ca-40a5-ad88-c1cd33b5cc9f': { ...require('@/components/wwObjects/wwobject-70a53858-53ca-40a5-ad88-c1cd33b5cc9f/ww-config.js').default, name: 'wwobject-70a53858-53ca-40a5-ad88-c1cd33b5cc9f' },'wwobject-7179ba70-c5d7-49a5-9828-f85704fd1efc': { ...require('@/components/wwObjects/wwobject-7179ba70-c5d7-49a5-9828-f85704fd1efc/ww-config.js').default, name: 'wwobject-7179ba70-c5d7-49a5-9828-f85704fd1efc' },'wwobject-85044fa4-8fc0-4115-9eaf-ca30a1b4b528': { ...require('@/components/wwObjects/wwobject-85044fa4-8fc0-4115-9eaf-ca30a1b4b528/ww-config.js').default, name: 'wwobject-85044fa4-8fc0-4115-9eaf-ca30a1b4b528' },'wwobject-88ef76b6-46d5-4685-878f-2f1fa0d54cb8': { ...require('@/components/wwObjects/wwobject-88ef76b6-46d5-4685-878f-2f1fa0d54cb8/ww-config.js').default, name: 'wwobject-88ef76b6-46d5-4685-878f-2f1fa0d54cb8' },'wwobject-a4a2089f-b75d-4e26-9c99-0d67fb7bd3cd': { ...require('@/components/wwObjects/wwobject-a4a2089f-b75d-4e26-9c99-0d67fb7bd3cd/ww-config.js').default, name: 'wwobject-a4a2089f-b75d-4e26-9c99-0d67fb7bd3cd' },'wwobject-a6cb6a4d-6af7-4cd6-b530-a15d9ec64488': { ...require('@/components/wwObjects/wwobject-a6cb6a4d-6af7-4cd6-b530-a15d9ec64488/ww-config.js').default, name: 'wwobject-a6cb6a4d-6af7-4cd6-b530-a15d9ec64488' },'wwobject-af811adf-94d9-49dd-ab22-e2f29ae30299': { ...require('@/components/wwObjects/wwobject-af811adf-94d9-49dd-ab22-e2f29ae30299/ww-config.js').default, name: 'wwobject-af811adf-94d9-49dd-ab22-e2f29ae30299' },},
    /* wwFront:end */
     activeLinkPopup: null,
    elementStates: {},
};
