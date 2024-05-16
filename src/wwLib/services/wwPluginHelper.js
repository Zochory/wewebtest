import { watchEffect } from 'vue';
 
export default {
     async registerPlugin(componentId, content, devPluginId = null) {
        const plugin =
            wwLib.$store.getters['websiteData/getPluginByComponentId'](componentId) ||
            wwLib.$store.getters['websiteData/getPluginByName'](componentId) ||
            (await wwLib.$store.dispatch('websiteData/addDevPlugin', { name: componentId, id: devPluginId }));

        if (!wwLib.wwPlugins) wwLib.wwPlugins = {};
        if (wwLib.wwPlugins[plugin.name] && !devPluginId) return;

        const settings = (plugin.id && !plugin.settings && (await this.getSettings(plugin.id))) ||
            plugin.settings || { publicData: {}, privateData: {} };

        wwLib.$store.dispatch('websiteData/updatePlugin', {
            pluginId: plugin.id || plugin.name,
            settings: plugin.settings || settings,
            isLoaded: plugin.isLoaded || false,
            isDev: plugin.isDev || !!devPluginId,
        });

        // TODO: use a reactive instead?
        wwLib.wwPlugins[plugin.name] = {
            ...content,
            name: plugin.name,
            isDev: !!devPluginId,
            get id() {
                const pluginFound = wwLib.$store.getters['websiteData/getPluginByName'](plugin.name) || {};
                return pluginFound.id;
            },
            get isLoaded() {
                const pluginFound = wwLib.$store.getters['websiteData/getPluginByName'](plugin.name) || {};
                return wwLib.$store.getters['websiteData/getPluginIsLoaded'](pluginFound.id);
            },
            get settings() {
                const pluginFound = wwLib.$store.getters['websiteData/getPluginByName'](plugin.name) || {};
                return _.cloneDeep(
                    wwLib.$store.getters['websiteData/getPluginSettings'](pluginFound.id) || {
                        publicData: {},
                        privateData: {},
                    }
                );
            },
        };
 
        const pluginConfig = wwLib.$store.getters['front/getComponentConfig'](componentId);

        let variables = pluginConfig.variables;

        if (typeof variables === 'function') {
            variables = variables(settings);
        }

        if (typeof variables === 'object' && !Array.isArray(variables)) {
            variables = Object.values(variables);
        }

        (variables || []).forEach(variable => {
            wwLib.$store.dispatch('data/setPluginVariable', {
                ...variable,
                pluginId: plugin.id,
                id: `${plugin.id}-${variable.name}`,
                value: variable.defaultValue,
                defaultValue: variable.defaultValue,
            });
            Object.defineProperty(wwLib.wwPlugins[plugin.name], variable.name, {
                get() {
                    const _variable = wwLib.$store.getters['data/getPluginVariables'][`${plugin.id}-${variable.name}`];
                    return _variable && _variable.value;
                },
            });
        });

        (pluginConfig.formulas || []).forEach(formula => {
            wwLib.$store.dispatch('data/setPluginFormula', {
                ...formula,
                pluginId: plugin.id,
                id: `${plugin.id}-${formula.name}`,
            });
        });

 
        // eslint-disable-next-line no-async-promise-executor
        const isLoaded = new Promise(async resolve => {
            /* wwFront:start */
            if (!wwLib.isMounted) {
                await new Promise(_resolve => {
                    wwLib.$on('wwLib:isMounted', _resolve);
                });
            }
            /* wwFront:end */

            try {
                wwLib.wwPlugins[plugin.name].onLoad && (await wwLib.wwPlugins[plugin.name].onLoad(plugin.settings));
            } catch (err) {
                wwLib.wwLog.error(err);
            }
            wwLib.$store.dispatch('websiteData/updatePlugin', {
                pluginId: plugin.id || plugin.name,
                isLoaded: true,
            });

            resolve();
        });

        this._pluginPromises.push(isLoaded);
    },
    async initPlugins() {
        await this.waitPluginsLoaded();
    },
    async getSettings(pluginId) {
        try {
             /* wwFront:start */
            // eslint-disable-next-line no-unreachable
            return window.wwg_pluginsSettings[pluginId];
            /* wwFront:end */
        } catch (err) {
            wwLib.wwLog.error(err);
            return {};
        }
    },
    async waitPluginsLoaded() {
        return await Promise.all(this._pluginPromises);
    },
    _pluginPromises: [],
};
