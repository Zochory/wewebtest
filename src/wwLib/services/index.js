import wwUtils from './wwUtils';
import wwWebsiteData from './wwWebsiteData';
import wwObjectHelper from './wwObjectHelper';
import wwLang from './wwLang';
import wwApiRequests from './wwApiRequests';
import wwLog from './wwLog';
import wwCss from './wwCss';
import wwPluginHelper from './wwPluginHelper';
import wwCollection from './wwCollection';
import watchers from './watchers';
import wwPageHelper from './wwPageHelper';
import wwVariable from './wwVariable';
import wwFormula from './wwFormula';
import globalVariables from './globalVariables';
import { createScrollStore } from '@/_common/store/scrollStore';
import { createLogStore } from '@/_common/store/logStore';

export default {
    wwUtils,
    wwWebsiteData,
    wwObjectHelper,
    wwElementHelper: wwObjectHelper,
    wwLang,
    wwApiRequests,
    wwLog,
    wwCss,
    wwPluginHelper,
    wwCollection,
    watchers,
    wwPageHelper,
    wwVariable,
    wwFormula,
    globalVariables,
    scrollStore: createScrollStore(),
    logStore: createLogStore(),
};
