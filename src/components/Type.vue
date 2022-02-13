<template>
    <div @click="type.isUnion || isArrayWithType ? undefined : openModal()"
         class="type"
         :class="{ 'type--union': type.isUnion, 'type--no-open': noOpen, 'type--array': isArrayWithType }"
    >
        <template v-if="type.isUnion">
            <template v-for="(subtype, i) in type.unionTypes" :key="subtype.name">
                <Type :validators="actualValidators" :type="subtype"/>
                <span class="type__divider" v-if="i !== type.unionTypes.length - 1">|</span>
            </template>
        </template>
        <template v-else-if="isArrayWithType">
            <span>array</span>
            <span>{{ "<" }}</span>
            <Type :validators="[]" :type="arrayItemType"/>
            <span>{{ ">" }}</span>
        </template>
        <template v-else>
            {{ type.name }}
        </template>

        <Modal v-model="modal" v-if="modal">
            <header class="modal__header">
                <h2 class="modal__title">
                    {{ type.name }}
                </h2>

                <button @click="closeModal" class="modal__close">
                    ×
                </button>
            </header>

            <main class="modal__body">
                <div class="modal__tags">
                    <div class="modal__tag" v-if="type.isBuiltin">Built-in</div>
                    <div class="modal__tag" v-if="type.isData">Data</div>
                    <div class="modal__tag" v-if="type.isUnion">Union</div>
                    <div class="modal__tag" v-if="type.isFile">File</div>
                    <div class="modal__tag" v-if="type.isEnum">Enum</div>
                </div>

                <p class="modal__summary" v-if="type.summary" v-html="type.summary"></p>
                <p class="modal__description" v-if="type.description" v-html="type.description"></p>

                <Params v-if="type.isData" :depth="0" :params="type.params"/>
            </main>
        </Modal>
    </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, ref, toRefs } from 'vue';
import Modal from './Modal.vue';
import Params from './Params.vue';
import { RawTypeDocument, RawValidatorDocument } from '../types';

interface Props {
    type: RawTypeDocument;
    noOpen?: boolean;
    validators: RawValidatorDocument[];
}

const props = defineProps<Props>();
const { type, noOpen, validators } = toRefs(props);

const modal = ref(false);

const openModal = () => modal.value = true;
const closeModal = () => modal.value = false;

const isArray = computed(() => type.value.name === 'array' || type.value.name.startsWith('array<'));
const isArrayWithType = computed(() => type.value.name.startsWith('array<') || actualValidators.value.find(v => v.name === "ArrayOf"));

const actualValidators = computed(() => {
    if (type.value.validators.length) {
        return type.value.validators;
    }

    return validators.value;
})

const arrayItemType = computed(() => {
    return actualValidators.value.find(v => v.name === "ArrayOf")?.data.itemType;
});

</script>

<style lang="scss">
.type {
  display: flex;
  flex-wrap: nowrap;

  font-weight: 500;
  font-family: Inconsolata, monospace;

  color: var(--typeColor);

  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.type--union, .type--array {
  cursor: default;

  &:hover {
    text-decoration: none;
  }
}

.type--no-open {
  pointer-events: none !important;
  text-decoration: none !important;
}

.type__divider {
  margin-left: 1ch;
  margin-right: 1ch;
}
</style>
