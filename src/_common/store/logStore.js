import { ref, markRaw } from 'vue';
 
import { getComponentLabel } from '@/_common/helpers/component/component';
const LOG_TYPES = {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    VERBOSE: 'verbose',
};

// TODO: register a listener to use wwLog, and remove the wwLog calls from the code

const MAX_LOGS = 5000;
export function createLogStore() {
    const logs = ref([]);
    let listeners = [];

    function log(type, message, meta) {
     }

    return {
        logs,
        log,
        error(message, meta) {
            log(LOG_TYPES.ERROR, message, meta);
        },
        warning(message, meta) {
            log(LOG_TYPES.WARNING, message, meta);
        },
        info(message, meta) {
            log(LOG_TYPES.INFO, message, meta);
        },
        verbose(message, meta) {
            log(LOG_TYPES.VERBOSE, message, meta);
        },
        registerListener(listener) {
            listeners.push(listener);
        },
        unregisterListener(listener) {
            listeners = listeners.filter(l => l !== listener);
        },
        clear() {
            logs.value = [];
        },
        TYPES: LOG_TYPES,
    };
}

function formatMessageForEditor(message, executionContext) {
    // iterate through all collections and replace the id with the name
    const collections = wwLib.$store.getters['data/getCollections'];
    const COLLECTION_REGEXP = /_wwCollection\(([0-9a-fA-F-]+)\)/g;
    let matchCollection;
    while ((matchCollection = COLLECTION_REGEXP.exec(message)) !== null) {
        const collection = collections[matchCollection[1]];
        if (collection) {
            message = message.replace(
                matchCollection[0],
                `<button class="btn" data-ww-type="collection" data-ww-collection-id="${collection.id}">${collection.name}</button>`
            );
        }
    }

    const VARIABLE_REGEXP = /_wwVariable\((.+)\)/g;
    let matchVariable;
    while ((matchVariable = VARIABLE_REGEXP.exec(message)) !== null) {
        const variable = wwLib.$store.getters['data/getVariable'](matchVariable[1]);
        if (variable) {
            let name;
            if (variable.componentType) {
                name = `${getComponentLabel(variable.componentType, variable.componentUid)} - ${variable.name}`;
            } else {
                name = variable.name;
            }
            message = message.replace(
                matchVariable[0],
                `<button class="btn" data-ww-type="variable" data-ww-variable-id="${variable.id}">${name}</button>`
            );
        }
    }

    const LOCAL_VARIABLE_REGEXP = /_wwLocalVariable\((.+)\)/g;
    let matchLocalVariable;
    while ((matchLocalVariable = LOCAL_VARIABLE_REGEXP.exec(message)) !== null) {
        const variable =
            wwLib.$store.getters['libraries/getComponents'][executionContext?.libraryComponentIdentifier?.baseUid]
                ?.inner?.variables?.[matchLocalVariable[1]];
        if (variable) {
            let name;
            if (variable.componentType) {
                name = `${getComponentLabel(variable.componentType, variable.componentUid)} - ${variable.name}`;
            } else {
                name = variable.name;
            }
            message = message.replace(
                matchLocalVariable[0],
                `<button class="btn" data-ww-type="localVariable" data-ww-variable-id="${variable.id}" data-ww-library-component-uid="${executionContext?.libraryComponentIdentifier?.uid}" data-ww-library-component-id="${executionContext?.libraryComponentIdentifier?.componentId}">${name}</button>`
            );
        }
    }

    const workflows = wwLib.$store.getters['data/getGlobalWorkflows'];
    const WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),g\)/g;
    let matchWorkflow;
    while ((matchWorkflow = WORKFLOW_REGEXP.exec(message)) !== null) {
        const workflow = workflows[matchWorkflow[1]];
        if (workflow) {
            message = message.replace(
                matchWorkflow[0],
                `<button class="btn" data-ww-type="workflow" data-ww-workflow-type="g" data-ww-workflow-id="${
                    workflow.id
                }">${workflow.name || 'Untitled workflow'}</button>`
            );
        }
    }

    const LOCAL_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),c\)/g;
    let matchLocalWorkflow;
    while ((matchLocalWorkflow = LOCAL_WORKFLOW_REGEXP.exec(message)) !== null) {
        const workflow =
            wwLib.$store.getters['libraries/getComponents'][executionContext?.libraryComponentIdentifier?.baseUid]
                ?.inner?.workflows?.[matchLocalWorkflow[1]];
        if (workflow) {
            message = message.replace(
                matchLocalWorkflow[0],
                `<button class="btn" data-ww-type="workflow" data-ww-workflow-type="c" data-ww-workflow-id="${
                    workflow.id
                }" data-ww-library-component-uid="${
                    executionContext?.libraryComponentIdentifier?.uid
                }" data-ww-library-component-id="${executionContext?.libraryComponentIdentifier?.componentId}">${
                    workflow.name || 'Untitled workflow'
                }</button>`
            );
        }
    }

    const ELEMENT_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),([e|s]),([0-9a-fA-F-]+)\)/g;
    while ((matchWorkflow = ELEMENT_WORKFLOW_REGEXP.exec(message)) !== null) {
        const [, workflowId, type, uid] = matchWorkflow;
        const component =
            type === 's'
                ? wwLib.$store.getters['websiteData/getSection'](uid)
                : wwLib.$store.getters['websiteData/getWwObject'](uid);
        if (!component) continue;
        const workflow = (component._state?.interactions || []).find(w => w.id === workflowId);
        if (workflow) {
            message = message.replace(
                matchWorkflow[0],
                `<button class="btn" data-ww-type="workflow" data-ww-workflow-id="${workflowId}" data-ww-workflow-type="${type}" data-ww-element-uid="${uid}">${
                    workflow.name || workflow.trigger
                }</button>`
            );
        }
    }

    const PAGE_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),p,([0-9a-fA-F-]+)\)/g;
    while ((matchWorkflow = PAGE_WORKFLOW_REGEXP.exec(message)) !== null) {
        const [, workflowId, pageId] = matchWorkflow;
        const page = wwLib.$store.getters['websiteData/getPageById'](pageId);
        const workflow = (page?.workflows || []).find(w => w.id === workflowId);
        if (workflow) {
            message = message.replace(
                matchWorkflow[0],
                `<button class="btn" data-ww-type="workflow" data-ww-workflow-id="${workflowId}" data-ww-workflow-type="p" data-ww-page-id="${pageId}">${
                    workflow.name || workflow.trigger
                }</button>`
            );
        }
    }

    const APPLICATION_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),a\)/g;
    while ((matchWorkflow = APPLICATION_WORKFLOW_REGEXP.exec(message)) !== null) {
        const [, workflowId] = matchWorkflow;
        const { workflows } = wwLib.$store.getters['websiteData/getDesignInfo'] || {};
        const workflow = (workflows || []).find(w => w.id === workflowId);
        if (workflow) {
            message = message.replace(
                matchWorkflow[0],
                `<button class="btn" data-ww-type="workflow" data-ww-workflow-id="${workflowId}" data-ww-workflow-type="a">${
                    workflow.name || workflow.trigger
                }</button>`
            );
        }
    }

    const pages = wwLib.$store.getters['websiteData/getPages'];
    const PAGE_REGEXP = /_wwPage\((.+)\)/g;
    let matchPage;
    while ((matchPage = PAGE_REGEXP.exec(message)) !== null) {
        const page = pages.find(page => page.id === matchPage[1]);
        if (page) {
            message = message.replace(
                matchPage[0],
                `<button class="btn" data-ww-type="page" data-ww-page-id="${page.id}">${page.name}</button>`
            );
        }
    }

    return message;
}

function formatRawMessageForEditor(message, executionContext) {
    // iterate through all collections and replace the id with the name
    const collections = wwLib.$store.getters['data/getCollections'];
    const COLLECTION_REGEXP = /_wwCollection\(([0-9a-fA-F-]+)\)/g;
    let matchCollection;
    while ((matchCollection = COLLECTION_REGEXP.exec(message)) !== null) {
        const collection = collections[matchCollection[1]];
        if (collection) {
            message = message.replace(matchCollection[0], `${collection.id} - ${collection.name}`);
        }
    }

    const VARIABLE_REGEXP = /_wwVariable\(([0-9a-fA-F-]+)\)/g;
    let matchVariable;
    while ((matchVariable = VARIABLE_REGEXP.exec(message)) !== null) {
        const variable = wwLib.$store.getters['data/getVariable'](matchVariable[1]);
        if (variable) {
            let name;
            if (variable.componentType) {
                name = `${getComponentLabel(variable.componentType, variable.componentUid)} - ${variable.name}`;
            } else {
                name = variable.name;
            }
            message = message.replace(matchVariable[0], `${variable.id} - ${name}`);
        }
    }

    const LOCAL_VARIABLE_REGEXP = /_wwLocalVariable\((.+)\)/g;
    let matchLocalVariable;
    while ((matchLocalVariable = LOCAL_VARIABLE_REGEXP.exec(message)) !== null) {
        const variable =
            wwLib.$store.getters['libraries/getComponents'][executionContext?.libraryComponentIdentifier?.baseUid]
                ?.inner?.variables?.[matchLocalVariable[1]];
        if (variable) {
            let name;
            if (variable.componentType) {
                name = `${getComponentLabel(variable.componentType, variable.componentUid)} - ${variable.name}`;
            } else {
                name = variable.name;
            }
            message = message.replace(matchLocalVariable[0], `${variable.id} - ${name}`);
        }
    }

    const workflows = wwLib.$store.getters['data/getGlobalWorkflows'];
    const WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),g\)/g;
    let matchWorkflow;
    while ((matchWorkflow = WORKFLOW_REGEXP.exec(message)) !== null) {
        const workflow = workflows[matchWorkflow[1]];
        if (workflow) {
            message = message.replace(matchWorkflow[0], `${workflow.id} - ${workflow.name}`);
        }
    }

    const LOCAL_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),c\)/g;
    let matchLocalWorkflow;
    while ((matchLocalWorkflow = LOCAL_WORKFLOW_REGEXP.exec(message)) !== null) {
        const workflow =
            wwLib.$store.getters['libraries/getComponents'][executionContext?.libraryComponentIdentifier?.baseUid]
                ?.inner?.workflows?.[matchLocalWorkflow[1]];
        if (workflow) {
            message = message.replace(matchLocalWorkflow[0], `${workflow.id} - ${workflow.name}`);
        }
    }

    const ELEMENT_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),([e|s]),([0-9a-fA-F-]+)\)/g;
    while ((matchWorkflow = ELEMENT_WORKFLOW_REGEXP.exec(message)) !== null) {
        const [, workflowId, type, uid] = matchWorkflow;
        const component =
            type === 's'
                ? wwLib.$store.getters['websiteData/getSection'](uid)
                : wwLib.$store.getters['websiteData/getWwObject'](uid);
        if (!component) continue;
        const workflow = (component._state?.interactions || []).find(w => w.id === workflowId);
        if (workflow) {
            message = message.replace(matchWorkflow[0], `${workflow.id} - ${workflow.name || workflow.trigger}`);
        }
    }

    const PAGE_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),p,([0-9a-fA-F-]+)\)/g;
    while ((matchWorkflow = PAGE_WORKFLOW_REGEXP.exec(message)) !== null) {
        const [, workflowId, pageId] = matchWorkflow;
        const page = wwLib.$store.getters['websiteData/getPageById'](pageId);
        const workflow = (page?.workflows || []).find(w => w.id === workflowId);
        if (workflow) {
            message = message.replace(matchWorkflow[0], `${workflow.id} - ${workflow.name || workflow.trigger}`);
        }
    }

    const APPLICATION_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),a\)/g;
    while ((matchWorkflow = APPLICATION_WORKFLOW_REGEXP.exec(message)) !== null) {
        const [, workflowId] = matchWorkflow;
        const { workflows } = wwLib.$store.getters['websiteData/getDesignInfo'] || {};
        const workflow = (workflows || []).find(w => w.id === workflowId);
        if (workflow) {
            message = message.replace(matchWorkflow[0], `${workflow.id} - ${workflow.name || workflow.trigger}`);
        }
    }

    return message;
}

function formatMessageForConsole(message, executionContext) {
    // iterate through all collections and replace the id with the name
    const collections = wwLib.$store.getters['data/getCollections'];
    const COLLECTION_REGEXP = /_wwCollection\(([0-9a-fA-F-]+)\)/g;
    let matchCollection;
    while ((matchCollection = COLLECTION_REGEXP.exec(message)) !== null) {
        const collection = collections[matchCollection[1]];
        if (collection) {
            message = message.replace(matchCollection[0], collection.name);
        }
    }

    const VARIABLE_REGEXP = /_wwVariable\(([0-9a-fA-F-]+)\)/g;
    let matchVariable;
    while ((matchVariable = VARIABLE_REGEXP.exec(message)) !== null) {
        const variable = wwLib.$store.getters['data/getVariable'](matchVariable[1]);
        if (variable) {
            let name;
            if (variable.componentType) {
                name = `${getComponentLabel(variable.componentType, variable.componentUid)} - ${variable.name}`;
            } else {
                name = variable.name;
            }
            message = message.replace(matchVariable[0], name);
        }
    }

    const LOCAL_VARIABLE_REGEXP = /_wwLocalVariable\((.+)\)/g;
    let matchLocalVariable;
    while ((matchLocalVariable = LOCAL_VARIABLE_REGEXP.exec(message)) !== null) {
        const variable =
            wwLib.$store.getters['libraries/getComponents'][executionContext?.libraryComponentIdentifier?.baseUid]
                ?.inner?.variables?.[matchLocalVariable[1]];
        if (variable) {
            let name;
            if (variable.componentType) {
                name = `${getComponentLabel(variable.componentType, variable.componentUid)} - ${variable.name}`;
            } else {
                name = variable.name;
            }
            message = message.replace(matchLocalVariable[0], name);
        }
    }

    const workflows = wwLib.$store.getters['data/getGlobalWorkflows'];
    const WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),g\)/g;
    let matchWorkflow;
    while ((matchWorkflow = WORKFLOW_REGEXP.exec(message)) !== null) {
        const workflow = workflows[matchWorkflow[1]];
        if (workflow) {
            message = message.replace(matchWorkflow[0], workflow.name || workflow.trigger || 'Untitled workflow');
        }
    }

    const LOCAL_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),c\)/g;
    let matchLocalWorkflow;
    while ((matchLocalWorkflow = LOCAL_WORKFLOW_REGEXP.exec(message)) !== null) {
        const workflow =
            wwLib.$store.getters['libraries/getComponents'][executionContext?.libraryComponentIdentifier?.baseUid]
                ?.inner?.workflows?.[matchLocalWorkflow[1]];
        if (workflow) {
            message = message.replace(matchLocalWorkflow[0], workflow.name || workflow.trigger || 'Untitled workflow');
        }
    }

    const ELEMENT_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),([e|s]),([0-9a-fA-F-]+)\)/g;
    while ((matchWorkflow = ELEMENT_WORKFLOW_REGEXP.exec(message)) !== null) {
        const [, workflowId, type, uid] = matchWorkflow;
        const component =
            type === 's'
                ? wwLib.$store.getters['websiteData/getSection'](uid)
                : wwLib.$store.getters['websiteData/getWwObject'](uid);
        if (!component) continue;
        const workflow = (component._state?.interactions || []).find(w => w.id === workflowId);
        if (workflow) {
            message = message.replace(matchWorkflow[0], workflow.name || workflow.trigger || 'Untitled workflow');
        }
    }

    const PAGE_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),p,([0-9a-fA-F-]+)\)/g;
    while ((matchWorkflow = PAGE_WORKFLOW_REGEXP.exec(message)) !== null) {
        const [, workflowId, pageId] = matchWorkflow;
        const page = wwLib.$store.getters['websiteData/getPageById'](pageId);
        const workflow = (page?.workflows || []).find(w => w.id === workflowId);
        if (workflow) {
            message = message.replace(matchWorkflow[0], workflow.name || workflow.trigger || 'Untitled workflow');
        }
    }

    const APPLICATION_WORKFLOW_REGEXP = /_wwWorkflow\(([0-9a-fA-F-]+),a\)/g;
    while ((matchWorkflow = APPLICATION_WORKFLOW_REGEXP.exec(message)) !== null) {
        const [, workflowId] = matchWorkflow;
        const { workflows } = wwLib.$store.getters['websiteData/getDesignInfo'] || {};
        const workflow = (workflows || []).find(w => w.id === workflowId);
        if (workflow) {
            message = message.replace(matchWorkflow[0], workflow.name || workflow.trigger || 'Untitled workflow');
        }
    }

    return message;
}
