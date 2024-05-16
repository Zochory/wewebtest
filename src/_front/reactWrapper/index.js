import React from 'react';
import ReactDOM from 'react-dom';

window.React = React;
window.ReactDOM = ReactDOM;

import ReactWrapper from './ReactWrapper';

import { h } from 'vue';

export default function reactWrapper(component) {
    return {
        components: { ReactWrapper },
        inheritAttrs: false,
        render() {
            return h(ReactWrapper, {
                component,
                ...$attrs,
            });
        },
    };
}
