<template>
    <Teleport to="body">
        <VueFinalModal v-bind="$attrs">
            <slot/>
        </VueFinalModal>
    </Teleport>
</template>

<script setup lang="ts">
</script>

<style scoped>

</style>
