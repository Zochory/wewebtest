import get from 'lodash.get';
import { computed, reactive, inject, provide, watch, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

import { getComponentConfiguration } from '@/_common/helpers/component/component';
import { STYLE_CONFIGURATION, STATE_CONFIGURATION } from '@/_common/helpers/component/commonConfiguration';
import { getValue } from '@/_common/helpers/code/customCode';
import { executeWorkflow } from '@/_common/helpers/code/workflows';
import { getComponentRawProperty } from '@/_common/helpers/component/componentProperty.js';
import { lazySet } from '@/_common/helpers/reactivity';

export function useComponentData({
    type,
    uid,
    componentId,
    currentStates,
    context = {},
    libraryComponentDataRef,
 }) {
    let content = {};
    let rawContent = {};
    let sidepanelContent = reactive({
        content: {},
        _state: {
            style: {},
        },
    });
    let style = {};
    let rawStyle = {};
    let rawState = {};
    let state = {};

 
    const configuration = getComponentConfiguration(type, uid);
    const component = computed(() => {
        if (type === 'section') {
            return wwLib.$store.getters['websiteData/getSection'](uid);
        } else {
            return wwLib.$store.getters['websiteData/getWwObject'](uid);
        }
    });
    const layers = inject('_wwLibraryComponentLayers', {});

    for (let propertyName in configuration.properties) {
        const propertyConfiguration = configuration.properties[propertyName];
        if (!propertyConfiguration.editorOnly) {
            setContentProperty(propertyName, propertyConfiguration, {
                component,
                currentStates,
                libraryComponentDataRef,
                 context,
                content,
                rawContent,
                layers,
            });
         }
    }

    for (let propertyName in STYLE_CONFIGURATION) {
        if (!STYLE_CONFIGURATION[propertyName].editorOnly) {
            const rawProperty = computed(() =>
                getComponentRawProperty({
                    dataRef: component,
                    prefix: '_state.style',
                    suffix: propertyName,
                    propertyConfiguration: STYLE_CONFIGURATION[propertyName],
                    statesRef: currentStates,
                    libraryComponentDataRef,
                 })
            );
            const property = computed(() =>
                getValue(rawProperty.value, context, {
                    defaultUndefined: STYLE_CONFIGURATION[propertyName].fallbackToDefault
                        ? STYLE_CONFIGURATION[propertyName].defaultValue
                        : STYLE_CONFIGURATION[propertyName].defaultUndefined,
                })
            );
            // eslint-disable-next-line vue/no-ref-as-operand
            style[propertyName] = property;
            rawStyle[propertyName] = rawProperty;
         }
    }
    for (const propertyName in STATE_CONFIGURATION) {
        if (propertyName === 'interactions') {
            const rawProperty = computed(() => component.value._state.interactions);
            // eslint-disable-next-line vue/no-ref-as-operand
            state.interactions = rawProperty;
            // eslint-disable-next-line vue/no-ref-as-operand
            rawState.interactions = rawProperty;
        } else if (!STATE_CONFIGURATION[propertyName].editorOnly) {
            const rawProperty = computed(() =>
                getComponentRawProperty({
                    dataRef: component,
                    prefix: '_state',
                    suffix: propertyName,
                    propertyConfiguration: STATE_CONFIGURATION[propertyName],
                    statesRef: currentStates,
                    libraryComponentDataRef,
                 })
            );
            const property = computed(() =>
                getValue(rawProperty.value, context, {
                    defaultUndefined: STATE_CONFIGURATION[propertyName].fallbackToDefault
                        ? STATE_CONFIGURATION[propertyName].defaultValue
                        : STATE_CONFIGURATION[propertyName].defaultUndefined,
                })
            );
            // eslint-disable-next-line vue/no-ref-as-operand
            state[propertyName] = property;
            rawState[propertyName] = rawProperty;
         }
    }

    if (type === 'libraryComponent') {
        const rawProperty = computed(() => component.value?.content?.default?.childrenData || {});
        // eslint-disable-next-line vue/no-ref-as-operand
        content.childrenData = rawProperty;
        // eslint-disable-next-line vue/no-ref-as-operand
        rawContent.childrenData = rawProperty;
    }

    content = reactive(content);
    style = reactive(style);
    rawContent = reactive(rawContent);
    rawStyle = reactive(rawStyle);
    rawState = reactive(rawState);
    state = reactive(state);

 
    if (type === 'libraryComponent') {
        // TODO ?
    } else {
        provide('componentContent', content);
        provide('componentState', state);
        provide('componentStyle', style);
        provide('componentRawContent', rawContent);
        provide('componentConfiguration', configuration);
        provide('componentData', component);
    }

    return {
        content,
         style,
        state,
        rawContent,
        rawStyle,
        rawState,
        name: computed(() => component.value && component.value.name),
        configuration,
    };
}

export function useParentContentProperty(path) {
    const componentContent = inject('componentContent');
    const componentRawContent = inject('componentRawContent');

    return {
        property: computed(() => get(componentContent, path.value)),
        rawProperty: computed(() => get(componentRawContent, path.value)),
    };
}

const LOG_TYPE = {
    section: 's',
    element: 'e',
    libraryComponent: 'c',
};

export function useComponentTriggerEvent(
    {
        state,
        componentIdentifier,
        triggerLibraryComponentEvent,
        triggerParentEvent,
        parentInteractionsRef,
        isRenderingRef,
    },
    context = {}
) {
    const data = inject('componentData', ref({}));

 
    function triggerEvent(name, event = {}) {
         const workflows = (state.interactions || []).filter(({ trigger }) => trigger === name);
        // Launch all workflows in parallel
        workflows.forEach(workflow => {
             executeWorkflow(workflow, {
                context,
                event,
                executionContext: {
                    type: LOG_TYPE[componentIdentifier.type],
                    uid: componentIdentifier.uid,
                 },
            });
        });
    }

    if (componentIdentifier.type === 'libraryComponent') {
        return { triggerEvent };
    }
    const listeners = computed(() => {
        const allActionEvents = [
            ...new Set(
                [...(state.interactions || []), ...(parentInteractionsRef?.value || [])].map(({ trigger }) => trigger)
            ),
        ];
        const allEvents = allActionEvents
            .filter((item, pos) => item && allActionEvents.indexOf(item) === pos)
            .filter(eventName => ['click', 'mouseenter', 'mouseleave'].includes(eventName));

        const listeners = {};

        for (const eventName of allEvents) {
            listeners[`on${eventName[0].toUpperCase()}${eventName.substr(1)}`] = event => {
                // Trigger define on the library component instance level
                if (triggerParentEvent) {
                    triggerParentEvent(eventName, event);
                }
                triggerEvent(eventName, event);
            };
        }

        return listeners;
    });

    function triggerMountEvent(eventName) {
        // Mount define on the library component level
        if (triggerLibraryComponentEvent) {
            triggerLibraryComponentEvent(eventName, {});
        }
        // Mount define in the library component instance level
        if (triggerParentEvent) {
            triggerParentEvent(eventName, {});
        }
        // Mount define by the element itself
        triggerEvent(eventName, {});
    }

    watch(isRenderingRef, (isRendered, wasRendered) => {
        if (isRendered && !wasRendered) {
            // Next tick to ensure that the component is fully rendered
            nextTick(() => triggerMountEvent('_wwOnMounted'));
        } else if (!isRendered && wasRendered) {
            triggerMountEvent('_wwOnBeforeUnmount');
        }
    });

    onMounted(() => {
        if (isRenderingRef.value) {
            triggerMountEvent('_wwOnMounted');
        }
    });
    onBeforeUnmount(() => {
        if (isRenderingRef.value) {
            triggerMountEvent('_wwOnBeforeUnmount');
        }
    });

    return { triggerEvent, listeners };
}

export function useLibraryComponentWorkflow({ baseUid, componentIdentifier }, context = {}) {
    function triggerEvent(name, event = {}, property) {
        const workflows = Object.values(
            wwLib.$store.getters['libraries/getComponents'][baseUid]?.inner?.workflows || {}
        ).filter(({ trigger, triggerProperty }) => trigger === name && (!property || property === triggerProperty));
        // Launch all workflows in parallel
        workflows.forEach(workflow => {
             executeWorkflow(workflow, {
                context,
                event,
                internal: true,
                executionContext: {
                    type: LOG_TYPE[componentIdentifier.type],
                    uid: componentIdentifier.uid,
                 },
            });
        });
    }

    function executeLibraryComponentWorkflow(workflowId, parameters) {
        const workflow = wwLib.$store.getters['libraries/getComponents'][baseUid]?.inner?.workflows?.[workflowId];
        if (!workflow) {
            console.error(`Workflow with id ${workflowId} not found`);
            return;
        }
        return executeWorkflow(workflow, {
            context: { ...context, parameters },
            internal: true,
            executionContext: {
                type: LOG_TYPE[componentIdentifier.type],
                uid: componentIdentifier.uid,
             },
        });
    }

     /* wwFront:start */
    const propertiesToWatch = [
        ...new Set(
            Object.values(wwLib.$store.getters['libraries/getComponents'][baseUid]?.inner?.workflows || {})
                .filter(({ trigger }) => trigger === '_wwOnPropertyChange')
                .map(({ triggerProperty }) => triggerProperty)
        ),
    ];
    /* wwFront:end */

             for (const property of propertiesToWatch) {
                 const unwatch = watch(
                    () => context?.component?.props?.[property],
                    (newValue, oldValue) => {
                        triggerEvent('_wwOnPropertyChange', { newValue, oldValue }, property);
                    },
                    { immediate: true }
                );
             }
 
    triggerEvent('_wwOnCreated');

    return { triggerLibraryComponentEvent: triggerEvent, executeLibraryComponentWorkflow };
}

/* wwFront:start */
export function useIsConditionalRenderingResponsive({ type, uid }) {
    return computed(() => {
        const component =
            type === 'section'
                ? wwLib.$store.getters['websiteData/getSection'](uid)
                : wwLib.$store.getters['websiteData/getWwObject'](uid);

        let lastValue = undefined;
        for (const screen of Object.keys(wwLib.$store.getters['front/getScreenSizes'])) {
            let value = component._state?.style?.[screen]?.conditionalRendering;
            value = value?.__wwtype ? value.code : value;

            //Default value for default is true
            if (value === undefined && screen === 'default') value = true;

            //If value is undefined, continue
            if (value === undefined) continue;

            //If value contains "breakpoint", it is responsive
            if (typeof value === 'string' && value.indexOf('breakpoint') > -1) return true;

            //If lastValue is undefined, set it to the current screen value
            if (lastValue === undefined) {
                lastValue = value;
            }
            //If lastValue is not undefined and not equal to the current screen value, it is responsive
            else if (lastValue !== value) {
                return true;
            }
        }

        //If we reach this point, the conditional rendering is not responsive
        return false;
    });
}
/* wwFront:end */

function setContentProperty(
    propertyName,
    propertyConfiguration,
    {
        component,
        currentStates,
        libraryComponentDataRef,
        useEditorKeyframesRef,
        context,
        content,
        rawContent,
        boundProps,
        layers,
     }
) {
    const rawProperty = computed(() => {
        const value = getComponentRawProperty({
            dataRef: component,
            prefix: 'content',
            suffix: propertyName,
            propertyConfiguration,
            statesRef: currentStates,
            libraryComponentDataRef,
            layers,
         });
        return value;
    });
    const property = computed(() => {
         /* wwFront:start */
        return getValue(rawProperty.value, context, {
            defaultUndefined: propertyConfiguration.fallbackToDefault
                ? propertyConfiguration.defaultValue
                : propertyConfiguration.defaultUndefined,
        });
        /* wwFront:end */
    });
    // eslint-disable-next-line vue/no-ref-as-operand
    content[propertyName] = property;
    rawContent[propertyName] = rawProperty;

 }
