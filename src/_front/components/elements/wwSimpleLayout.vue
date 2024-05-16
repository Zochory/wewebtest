<template>
    <component :is="tag" :style="layoutStyle">
        <slot></slot>
    </component>
</template>

<script>
import useLayoutStyle from '@/_front/use/useLayoutStyle';

export default {
    props: {
        tag: { type: String, default: 'div' },
    },
    setup() {
        return {
            layoutStyle: useLayoutStyle(),
        };
    },
};
</script>
