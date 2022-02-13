<template>
    <div class="param header" :class="{ 'header--name-only': !inputMode, 'header--removable': editName && inputMode }">
        <div class="param__name" :class="{ 'type-input': editName }">
            <input type="text" placeholder="Name" v-model="nameValue" v-if="editName">
            <template v-else>
                {{ header.name }}
            </template>
        </div>

        <div v-if="inputMode" class="param__type type-input">
            <input v-model="value" placeholder="Value" type="text">

            <button v-if="editName" class="type-input-array__item-remove" @click="$emit('remove')">×</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { HeaderDocument } from '../types';

export default defineComponent({
    name: "Header",
    emits: ["updateName", "remove"],
    props: {
        header: {
            type: Object as () => HeaderDocument,
            required: true,
        },
        inputMode: Boolean,
        path: String,
        editName: Boolean,
    },
    data() {
        return {
            update: 0,
        };
    },
    computed: {
        value: {
            get() {
                this.update;

                return localStorage.getItem(this.path);
            },
            set(value) {
                localStorage.setItem(this.path, value);

                this.update++;
            },
        },
        nameValue: {
            get() {
                return this.header.name;
            },
            set(value) {
                this.$emit("updateName", value);
            },
        },
    },
});
</script>

<style lang="scss">
.header {
  padding: 0 !important;
}

.header--name-only {
  grid-template-columns: 1fr;

  .param__name {
    border-right: none;
  }
}

.header--removable {
  //display: flex;
}
</style>
