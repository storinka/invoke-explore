<template>
  <div class="start">
    <form @submit.prevent="open">
      <input type="text"
             v-model="documentUrl"
             placeholder="API Document URL">
      <button :disabled="!isValidUrl" class="btn" @click="open">
        Open
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "Start",
  data: () => ({
    documentUrl: '',
  }),
  computed: {
    isValidUrl(): boolean {
      return this.documentUrl.startsWith('http://') || this.documentUrl.startsWith('https://');
    },
  },
  methods: {
    open() {
      this.$router.push({
        name: 'ApiDocument',
        query: {
          url: this.documentUrl,
        },
      });
    },
  },
  mounted() {
    if (window.__storinka_ix_api_document_url__) {
      this.documentUrl = window.__storinka_ix_api_document_url__;
      this.open();
    }
  },
});
</script>

<style lang="scss">
.start {
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  form {
    max-width: 500px;
    width: 100%;

    display: flex;
    flex-direction: column;

    input {
      height: 50px;

      font-size: 1rem;

      border: none;
      border-bottom: 1px solid var(--borderColor);

      outline: none;
    }

    button {
      margin-top: 1rem;

      height: 50px;

      &:disabled {
        opacity: .5;
      }
    }
  }
}
</style>
