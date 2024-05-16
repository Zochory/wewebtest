import { executeWorkflow } from '@/_common/helpers/code/workflows';

export async function executeWorkflows(trigger = 'onload', workflowParams = {}) {
    const { workflows: pageWorkflows = [], id: pageId } = wwLib.$store.getters['websiteData/getPage'] || {};
    const { workflows: appWorkflows = [] } = wwLib.$store.getters['websiteData/getDesignInfo'] || {};
    await Promise.all([
        ...pageWorkflows
            .filter(workflow => workflow.trigger === trigger)
            .map(workflow => {
                return executeWorkflow(workflow, { ...workflowParams, executionContext: { type: 'p', pageId } }).catch(
                    err => wwLib.wwLog.error(err)
                ); // TODO: more info here when workflows failed?
            }),
        ...appWorkflows
            .filter(workflow => workflow.trigger === trigger)
            .map(workflow => {
                return executeWorkflow(workflow, { ...workflowParams, executionContext: { type: 'a' } }).catch(err =>
                    wwLib.wwLog.error(err)
                ); // TODO: more info here when workflows failed?
            }),
    ]);
}

export function resetWorkflows() {
    wwLib.$store.dispatch('data/resetWorkflowsResult');
}
