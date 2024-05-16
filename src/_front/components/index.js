import wwLayout from './wwLayout.vue';
import wwLayoutItem from './wwLayoutItem.vue';
import wwLayoutItemContext from './wwLayoutItemContext.vue';
import wwLinkPopup from './wwLinkPopup.vue';
import wwElement from './wwElement.vue';
import wwSection from './wwSection.vue';
import LazyHydrate from './LazyHydrate.vue';
import wwBackgroundVideo from './wwBackgroundVideo.vue';
import wwLink from './wwLink.vue';
import wwEditableText from './textEditor/wwEditableText';
import wwText from './elements/wwText';
import wwSimpleLayout from './elements/wwSimpleLayout';

export default {
    install(app) {
        app.component('wwLayout', wwLayout);
        app.component('wwLayoutItem', wwLayoutItem);
        app.component('wwLayoutItemContext', wwLayoutItemContext);
        app.component('wwLinkPopup', wwLinkPopup);
        app.component('wwObject', wwElement);
        app.component('wwElement', wwElement);
        app.component('wwSection', wwSection);
        app.component('LazyHydrate', LazyHydrate);
        app.component('wwBackgroundVideo', wwBackgroundVideo);
        app.component('wwLink', wwLink);
        app.component('wwEditableText', wwEditableText);
        app.component('wwText', wwText);
        app.component('wwSimpleLayout', wwSimpleLayout);
    },
};

export { wwLinkPopup, wwElement, wwSection, LazyHydrate, wwBackgroundVideo, wwLink };
