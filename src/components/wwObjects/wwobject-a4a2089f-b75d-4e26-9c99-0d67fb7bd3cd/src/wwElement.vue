<template>
    <div class="ww-input-verification-code-container">
        <wwElement
            class="ww-input-verification-code"
            v-for="(_, index) of Array(content.nbrOfCode)"
            :key="index"
            :ref="`ww-input-verification-code-${index}`"
            v-bind="content.input"
            @keydown.backspace="backspace(index)"
            :ww-props="{ value: localValue[index] || ' '}"
            @element-event="onChange(index, $event)"
        />
    </div>
</template>

<script>
export default {
    props: {
        uid: { type: String, required: true },
        content: { type: Object, required: true },
    },
    emits: ['trigger-event'],
    setup(props) {
        const { value, setValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'value',
            defaultValue: '',
            componentType: 'element',
            type: 'string',
            readonly: true,
            resettable: true,
        });
        return { value, setValue };
    },
    data() {
        return {
            localValue: '',
        };
    },
    computed: {
        isEditing() {
            // eslint-disable-next-line no-unreachable
            return false;
        },
        isComplete() {
            return this.localValue.split('').filter(char => char !== ' ').length >= this.content.nbrOfCode;
        },
    },
    watch: {
        isComplete(value) {
            if (!value) return;
            this.$emit('trigger-event', { name: 'complete', event: { value: this.localValue.trim() } });
        },
    },
    methods: {
        replaceAt(str, index, replacement) {
            return str.substring(0, index) + replacement + str.substring(index + replacement.length);
        },
        focusInput(index) {
            let input = this.$refs[`ww-input-verification-code-${index}`]?.componentRef || this.$refs[`ww-input-verification-code-${index}`]?.[0]?.componentRef;
            try {
                debugger;
                input.focusInput();
            } catch {
                wwLib.wwLog.warn('WARNING [INPUT-CODE], failed to focus input');
            }
        },
        onChange(index, { value, type }) {
            if (type !== 'update:value') return;
            value = value === null || value === undefined ? '' : `${value}`;
            value = value.trim();
            if (!value.length) {
                value = ' ';
            } else {
                const newFocusIndex = Math.min(this.content.nbrOfCode - 1, index + value.length);
                if (index !== newFocusIndex) {
                    this.focusInput(newFocusIndex);
                }
            }
            let newValue = this.replaceAt(`${this.localValue}`, index, value).substring(0, this.content.nbrOfCode);
            newValue = newValue.trim();
            this.localValue = '';

            this.$nextTick( () => {
                this.localValue = newValue;
                this.setValue(`${this.localValue}`);
                this.$emit('trigger-event', { name: 'change', event: { value: `${this.localValue}` } });
            })
        },
        backspace(index) {
            if (index && (this.localValue[index] === ' ' || this.localValue[index] === undefined))
                this.$nextTick(() => this.focusInput(index - 1));
        },
    },
};
</script>

<style lang="scss">
.ww-input-verification-code {
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    /* Firefox */
    input[type='number'] {
        -moz-appearance: textfield;
    }
    &-container {
        display: flex;
    }
}
</style>
