import { filterData, sortData, getValue } from '@/_common/helpers/code/customCode';
import { executeWorkflows } from '@/_common/helpers/data/workflows';

export default {
    getCollection(collectionId) {
        const collection = wwLib.$store.getters['data/getCollections'][collectionId];
        if (!collection) {
            wwLib.wwLog.error(`Collection ${collectionId} not found`);
            return null;
        }

        return collection;
    },
    getCollectionPluginConfig(collectionId) {
        const collection = wwLib.wwCollection.getCollection(collectionId);
        if (!collection) return null;

        const plugin = collection.pluginId
            ? wwLib.$store.getters['websiteData/getPluginById'](collection.pluginId)
            : null;

        if (!plugin) return null;

        return wwLib.$store.getters['front/getComponentConfig'](plugin.isDev ? plugin.name : `plugin-${plugin.id}`);
    },
    getCollectionQueryConfig(collectionId) {
        const collectionPluginConfig = wwLib.wwCollection.getCollectionPluginConfig(collectionId);
        return collectionPluginConfig ? collectionPluginConfig.editor.collection.queryConfig : null;
    },
    async _fetchCollection(id, { limit, offset } = {}) {
        const websiteId = wwLib.$store.getters['websiteData/getDesignInfo'].id;
        const collection = wwLib.$store.getters['data/getCollections'][id];
        const plugin = wwLib.$store.getters['websiteData/getPluginById'](collection.pluginId);

        limit = limit || parseInt(getValue(collection.limit));

        const variables = {
            ...getBindingValues(collection.config),
            ...getBindingValues(collection.filter),
            ...getBindingValues(collection.sort),
        };

        if (collection.mode === 'dynamic') {
            const config = getValue(collection.config);
            const filter = getValue(collection.filter);
            const sort = getValue(collection.sort);

            const { data, error, total } =
                (wwLib.wwPlugins[plugin.name].fetchCollection &&
                    (await wwLib.wwPlugins[plugin.name].fetchCollection({
                        ...collection,
                        config,
                        offset,
                        limit,
                        filter,
                        sort,
                    }))) ||
                {};

            if (data || error) {
                 return Array.isArray(data)
                    ? {
                          total: total || data.length,
                          offset,
                          data,
                          type: 'collection',
                          error,
                       }
                    : { data, error, type: 'single' };
            }
        }
         /* wwFront:start */
        // eslint-disable-next-line no-unreachable
        const { data: dataFromPreview } = await axios.post(
            `//${window.location.hostname}/ww/cms_data_sets/${id}/fetch?limit=${limit}&offset=${offset}`,
            { variables }
        );
        return dataFromPreview;
        /* wwFront:end */
    },
    async fetchCollection(id, { limit, offset } = {}, workflowContext) {
        const currentNavigationId = wwLib.globalVariables._navigationId;
        try {
            const currentCollectionInfo = wwLib.$store.getters['data/getCollections'][id];
            if (!currentCollectionInfo) return;
            wwLib.logStore.verbose(`Start fetching collection _wwCollection(${id})`, {
                workflowContext,
                type: workflowContext ? 'action' : 'collection',
            });
            wwLib.$store.dispatch('data/setCollectionFetching', {
                id,
                isFetching: true,
            });

            await wwLib.wwPluginHelper.waitPluginsLoaded();

            offset = offset || 0;

            const newCollectionInfo = await this._fetchCollection(id, { limit, offset });
            if (currentNavigationId !== wwLib.globalVariables._navigationId) {
                wwLib.logStore.verbose(`Cancelling collection _wwCollection(${id}) fetch (navigation)`, {
                    workflowContext,
                    type: workflowContext ? 'action' : 'collection',
                });
                return;
            }

            if (!newCollectionInfo || typeof newCollectionInfo !== 'object') return;
            // TODO: here i suppose that total never changed, may need more algo later
            if (!newCollectionInfo.error && newCollectionInfo.type === 'collection') {
                let newData = newCollectionInfo.data;
                const queryConfig = wwLib.wwCollection.getCollectionQueryConfig(id) || {};
                if (currentCollectionInfo.mode === 'dynamic' && !queryConfig.hasNativePagination) {
                    newData = filterData(newData, currentCollectionInfo.filter);
                    newData = sortData(newData, currentCollectionInfo.sort);
                    newCollectionInfo.offset = 0;
                    newCollectionInfo.total = newData.length;
                } else {
                    if (
                        !currentCollectionInfo.data ||
                        !currentCollectionInfo.data.length ||
                        currentCollectionInfo.total !== newCollectionInfo.total
                    ) {
                        newData = new Array(newCollectionInfo.total).fill(null);
                        newData.splice(offset, newCollectionInfo.data.length, ...newCollectionInfo.data);
                    } else {
                        newData = [...currentCollectionInfo.data];
                        newData.splice(offset, newCollectionInfo.data.length, ...newCollectionInfo.data);
                    }
                }
                newCollectionInfo.data = newData;
            }
             const collection = {
                ...currentCollectionInfo,
                ...newCollectionInfo,
            };

            if (typeof currentCollectionInfo.limit === 'object') {
                collection.limit = currentCollectionInfo.limit;
            }

            if (collection.error) {
                wwLib.logStore.error(`Error happened while fetching collection _wwCollection(${id})`, {
                    error: collection.error,
                    workflowContext,
                    type: workflowContext ? 'action' : 'collection',
                });
                executeWorkflows('on-collection-fetch-error', {
                    event: {
                        error: collection.error.message ? collection.error.message : collection.error,
                        collection: collection.config.data,
                        collectionId: collection.id,
                        collectionName: collection.name,
                    },
                });
            } else {
                wwLib.logStore.verbose(`Data fetched for collection _wwCollection(${id})`, {
                    workflowContext,
                    type: workflowContext ? 'action' : 'collection',
                });
            }

            await wwLib.$store.dispatch('data/setCollection', collection);
        } catch (err) {
            if (currentNavigationId === wwLib.globalVariables._navigationId) {
                wwLib.wwLog.error(err);
            }
        } finally {
            if (currentNavigationId === wwLib.globalVariables._navigationId) {
                wwLib.$store.dispatch('data/setCollectionFetching', { id, isFetching: false });
            }
        }
    },
     async setOffset(collectionId, offset) {
        const collection = wwLib.$store.getters['data/getCollections'][collectionId];
        wwLib.logStore.verbose(`Updating pagination offset of collection ${collection.name} (${collectionId})`, {
            type: 'collection',
        });
        const queryConfig = wwLib.wwCollection.getCollectionQueryConfig(collectionId) || {};
        if (collection.mode !== 'dynamic' || queryConfig.hasNativePagination) {
            await this.fetchCollection(collectionId, { offset });
        } else {
            await wwLib.$store.dispatch('data/setCollection', { ...collection, offset });
        }
        wwLib.logStore.verbose(
            `Pagination offset of collection ${collection.name} (${collectionId}) updated to ${offset}`,
            { type: 'collection' }
        );
    },
    getPaginationOptions(collectionId) {
        return wwLib.$store.getters['data/getPaginationOptions'](collectionId);
    },

    isCollection(value) {
        return value && !Array.isArray(value) && typeof value === 'object' && value.type === 'collection';
    },

    // ===== UTILS PUBLIC API =====
    getCollectionData(collection) {
        const isCollection = wwLib.wwCollection.isCollection(collection);
        if (!isCollection) {
            return collection;
        }
        // Non paginated collection
        if (!collection.limit || !collection.total) {
            return collection.data;
        }
        if (!Array.isArray(collection.data)) return collection.data;
        const offset = parseInt(collection.offset) || 0;
        return collection.data.slice(offset, offset + parseInt(getValue(collection.limit)));
    },
};

function getBindingValues(rawValue, valuesUsed = {}) {
    if (!rawValue) return rawValue;
    if (rawValue.__wwtype) {
        valuesUsed[JSON.stringify(rawValue, Object.keys(rawValue).sort())] = getValue(rawValue);
    } else if (Array.isArray(rawValue)) {
        rawValue.forEach(raw => {
            valuesUsed = { ...valuesUsed, ...getBindingValues(raw) };
        });
    } else if (typeof rawValue === 'object') {
        Object.keys(rawValue).forEach(key => {
            valuesUsed = { ...valuesUsed, ...getBindingValues(rawValue[key]) };
        });
    }

    return valuesUsed;
}

 