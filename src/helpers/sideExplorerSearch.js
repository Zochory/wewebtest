import { ref } from 'vue';

const SEARCH_MATCHES = ref([]);

export const sideExplorerSearchMatches = () => {
    const populateSearchMatches = () => {
        SEARCH_MATCHES.value.push(true);
    };

    const resetMatches = () => {
        SEARCH_MATCHES.value = [];
    };

    return {
        searchMatches: SEARCH_MATCHES,
        populateSearchMatches,
        resetMatches,
    };
};
