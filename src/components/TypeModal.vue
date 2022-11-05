<template>
    <component :is="Modal" v-if="Modal" v-model="isOpen" @closed="$emit('closed', $event)">
        <header class="modal__header">
            <h2 class="modal__title">
                {{ type.name }}
            </h2>

            <button @click="isOpen = false" class="modal__close">
                ×
            </button>
        </header>

        <main class="modal__body">
            <div class="modal__tags">
                <div class="modal__tag" v-if="type.isSimple">Simple</div>
                <div class="modal__tag" v-if="type.isData">Data</div>
                <div class="modal__tag" v-if="type.isUnion">Union</div>
                <div class="modal__tag" v-if="type.isBinary">Binary</div>
                <div class="modal__tag" v-if="type.isEnum">Enum</div>
            </div>

            <p class="modal__summary" v-if="type.summary" v-html="type.summary"></p>
            <p class="modal__description" v-if="type.description" v-html="type.description"></p>

            <component :is="NewParams"
                       v-if="NewParams && type.isData"
                       :params="type.params"
                       class="params--border"
            />
        </main>
    </component>
</template>

<script lang="ts">
import Modal from "./Modal.vue";
import { defineComponent } from 'vue';
import { TypeDocument } from '../types';
import NewParams from './NewParams.vue';

export default defineComponent({
    name: "TypeModal",
    components: {},
    props: {
        type: {
            type: Object as () => TypeDocument,
            required: true,
        },
    },
    data() {
        return {
            isOpen: true,
        };
    },
    computed: {
        NewParams() {
            return NewParams;
        },
        Modal() {
            return Modal;
        },
    },
});
</script>

<style lang="scss">
.vfm__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.vfm__content {
  width: 100%;
  max-width: 800px;

  padding: 24px;

  background-color: var(--bgColor);
  border-radius: 24px;
}

.modal__title {
  margin: 0;

  font-weight: 500;
  font-family: Inconsolata, monospace;
}

.modal__header {
  display: flex;
  align-items: center;
}

.modal__close {
  margin-left: auto;

  font-size: 1.5rem;

  background-color: var(--bgColor);
  color: var(--textColor);
  border: none;

  cursor: pointer;

  &:hover {
    color: #333;
  }
}

.modal__header + .modal__body {
  margin-top: 12px;
}

.modal__tags + .modal__body {
  margin-top: 24px;
}

.modal__tags {
  display: flex;
  flex-wrap: wrap;
}

.modal__tag {
  padding: 4px 8px;

  color: var(--bgColor);

  font-weight: 500;
  font-size: .8rem;

  border-radius: 25px;
  background-color: var(--tagColor);
}

.modal__tag + .modal__tag {
  margin-left: 4px;
}

.modal__summary,
.modal__description {
  margin: 0;
}

.modal__summary {
  font-weight: 500;
  color: var(--mutedColor);
}

.modal__body > * {
  margin-top: 12px;
}

.modal__body-section {
  border: 1px solid var(--borderColor);
  border-radius: 6px;
}
</style>
