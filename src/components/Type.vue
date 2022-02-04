<template>
  <div @click="type.isUnion ? undefined : openModal()"
       class="type"
       :class="{ 'type--union': type.isUnion, 'type--no-open': noOpen }"
  >
    <template v-if="type.isUnion">
      <template v-for="(subtype, i) in type.subtypes" :key="subtype.name">
        <Type :type="subtype"/>
        <span class="type__divider" v-if="i !== type.subtypes.length - 1">|</span>
      </template>
    </template>
    <template v-else>
      {{ type.name }}
    </template>

    <Modal v-model="modal">
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
import { TypeDocument } from '../types';

interface Props {
  type: TypeDocument;
  noOpen?: boolean;
}

const props = defineProps<Props>();
const { type, noOpen } = toRefs(props);

const modal = ref(false);

const openModal = () => modal.value = true;
const closeModal = () => modal.value = false;

const genericTypes = computed(() => type.value.validations.find(v => v.name === 'ArrayOf'));
</script>

<style lang="scss">
.type {
  font-weight: 500;
  font-family: Inconsolata, monospace;

  color: var(--typeColor);

  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.type--union {
  display: flex;
  flex-wrap: nowrap;

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
