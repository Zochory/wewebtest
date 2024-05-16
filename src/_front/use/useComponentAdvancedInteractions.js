import { watch, onUnmounted } from 'vue';

export function useComponentAdvancedInteractions(_state) {
    watch(
        () => _state?.id,
        (newId, oldId) => {
            if (newId !== oldId) {
                if (oldId) delete wwLib.scrollStore.componentPositionInfo.value[oldId];
                if (newId && _state?.watchScrollPosition) {
                    wwLib.scrollStore.componentPositionInfo.value[newId] = {};
                }
            }
        }
    );

    watch(
        () => _state?.watchScrollPosition,
        (isActive, wasActive) => {
            if (isActive !== wasActive) {
                if (wasActive && _state?.id) delete wwLib.scrollStore.componentPositionInfo.value[_state.id];
                if (isActive && _state?.id) {
                    wwLib.scrollStore.componentPositionInfo.value[_state.id] = {};
                }
            }
        },
        { immediate: true }
    );

    onUnmounted(() => {
        if (_state?.id) delete wwLib.scrollStore.componentPositionInfo.value[_state.id];
    });
}
