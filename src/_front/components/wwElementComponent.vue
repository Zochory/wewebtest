/* eslint-disable vue/no-dupe-keys */
<template>
    <div
        v-if="isRendering"
        ref="rootElement"
        class="ww-object"
        v-bind="attributes"
        :data-ww-uid="uid"
        :data-ww-component-id="componentId"
        :data-is-selected="isSelected"
        :data-library-component-id="libraryComponentId"
        :data-library-component-uid="libraryComponentUid"
        :data-ww-component-to-hover-uid="canInteract?.componentToHover?.uid"
        :data-ww-component-to-hover-component-id="canInteract?.componentToHover?.componentId"
        :data-ww-component-to-hover-type="canInteract?.componentToHover?.type"
        :data-ww-can-interact="canInteract?.canInteract"
        contenteditable="false"
        :class="[
            {
             },
        ]"
        :style="wwObjectStyle"
        ww-responsive="ww-main"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <!-- BACKGROUND VIDEO -->
        <wwBackgroundVideo v-if="backgroundVideoStyle" :video="backgroundVideoStyle"></wwBackgroundVideo>
        <!-- WWOBJECT -->
        <wwLink
            ref="wwlink"
            :ww-link="state.link"
            :style="elementStyle"
            ww-responsive="ww-elem"
            :disabled="isLinkDisabled"
            :page-index="bindingContext ? bindingContext.repeatIndex : undefined"
            @linkActive="$event ? addInternalState('_wwLinkActive') : removeInternalState('_wwLinkActive')"
        >
             <!-- wwFront:start -->
            <component
                :is="vueComponentName"
                ref="component"
                class="ww-object-elem"
                :class="[state.class || '']"
                v-bind="componentAttributes"
                :content="content"
                :uid="uid"
                :ww-front-state="wwFrontState"
                :ww-element-state="wwElementState"
                @trigger-event="onTriggerEvent"
                @element-event="$emit('element-event', $event)"
                @add-state="addInternalState"
                @remove-state="removeInternalState"
                @toggle-state="toggleInternalState"
            ></component>
            <!-- wwFront:end -->
        </wwLink>
     </div>
</template>

<script>
import { computed, ref, toRef, reactive, inject, provide, shallowRef, watch } from 'vue';

import {
    getComponentVueComponentName,
    getComponentIcon,
    getComponentConfiguration,
    getComponentLabel,
    getComponentSize,
    getDisplayValue,
} from '@/_common/helpers/component/component';

 
/* wwFront:start */
import { useIsConditionalRenderingResponsive } from '@/_common/use/useComponent';
/* wwFront:end */

import { useComponentData, useComponentTriggerEvent } from '@/_common/use/useComponent';
import { useComponentStates } from '@/_front/use/useComponentStates';
import { useComponentKeyframes } from '@/_front/use/useComponentKeyframes';
import { useComponentAdvancedInteractions } from '@/_front/use/useComponentAdvancedInteractions';
import { useComponentActions } from '@/_common/use/useActions';

import { getBackgroundStyle } from '@/_front/helpers/wwBackgroungStyle';

let componentId = 1;

export default {
    components: {
     },
    inject: {
        parentId: { from: '_wwElementUid', default: null },
        wwIsInStretchedSection: { from: '__wwIsInStretchedSection', default: false },
    },
    props: {
        uid: { type: String, required: true },
        isWwObject: { type: Boolean, default: true }, // only here to not have warning on vbind
        wwProps: { type: Object, default: () => ({}) },
        states: { type: Array, default: () => [] },
        isLibraryComponentRoot: { type: Boolean, default: false },
        libraryComponentData: { type: Object, default: null },
        libraryComponentTriggerEvent: { type: Function, default: null },
        libraryComponentTriggerLibraryComponentEvent: { type: Function, default: null },
         /* wwFront:start */
        isLibraryComponentConditionalRenderingResponsive: { type: Boolean, default: false },
        /* wwFront:end */
    },
    // update:child-selected and update:is-selected are used by useElementSelection
    emits: ['element-event', 'update:child-selected', 'update:is-selected', 'add-state', 'remove-state'],
    setup(props, vueContext) {
        const id = componentId;
        componentId++;
        const rootElement = shallowRef(null);
        const component = shallowRef(null);

        const wwLayoutContext = inject('wwLayoutContext', {});
        const bindingContext = inject('bindingContext', null);
        const sectionId = inject('sectionId', null);
        const containerType = inject('__wwContainerType', null);
        const _wwLibraryComponentUid = inject('_wwLibraryComponentUid', null);

        provide('wwLayoutContext', {});
        provide('__wwContainerType', null);
        provide('__wwIsInStretchedSection', false);
        provide('_wwElementUid', props.uid);
        provide('_wwElementComponentId', id);

 
        const libraryComponentContext = inject('_wwLibraryComponentContext', null);
        const dropzoneContext = inject('_wwDropzoneContext', null);
        const context = reactive({
            item: computed(() => bindingContext || {}),
            layout: computed(() => ({ id: wwLayoutContext.layoutId })),
            component: libraryComponentContext?.component,
            get thisInstance() {
                return component.value?.$el;
            },
            dropzone: dropzoneContext,
        });

        const {
            currentStates,
            addInternalState,
            removeInternalState,
            toggleInternalState,
         } = useComponentStates(
            { uid: props.uid, type: 'element' },
            {
                context,
                propsState: toRef(props, 'states'),
             }
        );

        const {
            content,
            style,
            state,
            rawContent,
            rawStyle,
            name: elementName,
            configuration,
         } = useComponentData({
            type: 'element',
            uid: props.uid,
            componentId: id,
            currentStates,
            context,
            libraryComponentDataRef: computed(() => props.libraryComponentData),
         });
 
        // TODO: could be one common reactive property
        // This is already the case for Section
        const wwFrontState = reactive({
            lang: computed(() => wwLib.$store.getters['front/getLang']),
            pageId: computed(() => wwLib.$store.getters['websiteData/getPageId']),
            sectionId, // THIS IS WRONG, SHOULD NOT BE HERE. PLEASE DELETE ONE DAY :(
            screenSize: computed(() => wwLib.$store.getters['front/getScreenSize']),
            screenSizes: computed(() => wwLib.$store.getters['front/getScreenSizes']),
        });
        provide('wwFrontState', wwFrontState);

        const hasLink = computed(() => {
            return state.link && state.link.type !== 'none';
        });
        const isParentInsideLink = inject('isInsideLink', false);
        const isInsideLink = computed(() => {
            return isParentInsideLink.value || hasLink.value;
        });
        provide('isInsideLink', isInsideLink);

        const wwElementState = reactive({
            props: toRef(props, 'wwProps'),
            isInsideLink,
            uid: props.uid,
            name: elementName,
            states: currentStates,
        });
        provide('wwElementState', wwElementState);

        /* wwFront:start */
        let isConditionalRenderingResponsive;
        if (window.__WW_IS_PRERENDER__) {
            isConditionalRenderingResponsive = useIsConditionalRenderingResponsive({
                type: 'element',
                uid: props.uid,
            });
        }
        /* wwFront:end */

        const isRendering = computed(() => {
 
            /* wwFront:start */
            // eslint-disable-next-line no-unreachable
            if (
                (isConditionalRenderingResponsive?.value || props.isLibraryComponentConditionalRenderingResponsive) &&
                window.__WW_IS_PRERENDER__
            ) {
                return false;
            }
            return style.conditionalRendering;
            /* wwFront:end */
        });

        // When component is unmount, we reset state (the mouse leave event is not fired)
        watch(isRendering, isRendering => {
            if (!isRendering) {
                removeInternalState('_wwHover', true);
            }
        });

 
        function triggerElementEvent(event) {
            vueContext.emit('element-event', event);
        }
        provide('triggerElementEvent', triggerElementEvent);

 
        useComponentAdvancedInteractions(state);

        const { animationStyle } = useComponentKeyframes({
            componentId: id,
            style,
         });

 
        useComponentActions(
            { uid: props.uid, componentId: id, type: 'element' },
            { context, configuration, componentRef: component }
        );

        const { listeners, triggerEvent } = useComponentTriggerEvent(
            {
                state,
                componentIdentifier: { type: 'element', componentId: id, uid: props.uid },
                triggerParentEvent: props.libraryComponentTriggerEvent,
                triggerLibraryComponentEvent: props.libraryComponentTriggerLibraryComponentEvent,
                parentInteractionsRef: computed(() => props.libraryComponentData?.state?.interactions),
                isRenderingRef: isRendering,
            },
            context
        );

        return {
            rootElement,
            component,
            content,
            style,
            state,
            componentId: id,
            sectionId,
            configuration: getComponentConfiguration('element', props.uid),
            bindingContext,
            rawContent,
            context,
            elementName,
            addInternalState,
            removeInternalState,
            toggleInternalState,
            listeners,
            triggerEvent,
            wwFrontState,
            hasLink,
            wwElementState,
            containerType,
            isRendering,
            animationStyle,
            _wwLibraryComponentUid,
            /* wwFront:start */
            isSelected: null, // it's used in the DOM and we cannot strip it easily
            /* wwFront:end */
         };
    },
    data() {
        return {
         };
    },
    computed: {
        vueComponentName() {
            return getComponentVueComponentName('element', this.uid);
        },
        /*=============================================m_ÔÔ_m=============================================\
            CONFIG / STATE
        \================================================================================================*/
        configurationOptions() {
            return this.configuration.options || {};
        },
        attributes() {
            let attributes = {};
            if (this.bindingContext && this.bindingContext.index)
                attributes['data-ww-repeat-index'] = this.bindingContext.index;

            if (this._wwLibraryComponentUid) attributes['data-ww-comp-uid'] = this._wwLibraryComponentUid;

            return attributes;
        },
        componentAttributes() {
            let attributes = { ...this.listeners };

            if (this.state.attributes) {
                try {
                    for (const attr of this.state.attributes.filter(attr => attr.name)) {
                        attributes[attr.name.replace(/ /g, '')] = attr.value;
                    }
                } catch {
                    wwLib.wwLog.warn(
                        `Attributes is missbind for element ${getComponentLabel('element', this.uid)} (${this.uid})`
                    );
                }
            }

            if (this.state.id) {
                attributes.id = this.state.id;
            }

            return attributes;
        },
         isLinkDisabled() {
            let isLinkDisabledByConfiguration =
                this.configuration && this.configuration.options && this.configuration.options.disableLink;
            if (typeof isLinkDisabledByConfiguration === 'function') {
                isLinkDisabledByConfiguration = isLinkDisabledByConfiguration(this.content);
            }
             // eslint-disable-next-line no-unreachable
            return isLinkDisabledByConfiguration;
        },

        /*=============================================m_ÔÔ_m=============================================\
            STYLE
        \================================================================================================*/
        isFlexboxChild() {
            return this.containerType === 'flex' || this.containerType === 'inline-flex';
        },
        isGridChild() {
            return this.containerType === 'grid' || this.containerType === 'inline-grid';
        },
        wwObjectStyle() {
            const wwObjectStyle = {
                margin: this.style.margin || '0',
                zIndex: this.style.zIndex || 'unset',
                overflow: this.style.overflow,
            };

            //ALIGN SELF
            wwObjectStyle.alignSelf = this.isFlexboxChild && this.style.align ? this.style.align : 'unset';

            //DISPLAY
            wwObjectStyle.display = getDisplayValue(this.style.display, this.configuration);

            //POSITION
            if (
                this.style.position === 'sticky' ||
                this.style.position === 'absolute' ||
                this.style.position === 'fixed'
            ) {
                wwObjectStyle.position = this.style.position;
                const hasValue = this.style.top || this.style.bottom || this.style.left || this.style.right;
                wwObjectStyle.top = this.style.top || (hasValue ? null : '0px');
                wwObjectStyle.bottom = this.style.bottom;
                wwObjectStyle.left = this.style.left;
                wwObjectStyle.right = this.style.right;
            }

            //WIDTH
            wwObjectStyle.width = getComponentSize(
                this.style.width,
                this.configurationOptions.autoByContent ? 'auto' : null
            );

            if (this.isFlexboxChild && this.style.flex) {
                wwObjectStyle.flex = this.style.flex;
            }

            // MAX-WIDTH
            wwObjectStyle.maxWidth = getComponentSize(this.style.maxWidth);
            // MIN-WIDTH
            wwObjectStyle.minWidth = getComponentSize(this.style.minWidth);

            //PERSPECTIVE
            let perspective = this.style.perspective || 0;
            const hasPerspective = wwLib.wwUtils.getLengthUnit(perspective)[0];
            if (hasPerspective) {
                wwObjectStyle.perspective = perspective;
            }

            //HEIGHT
            wwObjectStyle.height = this.style.height || 'auto';

            //ASPECT-RATIO
            wwObjectStyle.aspectRatio = this.style.aspectRatio;

            //MAX-HEIGHT
            wwObjectStyle.maxHeight = getComponentSize(this.style.maxHeight);
            //MIN-HEIGHT
            wwObjectStyle.minHeight = getComponentSize(this.style.minHeight);

            wwObjectStyle.background = getBackgroundStyle(this.style);

            // OTHER
            [
                'border',
                'borderTop',
                'borderBottom',
                'borderLeft',
                'borderRight',
                'borderRadius',
                'boxShadow',
                'opacity',
                'transition',
                'transform',
            ].forEach(prop => {
                if (this.style[prop] !== undefined && this.style[prop] !== null) {
                    wwObjectStyle[prop] = this.style[prop];
                }
            });

            //CURSOR
            if (this.style.cursor) {
                     wwObjectStyle.cursor = this.style.cursor;
             }

            //ANIMATION
            Object.assign(wwObjectStyle, this.animationStyle);

            //CUSTOM CSS
            for (const prop in this.style.customCss || {}) {
                wwObjectStyle[prop] = this.style.customCss[prop];
            }

            if (this.wwIsInStretchedSection && !this.style.align) {
                wwObjectStyle.width = wwObjectStyle.width || '100%';
                wwObjectStyle.marginLeft = wwObjectStyle.marginLeft || 'auto';
                wwObjectStyle.marginRight = wwObjectStyle.marginRight || 'auto';
            }

            //ADD EXTRA-STYLE
            return { ...wwObjectStyle, ...this.gridStyle, ...(this.$attrs['extra-style'] || {}) };
        },
        elementStyle() {
            const style = {
                padding: this.style.padding || '0',

                //MAX-HEIGHT
                maxHeight: getComponentSize(this.style.maxHeight),
                //MIN-HEIGHT
                minHeight: getComponentSize(this.style.minHeight),
            };
            return style;
        },
        gridStyle() {
            if (!this.isGridChild) return {};

            const { columnSpan, rowSpan, gridColumn, gridRow } = this.style;

            const gridStyles = {};
            if (columnSpan) gridStyles.gridColumn = `span ${columnSpan}`;
            if (rowSpan) gridStyles.gridRow = `span ${rowSpan}`;
            if (gridColumn) gridStyles.gridColumn = gridColumn;
            if (gridRow) gridStyles.gridRow = gridRow;

            return gridStyles;
        },

        backgroundVideoStyle() {
            if (!this.style.backgroundVideo) return null;
            return {
                type: 'video',
                value: {
                    url: this.style.backgroundVideo,
                    loop: this.style.backgroundVideoLoop,
                    poster: this.style.backgroundVideoPoster,
                    preload: this.style.backgroundVideoPreload,
                    size: this.style.backgroundVideoSize,
                },
            };
        },
 
        /*=============================================m_ÔÔ_m=============================================\
            STYLE HELPERS
        \================================================================================================*/
     },

    /* wwFront:start */
    mounted() {
        if (window.__WW_IS_PRERENDER__) {
            window.document.dispatchEvent(new CustomEvent('PRERENDER_UPDATED'));
        }
    },
    updated() {
        if (window.__WW_IS_PRERENDER__) {
            window.document.dispatchEvent(new CustomEvent('PRERENDER_UPDATED'));
        }
    },
    /* wwFront:end */
    methods: {
        onTriggerEvent({ name, event } = {}) {
            this.triggerEvent(name, event);
        },
        onMouseEnter() {
            this.addInternalState('_wwHover', true);
            this.$emit('add-state', ['_wwHover', true]);
         },
        onMouseLeave() {
            this.removeInternalState('_wwHover', true);
            this.$emit('remove-state', ['_wwHover', true]);
         },
     },
};
</script>

<style scoped lang="scss">
.ww-object {
    transition: max-height 0.3s ease, opacity 0.5s ease, transform 0.5s ease;
    position: relative;
    box-sizing: border-box;
    min-height: 5px;
    min-width: 5px;
    pointer-events: initial;

    &-elem {
        position: relative;
        text-align: initial;
        width: 100%;
        height: 100%;
    }

 }

.ww-link {
    text-decoration: none;
    color: inherit;

    & > .ww-object-elem {
        height: 100%;
    }
}

 </style>

<style lang="scss">
 </style>
