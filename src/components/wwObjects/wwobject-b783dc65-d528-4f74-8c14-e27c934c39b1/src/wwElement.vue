<template>
    <wwLayout
        class="ww-flexbox"
        path="children"
        :direction="content.direction"
        :inherit-from-element="inheritFromElement"
        :disable-edit="isFixed"
        ww-responsive="wwLayout"
    >
        <template #default="{ item, index, itemStyle }">
            <wwElement
                v-bind="item"
                :extra-style="itemStyle"
                class="ww-flexbox__object"
                :ww-responsive="`wwobject-${index}`"
                @click="onElementClick(item.uid, index)"
            ></wwElement>
        </template>
    </wwLayout>
</template>

<script>
export default {
    props: {
        content: { type: Object, required: true },
        wwElementState: { type: Object, required: true },
    },
    emits: ['update:content:effect', 'update:content', 'element-event'],
    data() {
        return {
            inheritFromElement: ['width', 'display'],
        };
    },
    computed: {
        children() {
            if (!this.content.children || !Array.isArray(this.content.children)) {
                return [];
            }
            return this.content.children;
        },
        isFixed() {
            return this.wwElementState.props.isFixed;
        },
    },
    methods: {
        onElementClick(uid, index) {
            this.$emit('element-event', { type: 'click', uid, index });
        },
    },
};
</script>

<style lang="scss" scoped>
.ww-flexbox {
    display: flex;
}
</style>
