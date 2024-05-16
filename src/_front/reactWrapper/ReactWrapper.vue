<script>
import React from 'react';
import ReactDOM from 'react-dom';

import { h } from 'vue';

export default {
    inheritAttrs: false,
    props: {
        component: undefined,
        content: Object,
    },
    watch: {
        content: {
            handler() {
                this.mountReactComponent(this.component);
            },
            deep: true,
        },
        component: {
            handler(newValue) {
                ReactDOM.unmountComponentAtNode(this.$refs.react);
                this.mountReactComponent(newValue);
            },
        },
    },
    mounted() {
        this.mountReactComponent(this.component);
    },
    beforeUnmount() {
        ReactDOM.unmountComponentAtNode(this.$refs.react);
    },
    methods: {
        mountReactComponent(Component) {
            ReactDOM.render(
                React.createElement(Component, {
                    content: {
                        ...this.content,
                    },
                }),
                this.$refs.react
            );
        },
    },
    render() {
        return h('div', { ref: 'react' });
    },
};
</script>
