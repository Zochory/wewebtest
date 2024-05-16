import { watch } from 'vue';

function WatchersFactory() {
    function register(dependencies, fn) {
        return watch(dependencies, fn);
    }

    return {
        register,
    };
}

export default WatchersFactory();
