<template>
    <Params :params="type.params"
            v-if="type.isData"
            :depth="depth + 1"
            input
            :class="[type.isData ? 'table--data' : undefined, type.isUnion ? 'table--union' : undefined, isArray ? 'table--array' : undefined]"
            :path="`${path}.${type.name}`"/>
    <div class="type-input-union" v-else-if="type.isUnion">
        <div class="type-input-union__types">
            <button class="type-input-union__type"
                    :class="{ 'type-input-union--selected': subtype === selectedType }"
                    v-for="subtype in type.unionTypes"
                    :key="subtype.name"
                    @click="selectedType = subtype"
            >
                {{ subtype.name }}
                <span v-if="selectedType === subtype">✅</span>
            </button>
        </div>

        <TypeInput :type="selectedType"
                   :key="selectedType.name"
                   :path="path"
                   :validators="actualValidators"
                   :depth="depth"/>
    </div>
    <div class="type-input-array" v-else-if="isArray">
        <div class="type-input-array__items" v-if="arrayItemType">
            <div class="type-input-array__item"
                 v-for="(_, i) in new Array(arrayItemsCount).fill(null)"
                 :key="`${i}-${arrayItemsCount}`">
                <div class="type-input-array__item-index">{{ i }}</div>

                <TypeInput :path="`${path}:${type.name}[${i}]`"
                           :type="arrayItemType"
                           :validators="actualValidators"
                           :depth="depth"
                />

                <button @click="removeArrayItem(i)" class="type-input-array__item-remove">×</button>
            </div>
        </div>
        <button class="type-input-array__add-button" @click="addArrayItem">+</button>
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
import { TypeDocument, ValidatorDocument } from '../types';
import { computed, defineProps, ref, toRefs } from 'vue';
import Params from './Params.vue';

type InputValue = string | number | boolean | null | File;

interface Props {
    type: TypeDocument;
    path?: string;
    depth: number;
    validators: ValidatorDocument[];
}

const props = defineProps<Props>();
const { type, path, depth, validators } = toRefs(props);

const actualValidators = computed(() => {
    if (type.value.validators.length) {
        console.log(type.value, type.value.validators, validators.value)
        return type.value.validators;
    }

    return validators.value;
})

const update = ref(0);

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

const isArray = computed(() => type.value.name === 'array' || type.value.name.startsWith('array<'));

const selectedType = computed({
    get(): TypeDocument {
        update.value;

        const localTypeName = localStorage.getItem(`${path.value}[selectedType]`);

        if (localTypeName) {
            const localType = type.value.unionTypes.find(subtype => subtype.name === localTypeName);

            if (localType) {
                return localType;
            }
        }

        return type.value.unionTypes[0];
    },
    set(type: TypeDocument) {
        localStorage.setItem(`${path.value}[selectedType]`, type.name);
        update.value++;
    }
});

const arrayItemsCount = computed(() => {
    update.value;

    const count = localStorage.getItem(`${path.value}:${type.value.name}[itemsCount]`);

    if (count == null) {
        return 0;
    }

    return Number(count);
});

const arrayItemType = computed(() => {
    return actualValidators.value.find(v => v.name === "ArrayOf")?.data.itemType;
});

const addArrayItem = () => {
    const count = localStorage.getItem(`${path.value}:${type.value.name}[itemsCount]`);

    if (count == null) {
        localStorage.setItem(`${path.value}:${type.value.name}[itemsCount]`, "1");
    }

    localStorage.setItem(`${path.value}:${type.value.name}[itemsCount]`, String(Number(count) + 1));

    update.value++;
}

const removeArrayItem = (index: number) => {
    const size = arrayItemsCount.value;

    const items = { ...localStorage };

    for (let i = index + 1; i <= size; i++) {
        const currPrefix = `${path.value}:${type.value.name}[${i}]`;
        const prevPrefix = `${path.value}:${type.value.name}[${i - 1}]`;

        Object.entries(items).forEach(([k, v]) => {
            if (k.startsWith(currPrefix)) {
                const rest = k.substring(currPrefix.length);

                localStorage.setItem(`${prevPrefix}${rest}`, v);
            }
        });
    }

    Object.keys(items).forEach((k) => {
        const prefix = `${path.value}:${type.value.name}[${size - 1}]`;

        if (k.startsWith(prefix)) {
            localStorage.removeItem(k);
        }
    });

    const count = localStorage.getItem(`${path.value}:${type.value.name}[itemsCount]`);
    localStorage.setItem(`${path.value}:${type.value.name}[itemsCount]`, String(Number(count) - 1));

    update.value++;
}
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

.type-input-union {
  display: flex;
  flex-direction: column;
}

.type-input-union__types {
  display: flex;
}

.type-input-union__type {
  flex: 1 1 100%;

  padding: .1rem .5rem;

  display: flex;
  align-items: center;
  justify-content: center;

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

.type-input-array__item {
  display: flex;
  align-items: center;

  border-bottom: 1px solid var(--borderColor);

  .type-input-array__item-remove {
    all: unset;

    width: 20px;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: red;
    color: white;
  }

  .type-input-array__item-index {
    width: 20px;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  > .type-input-union {
    width: 100%;
  }

  > .type-input,
  > .type-input-union {
    border-left: 1px solid var(--borderColor);
    border-right: 1px solid var(--borderColor);
  }
}

.type-input-array__add-button {
  all: unset;

  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition: all 250ms ease;

  &:hover {
    background-color: var(--borderColor);
  }
}
</style>
