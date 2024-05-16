export default {
    addStyleSheetToHead(options) {
        options = options || {};
        if (!options.link) {
            return;
        }
        return new Promise(function (resolve, reject) {
            if (!options.link) {
                return reject();
            }

            try {
                const styleAlreadyInDom = wwLib.getFrontDocument().querySelector(`link[href="${options.link}"]`);
                // Get or create unique script id
                let uniqueId;
                if (styleAlreadyInDom) {
                    uniqueId = styleAlreadyInDom.getAttribute('id');
                    return resolve();
                } else {
                    uniqueId = Math.floor(Math.random() * 1000000000);
                    let styleToAdd = wwLib.getFrontDocument().createElement('link');
                    styleToAdd.onload = function () {
                        wwLib.$emit('wwUtils:newStyle-' + uniqueId);
                        return resolve();
                    };
                    styleToAdd.onerror = function () {
                        return reject();
                    };
                    styleToAdd.setAttribute('href', options.link);
                    styleToAdd.setAttribute('id', uniqueId);
                    styleToAdd.setAttribute('rel', 'stylesheet');
                    options.title && styleToAdd.setAttribute('title', options.title);
                    wwLib.getFrontDocument().head.appendChild(styleToAdd);

                 }
            } catch (e) {
                return reject();
            }
        });
    },
};
