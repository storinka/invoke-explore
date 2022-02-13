<template>
    <Teleport to="body">
        <VueFinalModal esc-to-close v-bind="$attrs">
            <slot/>
        </VueFinalModal>
    </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "Modal",
});
</script>

<style scoped>

</style>
