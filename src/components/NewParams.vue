<template>
    <div class="params" :class="classes">
        <NewParam v-for="param in params"
                  :key="param.name"
                  :param="param"
                  :path="path"
                  :input-mode="inputMode"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ParamDocument } from '../types';
import NewParam from './NewParam.vue';

export default defineComponent({
    name: "NewParams",
    components: { NewParam },
    props: {
        params: Object as () => ParamDocument[],
        inputMode: Boolean,
        path: String,
    },
    computed: {
        classes() {
            const classes = [];

            if (this.inputMode) {
                classes.push('params--input-mode');
            }

            // classes.push(`params--depth-${this.depth}`);

            return classes;
        },
    },
});
</script>

<style lang="scss">
.params {
  padding: 0 !important;
}

.params--nested {
  border-left: 4px solid var(--borderColor);
}

.params--border {
  border: 1px solid var(--borderColor);
  border-radius: 6px;
}
</style>
