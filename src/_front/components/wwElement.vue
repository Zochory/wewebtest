<template>
    <wwLibraryComponent v-if="isLibraryComponent" :key="uid" :uid="uid" v-bind="$attrs"></wwLibraryComponent>
    <template v-else>
             <wwElementComponent :key="uid" ref="elementComponent" :uid="uid" v-bind="$attrs"></wwElementComponent>
     </template>
</template>

<script>
 import wwElementComponent from '@/_front/components/wwElementComponent';
import WwLibraryComponent from './wwLibraryComponent.vue';

export default {
    name: 'wwElement',
    components: {
         wwElementComponent,
        WwLibraryComponent,
    },
    inheritAttrs: false,
    props: {
        uid: { type: String, required: true },
    },
    computed: {
        componentRef() {
            if (this.$refs.elementComponent) {
                return this.$refs.elementComponent.$refs.component;
            } else {
                return null;
            }
        },
        isLibraryComponent() {
            return !!wwLib.$store.getters['websiteData/getWwObject'](this.uid)?.libraryComponentBaseId;
        },
    },
};
</script>
