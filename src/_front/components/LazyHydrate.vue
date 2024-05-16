<script>
import { defineAsyncComponent, h } from 'vue';
import { mapGetters } from 'vuex';

const never = defineAsyncComponent(() => new Promise(() => {}));

export default {
    props: {
        target: String,
        immediate: Boolean,
        disableHydration: Boolean,
    },
    data() {
        return {
            hydrate: this.immediate,
        };
    },
    computed: {
        ...mapGetters({
            isPrerenderHydration: 'front/getIsPrerenderHydration',
        }),
    },
    render() {
        if (window.__WW_IS_PRERENDER__ || !this.isPrerenderHydration) {
            return this.$slots.default();
        } else {
            if (!this.disableHydration && !this.hydrate && this.target) {
                setTimeout(() => {
                    let targets = document.querySelectorAll(this.target);

                    let options = {
                        root: null,
                        rootMargin: '300px',
                        threshold: 0,
                    };

                    let observer = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting && !this.hydrate) {
                                this.hydrate = true;
                            }
                        });
                    }, options);

                    for (const target of targets) {
                        observer.observe(target);
                    }
                }, 1);
            }

            if (!this.disableHydration && this.hydrate) {
                return this.$slots.default();
            } else {
                return h(never);
            }
        }
    },
};
</script>
