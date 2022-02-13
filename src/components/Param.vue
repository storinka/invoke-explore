<template>
    <div class="tr"
         :class="trClasses"
    >
        <div class="td td--name" @click="hide">
            {{ param.name }}

            <Type v-if="(param.type.isData || param.type.isEnum) && input"
                  no-open
                  :validators="param.validators"
                  :type="param.type"
            />
            <div class="td__arrow" :class="{ 'td__arrow--open': isOpen }"
                 v-if="(param.type.isData || isArray || param.type.isUnion || param.type.isEnum) && input">🢒
            </div>
        </div>
        <div class="td td--type" v-if="!input || isOpen">
            <TypeInput :path="`${path}.${param.name}`"
                       v-if="input"
                       :depth="depth"
                       :type="param.type"
                       :validators="param.validators"
            />
            <Type v-else
                  :validators="param.validators"
                  :type="param.type"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue';
import { RawParamDocument } from '../types';
import Type from './Type.vue';
import TypeInput from './TypeInput.vue';

interface Props {
    path?: string;
    param: RawParamDocument;
    depth: number;
    input?: boolean;
}

const props = defineProps<Props>();
const { param, path, depth, input } = toRefs(props);

const isOpen = ref(true);

const isArray = computed(() => param.value.type.name === 'array' || param.value.type.name.startsWith('array<'));

const trClasses = computed(() => {
    return [
        param.value.type.isData || param.value.type.isEnum ? 'tr--data' : undefined,
        param.value.type.isUnion ? 'tr--union' : undefined,
        isArray.value ? 'tr--array' : undefined,
        `tr--depth-${depth.value}`
    ];
});

const hide = () => {
    if (param.value.type.isData || isArray.value || param.value.type.isUnion || param.value.type.isEnum) {
        isOpen.value = !isOpen.value;
    }
}
</script>

<style>

</style>
