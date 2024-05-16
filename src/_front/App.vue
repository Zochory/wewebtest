<template>
    <router-view />
</template>

<script>
import { reactive, computed, provide, onMounted } from 'vue';

 
export default {
    setup() {
        const wwFrontState = reactive({
            lang: computed(() => wwLib.$store.getters['front/getLang']),
            pageId: computed(() => wwLib.$store.getters['websiteData/getPageId']),
            screenSize: computed(() => wwLib.$store.getters['front/getScreenSize']),
            screenSizes: computed(() => wwLib.$store.getters['front/getScreenSizes']),
        });
        provide('wwFrontState', wwFrontState);

     },
    mounted() {
        if (window.__WW_IS_PRERENDER__) {
            window.$rootNode = this;
        }
    },
};
</script>
