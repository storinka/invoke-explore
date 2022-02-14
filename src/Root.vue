<template>
    <RouterView/>
    <ModalsContainer/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ModalsContainer from './components/containers/ModalsContainer.vue';

export default defineComponent({
    name: "Root",
    components: { ModalsContainer },
});
</script>

<style lang="scss">

</style>
