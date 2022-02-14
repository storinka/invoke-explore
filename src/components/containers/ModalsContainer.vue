<template>
    <component :is="component"
               :key="id"
               v-for="({ id, component, props }) in items"
               v-bind="props"
               @closed="close(id)"
    />
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue';
import { mitter } from '../../apiDocument';

export default defineComponent({
    name: "ModalsContainer",
    data() {
        return {
            last: 0,
            items: [] as { id: number; component: any; props: any; }[],
        };
    },
    created() {
        mitter.on("modal:open", this.onModalOpen);
    },
    beforeDestroy() {
        mitter.off("modal:open", this.onModalOpen);
    },
    methods: {
        onModalOpen({ component, props }: { component: any; props: any; }) {
            this.items.push({
                id: this.last++,
                component: markRaw(component),
                props,
            });
        },
        close(id: number) {
            this.items = this.items.filter((item) => item.id !== id);
        },
    },
});
</script>

<style scoped>

</style>
