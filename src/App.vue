<template>
  <div class="app" :class="{ invoke: invokeMode }">
    <nav class="methods-list">
      <header class="block-header block-header--bold">
        Methods
      </header>

      <a @click="activeMethod = method" class="methods-list-item" v-for="method in schema?.methods"
         :key="method.name">
        <div class="method-list-item--name">
          {{ method.name }}
        </div>
        <div v-if="method.summary" class="method-list-item--summary">
          {{ method.summary }}
        </div>
      </a>
    </nav>
    <section :key="activeMethod.name" class="method-block" v-if="activeMethod">
      <header class="block-header with-button">
        <button class="back">
          ←
        </button>
        {{ activeMethod.name }}

        <button v-if="invokeMode" @click="invokeMode = false" class="block-header-cancel-button">
          cancel
        </button>

        <button @click="onInvokeClick" class="block-header-invoke-button">
          Invoke
        </button>
      </header>

      <main class="method-block-details">
        <div class="method-block-section-description">
          Description
        </div>
        <section v-html="activeMethod.description.replaceAll('\n', '<br>')"
                 v-if="activeMethod.description"
                 class="method-block-description">
        </section>

        <div class="method-block-section-description">
          Params
        </div>
        <Params class="params--no-corner-borders"
                :path="activeMethod.name"
                :depth="0"
                :input="invokeMode"
                :params="activeMethod.params"/>

        <div class="method-block-section-description">
          Result
        </div>
        <section v-if="activeMethod.resultType" class="method-block-result-type">
          <Type :type="activeMethod.resultType"/>
        </section>
      </main>
    </section>
    <section v-else class="method-block"></section>
    <section class="result-block" :class="{ empty: true }">
      Try to invoke
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Type from './components/Type.vue';
import Params from './components/Params.vue';

interface SchemaDocument {
  methods: MethodDocument[];
}

interface MethodDocument {
}

const schema = ref<SchemaDocument | null>(null);
const activeMethod = ref<MethodDocument | null>(null);
const invokeMode = ref(false);

onMounted(() => {
  fetch('http://localhost:8080/invoke/getSchema')
      .then(r => r.json())
      .then(data => schema.value = data.result);
});

function onInvokeClick() {
  invokeMode.value = true;
}
</script>

<style lang="scss">
@import "@storinka/dropdown/dist/styles/tooltip-light-theme.css";

$button: #eee;

:root {
  --bgColor: white;
  --borderColor: #ddd;
  --mutedColor: #666;
  --textColor: #111;
  --hoverColor: rgba(#eee, .4);
  --typeColor: darkslategray;
  --tagColor: royalblue;
}

// dark
//:root {
//  --bgColor: #111;
//  --borderColor: #222;
//  --mutedColor: #666;
//  --textColor: #999;
//  --hoverColor: rgba(#eee, .4);
//  --typeColor: lightslategray;
//  --tagColor: darkslateblue;
//}

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

* {
  box-sizing: border-box;
}

html {
  height: 100%;
  min-height: 100%;

  color: var(--textColor);
  background-color: var(--bgColor);

  font-family: Inter, sans-serif;
}

h1, h2, h3, h4, h5 {
  color: var(--textColor);
}

input::placeholder {
  font-family: Inter, sans-serif;
}

body {
  height: 100%;

  padding: 0;
  margin: 0;

  //font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

#app {
  height: 100%;
}

.app {
  height: 100%;

  display: grid;
  grid-template-columns: .3fr .4fr .3fr;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.block-header {
  height: 70px;
  width: 100%;

  padding: 0 1rem;

  display: flex;
  align-items: center;

  font-size: 1.2rem;

  border-bottom: 1px solid var(--borderColor);

  &.with-button {
    padding-right: 0;
  }
}

.back {
  display: none;

  margin-right: 1rem;

  border: none;
  background: $button;

  height: 40px;
  width: 40px;

  align-items: center;
  justify-content: center;

  text-align: center;

  font-size: 1.2rem;

  border-radius: 50%;
}

.block-header-invoke-button {
  margin-left: auto;
  height: 100%;

  padding: 0 1rem;

  cursor: pointer;

  color: var(--textColor);
  font-size: 1.2rem;

  border: none;
  background-color: var(--bgColor);

  &:hover {
    background-color: var(--bgColor);
  }

  &:active {
    background-color: var(--bgColor);
  }
}

.block-header-cancel-button {
  margin-left: auto;

  height: 100%;
  padding: 0 1rem;
  cursor: pointer;
  font-size: 1.2rem;
  border: none;

  color: var(--textColor);
  background-color: transparent;
}

.block-header--bold {
  font-weight: bold;
}

.methods-list {
  height: 100%;

  padding: 0;
  margin: 0;

  list-style: none;

  border-right: 1px solid var(--borderColor);

  .methods-list-item {
    padding: 1rem;

    display: flex;
    flex-direction: column;

    font-size: 1.1rem;
    font-weight: 500;

    border-bottom: 1px solid var(--borderColor);

    text-decoration: none;

    color: var(--textColor);

    .methods-list-item--name {
    }

    .method-list-item--summary {
      margin-top: .4rem;

      font-size: .9rem;
      font-weight: normal;

      color: var(--mutedColor);
    }

    &:hover {
      background-color: var(--hoverColor);
      cursor: pointer;
    }
  }
}

.method-block {
  border-right: 1px solid var(--borderColor);
}

.method-block-details {
}

.method-block-description {
  padding: .5rem 1rem;

  border-bottom: 1px solid var(--borderColor);
}

.method-block-section-description {
  padding: .5rem 1rem;

  font-size: .8rem;
  color: var(--mutedColor);

  border-bottom: 1px solid var(--borderColor);
}

.method-block-result-type {
  padding: .5rem 1rem;

  font-weight: 500;
  font-family: Inconsolata, monospace;

  color: var(--typeColor);

  border-bottom: 1px solid var(--borderColor);
}

.method-block-params {
  .method-block-param {
    display: grid;
    grid-template-columns: .5fr .5fr;

    border-bottom: 1px solid var(--borderColor);

    &.method-block-param--data-input {
      display: flex;
      flex-direction: column;
    }

    & > .method-block-params {
      grid-row: 2;
      grid-column: 1/3;

      border-top: 1px solid var(--hoverColor);
      border-bottom: 1px solid var(--hoverColor);

      .method-block-param {
        border-bottom: 1px solid var(--hoverColor);
      }
    }

    .method-block-param__name {
      padding: .5rem 1rem;

      font-weight: 500;
      font-family: Inconsolata, monospace;

      border-right: 1px solid var(--borderColor);
    }

    .method-block-param__type {
      padding: .5rem 1rem;

      font-weight: 500;
      font-family: Inconsolata, monospace;

      &.type-input {
        padding: 0;

        width: 100%;
        height: 100%;
      }

      input {
        width: 100%;
        height: 100%;

        font-weight: 500;
        font-family: Inconsolata, monospace;
        font-size: 1rem;

        padding: .5rem 1rem;
        border: none;

        &::placeholder {
          font-weight: 500;
          font-family: Inconsolata, monospace;
        }
      }
    }
  }
}

.s-dropdown.s-dropdown-tooltip-light-theme {
  background-color: white;

  padding: 0;
  border-radius: 0;

  box-shadow: 2px 2px 10px 0 #eee;
}

.result-block {
  &.empty {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 900px) {
  .back {
    display: flex;
  }

  .method-block {
    display: none !important;
  }

  .result-block {
    display: none !important;
  }
}

.invoke {
  @media (max-width: 900px) {
    .methods-list {
      display: none !important;
    }
  }

  .method-block {
    display: revert !important;

    .block-header-invoke-button {
      background-color: var(--textColor);
      color: white;

      margin-left: revert;

      //&:hover {
      //  background-color: lighten(var(--textColor), 8);
      //}
      //
      //&:active {
      //  background-color: darken(var(--textColor), 2);
      //}
    }
  }

  .result-block {
    display: revert !important;
  }
}
</style>
