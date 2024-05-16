import { inject, computed } from 'vue';
import { getLayoutStyleFromContent } from '@/_front/helpers/wwLayoutStyle';

export default function useLayoutStyle() {
    const componentContent = inject('componentContent');
    const componentStyle = inject('componentStyle');
    const componentConfiguration = inject('componentConfiguration');

    return computed(() => getLayoutStyleFromContent(componentContent, componentStyle, componentConfiguration));
}
