import { inject } from 'vue';
import { evaluateCode, evaluateFormula, getValue } from '@/_common/helpers/code/customCode';

export default {
    getValue,
    useFormula() {
        const bindingContext = inject('bindingContext', null);
        const resolveMappingFormula = (formula, mappingContext = null, defaultValue = null) => {
            const _formula = wwLib.wwLang.getValue(formula);
            if (!_formula || !_formula.code || !_formula.type) return defaultValue;
            const evaluate = _formula.type === 'f' ? evaluateFormula : evaluateCode;
            try {
                const result = evaluate({ code: _formula.code }, { mapping: mappingContext, item: bindingContext });
                return result.value;
            } catch (error) {
                return defaultValue;
            }
        };

        // Experimental
        const resolveMapping = (data, map = {}, defaultMap = {}) => {
            if (!Array.isArray(data) || !map) return [];
            return data.map((rawData, index) => ({
                rawData,
                ...defaultMap,
                ...Object.keys(map).reduce(
                    (result, key) => ({
                        ...result,
                        [key]: this.resolveMappingFormula(map[key], { rawData, index }, defaultMap[key]),
                    }),
                    {}
                ),
            }));
        };
        return { resolveMappingFormula, resolveMapping };
    },
};
