<template>
    <div
        v-if="!vueComponentName"
        data-is-ui
        :style="extraStyle"
        class="ww-object-loader__undef flex items-center label-sm ww-border-radius-02 w-100 p-3 truncate nowrap"
        @click.capture="tryRestore()"
    >
        <wwEditorIcon class="mr-2" name="warning"></wwEditorIcon>
        <div v-if="!loadingTryRestore">Element undefined (click for more info)</div>
        <div v-else>Restoring</div>
    </div>
    <div v-else-if="!isComponentReady" class="ww-object-loader">
        <wwEditorIcon name="download" />
    </div>
    <slot v-else></slot>
</template>

<script>
 
import { computed, inject } from 'vue';
import { getComponentVueComponentName } from '@/_common/helpers/component/component';

export default {
    props: {
        uid: { type: String, required: true },
        type: { type: String, required: true },
        extraStyle: { type: String, default: '' },
    },
    setup(props) {
        const sectionId = inject('sectionId');
        const vueComponentName = computed(() => getComponentVueComponentName(props.type, props.uid));
        const isComponentRegistered = computed(() =>
            wwLib.$store.getters['manager/isComponentRegistered'](vueComponentName.value)
        );
        return {
            sectionId,
            isComponentRegistered,
            vueComponentName,
        };
    },
    data() {
        return {
            loadingTryRestore: false,
        };
    },
    computed: {
        isComponentReady() {
            return this.isComponentRegistered;
        },
    },
    watch: {
        vueComponentName: {
            immediate: true,
            async handler() {
                if (this.vueComponentName || !this.uid) return;

                wwLib.getManagerWindow().analytics.track('ELEM_UNDEF_DETECTED', {
                    design_id: this.$store.getters['websiteData/getDesignInfo'].id,
                    page_id: this.$store.getters['websiteData/getPageId'],
                    element_uid: this.uid,
                });
            },
        },
        isComponentRegistered: {
            immediate: true,
            async handler(isRegistered, oldIsRegistered) {
                if (isRegistered && oldIsRegistered) return;
                if (!isRegistered) {
                    wwLib.wwAsyncScripts.loadComponent(this.vueComponentName, this.type);
                }
            },
        },
    },
    methods: {
        async tryRestore() {
            if (this.loadingTryRestore) return;

            const confirm = await wwLib.wwModals.open({
                title: 'This is a bug.',
                text: 'Please provide some context on how this happened:<br/><br/><div class="text-stale-400 body-sm">I was editing the page with someone else...<br/>I had 2 editors open on the same page...<br/>I tried to copy paste an element...</div><br/>Your feedback will greatly help us fix this issue.<br/><br/>If the restore does not work, please <a style="display:inline-block; cursor:pointer; text-decoration: underline;" href="https://support.weweb.io" target="_blank">contact WeWeb support</a>.',
                confirm: {
                    multiline: true,
                    notEmpty: true,
                    placeholder: 'Context...',
                    returnConfirm: true,
                },
                buttons: [
                    { text: 'Cancel', color: '-secondary -dark', value: false, escape: true },
                    { text: 'Try to restore', color: '-primary -yellow', value: true, enter: true, confirm: true },
                ],
            });

            if (confirm) {
                this.loadingTryRestore = true;
                try {
                    if (wwLib.getEditorWindow().analytics) {
                        wwLib.getEditorWindow().analytics.track('ELEM_UNDEF_CONTEXT', {
                            design_id: this.$store.getters['websiteData/getDesignInfo'].id,
                            page_id: this.$store.getters['websiteData/getPageId'],
                            element_uid: this.uid,
                            context: confirm,
                        });
                    }

                    const wwObjects = await api.elements.tryRestore(
                        wwLib.$store.getters['websiteData/getDesignInfo'].id,
                        this.uid,
                        this.type,
                        this.sectionId
                    );

                    if (wwObjects.length > 0) {
                        wwLib.$store.dispatch('websiteData/restoreElements', wwObjects);
                        if (!this.isComponentRegistered) {
                            wwLib.wwAsyncScripts.loadComponent(this.vueComponentName, this.type);

                            wwLib.wwNotification.open({
                                text: {
                                    en: 'Restoration complete.',
                                },
                                color: 'green',
                                duration: 3000,
                            });
                        }
                    }
                } catch (error) {
                    wwLib.wwNotification.open({
                        text: {
                            en: 'Unable to restore element. Please contact WeWeb support.',
                        },
                        color: 'red',
                        duration: 3000,
                    });
                } finally {
                    this.loadingTryRestore = false;
                }
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.ww-object-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: var(--ww-color-dark-50);
    border: 1px solid var(--ww-color-dark-100);
    color: var(--ww-color-dark-800);

 }
</style>
