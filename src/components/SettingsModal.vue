<template>
  <Modal v-model="isOpen" @closed="$emit('closed', $event)">
    <header class="modal__header">
      <h2 class="modal__title">
        Settings
      </h2>

      <button @click="isOpen = false" class="modal__close">
        ×
      </button>
    </header>

    <main class="modal__body">
      <div class="modal__body-section">
        <div class="api-document-section-block" v-if="true">
          <div class="api-document-section-block__name">
            Global Headers
          </div>
          <Headers class="api-document-section-block__params"
                   :path="apiDocument.name"
                   :input-mode="true"
                   glob
          />
        </div>
      </div>

      <button class="btn" @click="clear">Clear storage</button>
    </main>
  </Modal>
</template>

<script lang="ts">
import Modal from "./Modal.vue";
import { defineComponent } from 'vue';
import Headers from "./Headers.vue";
import { apiDocument } from "../apiDocument";

export default defineComponent({
  name: "SettingsModal",
  components: { Headers, Modal },
  data() {
    return {
      isOpen: true,
    };
  },
  computed: {
    apiDocument() {
      return apiDocument.value;
    },
  },
  methods: {
    clear() {
      if (confirm('Are you sure?')) {
        localStorage.clear();
        window.location.reload();
      }
    },
  },
});
</script>

<style lang="scss">
.btn {
  padding: 10px 20px;

  font-weight: 600;
  font-size: 1rem;

  background-color: var(--darkButtonColor);
  color: var(--bgColor);

  border: none;
  border-radius: 10px;

  cursor: pointer;
}
</style>
