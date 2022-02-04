<template>
  <Params :params="type.params"
          v-if="type.isData"
          :depth="depth + 1"
          input
          :class="[type.isData ? 'table--data' : undefined, type.isUnion ? 'table--union' : undefined]"
          :path="`${path}.${type.name}`"/>
  <div class="type-input-union" v-else-if="type.isUnion">
    <div class="type-input-union__types">
      <button class="type-input-union__type"
              :class="{ 'type-input-union--selected': subtype === selectedType }"
              v-for="subtype in type.subtypes"
              :key="subtype.name"
              @click="selectedType = subtype"
      >
        {{ subtype.name }}
        <span v-if="selectedType === subtype">
          ✅
        </span>
      </button>
    </div>

    <TypeInput :type="selectedType"
               :key="selectedType.name"
               :path="path"
               :depth="depth"/>
  </div>
  <div class="type-input" :class="`type-input--${inputType}`" v-else>
    <input :disabled="type.name === 'null'"
           :type="inputType"
           :id="type.name"
           :placeholder="type.name === 'null' ? 'NULL' : type.name"
           v-model="value"
           :class="{ null: type.name === 'null' }"
    >
    <div class="type-input-bool"
         :class="`type-input-bool--${value}`"
         v-if="type.name === 'bool' && type.name !== 'null'"
    >
      <button class="type-input-bool__false" @click="value = false">false</button>
      <button class="type-input-bool__true" @click="value = true">true</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { TypeDocument } from '../types';
import { computed, defineProps, ref, toRefs } from 'vue';
import Params from './Params.vue';

type InputValue = string | number | boolean | null | File;

interface Props {
  type: TypeDocument;
  path?: string;
  depth: number;
}

const props = defineProps<Props>();
const { type, path, depth } = toRefs(props);

const inputType = computed(() => {
  if (type.value.isFile) {
    return "file";
  }

  if (type.value.name === "bool") {
    return "checkbox";
  }

  if (type.value.name === "int" || type.value.name === "float") {
    return "number";
  }

  return "text";
});

const update = ref(0);

const value = computed({
  get(): InputValue {
    update.value;

    if (type.value.isFile) {
      return null;
    }

    return JSON.parse(localStorage.getItem(`${path.value}:${type.value.name}`));
  },
  set(value: InputValue) {
    localStorage.setItem(`${path.value}:${type.value.name}`, JSON.stringify(value));
    update.value++;
  }
});

const selectedType = computed({
  get(): TypeDocument {
    update.value;

    const localTypeName = localStorage.getItem(`${path.value}[selectedType]`);

    if (localTypeName) {
      const localType = type.value.subtypes.find(subtype => subtype.name === localTypeName);

      if (localType) {
        return localType;
      }
    }

    return type.value.subtypes[0];
  },
  set(type: TypeDocument) {
    localStorage.setItem(`${path.value}[selectedType]`, type.name);
    update.value++;
  }
});
</script>

<style scoped lang="scss">
.type-input {
  input {
    color: green;
    background-color: transparent;

    outline: none;

    &.null {
      &::placeholder {
        color: yellowgreen;
      }
    }
  }

  label {
    display: none;
  }
}

.type-input--checkbox {
  input {
    display: none;
  }
}

.type-input-bool {
  width: 100%;
  height: 100%;

  padding: .5rem 1rem;

  display: flex;
  align-items: center;

  button {
    border: none;

    background-color: var(--mutedColor);
    color: var(--bgColor);

    cursor: pointer;

    transition: all 250ms ease;
  }

  .type-input-bool__false {
    border-radius: 4px 0 0 4px;
  }

  .type-input-bool__true {
    border-radius: 0 4px 4px 0;
  }

  &.type-input-bool--true {
    .type-input-bool__true {
      background-color: limegreen;
    }
  }

  &.type-input-bool--false {
    .type-input-bool__false {
      background-color: indianred;
    }
  }
}

.type-input-union__types {
  display: flex;
}

.type-input-union__type {
  flex: 1 1 100%;

  padding: .1rem .5rem;

  border: none;
  border-bottom: 1px solid var(--borderColor);

  transition: all 250ms ease;

  cursor: pointer;

  background-color: var(--bgColor);
  color: var(--textColor);

  &:not(:last-child) {
    border-right: 1px solid var(--borderColor);
  }
}

.type-input-union--selected {
  background-color: var(--borderColor);
  cursor: default;
}
</style>
