<template>
    <component :is="NewParams"
               :params="type.params"
               class="params--nested"
               :path="path"
               v-if="NewParams && type.isData"
               input-mode/>
    <div class="type-input-union" v-else-if="type.isUnion">
        <div class="type-input-union__types">
            <button class="type-input-union__type"
                    :class="{ 'type-input-union--selected': unionType === selectedType }"
                    v-for="unionType in type.unionTypes"
                    :key="unionType.name"
                    @click="selectedType = unionType"
            >
                {{ unionType.name }}
                <span v-if="selectedType === unionType">✅</span>
            </button>
        </div>

        <NewTypeInput :type="selectedType"
                      v-if="selectedType"
                      :path="path"
                      :key="selectedType.name"
        />
    </div>
    <div class="type-input-union type-input-enum" v-else-if="type.isEnum">
        <div class="type-input-union__types">
            <button class="type-input-union__type"
                    :class="{ 'type-input-union--selected': enumValue === selectedEnumValue }"
                    v-for="enumValue in type.enumValues"
                    :key="enumValue"
                    @click="selectedEnumValue = enumValue"
            >
                {{ enumValue }}
                <span v-if="selectedEnumValue === enumValue">✅</span>
            </button>
        </div>
    </div>
    <div class="type-input-array" v-else-if="type.isArray">
        <div class="type-input-array__items" v-if="arrayItemType">
            <div class="type-input-array__item"
                 v-for="(_, i) in new Array(arrayItemsCount).fill(null)"
                 :key="`${i}-${arrayItemsCount}`">
                <div class="type-input-array__item-index">{{ i }}</div>

                <NewTypeInput :path="`${path}:${type.name}[${i}]`"
                              :type="arrayItemType"
                              :param="param"
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

<script lang="ts">
import { defineComponent } from 'vue';
import { ParamDocument, RawTypeDocument, TypeDocument, ValidatorDocument } from '../types';
import NewParams from './NewParams.vue';

type InputValue = string | number | boolean | null | File;

export default defineComponent({
    name: "NewTypeInput",
    props: {
        type: {
            type: Object as () => TypeDocument,
            required: true,
        },
        param: Object as () => ParamDocument,
        path: String,
    },
    data() {
        return {
            selectedEnumValue: null,
            update: 0,
        };
    },
    computed: {
        NewParams() {
            return NewParams;
        },
        validators(): ValidatorDocument[] {
            if (this.type.validators.length) {
                return this.type.validators;
            }

            if (this.param) {
                return this.param.validators;
            }

            return [];
        },
        inputType() {
            if (this.type.isBinary) {
                return "file";
            }

            if (this.type.name === "bool") {
                return "checkbox";
            }

            if (this.type.name === "int" || this.type.name === "float") {
                return "number";
            }

            return "text";
        },
        value: {
            get(): InputValue {
                this.update;

                if (this.type.isFile) {
                    return null;
                }

                return JSON.parse(localStorage.getItem(`${this.path}:${this.type.name}`));
            },
            set(value: InputValue) {
                localStorage.setItem(`${this.path}:${this.type.name}`, JSON.stringify(value));
                this.update++;
            }
        },
        arrayItemsCount() {
            this.update;

            const count = localStorage.getItem(`${this.path}:${this.type.name}[itemsCount]`);

            if (count == null) {
                return 0;
            }

            return Number(count);
        },
        arrayItemType(): TypeDocument | undefined {
            const validatorsType = this.validators
                .find(validator => validator.name === "ArrayOf")?.data?.itemType as TypeDocument;

            if (validatorsType) {
                return validatorsType;
            }

            return this.type.arrayType;
        },
        selectedType: {
            get(): TypeDocument {
                this.update;

                const localTypeName = localStorage.getItem(`${this.path}[selectedType]`);

                if (localTypeName) {
                    const localType = this.type.unionTypes.find(unionType => unionType.name === localTypeName);

                    if (localType) {
                        return localType;
                    }
                }

                return this.type.unionTypes[0];
            },
            set(type: RawTypeDocument) {
                localStorage.setItem(`${this.path}[selectedType]`, type.name);
                this.update++;
            }
        }
    },
    methods: {
        addArrayItem() {
            const count = localStorage.getItem(`${this.path}:${this.type.name}[itemsCount]`);

            if (count == null) {
                localStorage.setItem(`${this.path}:${this.type.name}[itemsCount]`, "1");
            }

            localStorage.setItem(`${this.path}:${this.type.name}[itemsCount]`, String(Number(count) + 1));

            this.update++;
        },
        removeArrayItem(index: number) {
            const size = this.arrayItemsCount;

            const items = { ...localStorage };

            for (let i = index + 1; i <= size; i++) {
                const currPrefix = `${this.path}:${this.type.name}[${i}]`;
                const prevPrefix = `${this.path}:${this.type.name}[${i - 1}]`;

                Object.entries(items).forEach(([k, v]) => {
                    if (k.startsWith(currPrefix)) {
                        const rest = k.substring(currPrefix.length);

                        localStorage.setItem(`${prevPrefix}${rest}`, v);
                    }
                });
            }

            Object.keys(items).forEach((k) => {
                const prefix = `${this.path}:${this.type.name}[${size - 1}]`;

                if (k.startsWith(prefix)) {
                    localStorage.removeItem(k);
                }
            });

            const count = localStorage.getItem(`${this.path}:${this.type.name}[itemsCount]`);
            localStorage.setItem(`${this.path}:${this.type.name}[itemsCount]`, String(Number(count) - 1));

            this.update++;
        },
    },
});
</script>

<style lang="scss">
.type-input {
  width: 100%;

  padding: 0 !important;

  display: flex;

  input {
    width: 100%;

    padding: .5rem 1rem;

    font-size: 1rem;
    font-weight: 500;
    font-family: Inconsolata, monospace;

    border: none;
    outline: none;

    background-color: transparent;

    color: green;
    box-shadow: inset 0 0 0 1px green;

    transition: all 125ms ease;

    &::placeholder {
      font-weight: 500;
      font-family: Inconsolata, monospace;
    }

    &:placeholder-shown {
      box-shadow: none;
    }

    &:focus {
      color: var(--accentColor);
      box-shadow: inset 0 0 0 1px var(--accentColor);
    }
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
  padding: 0 !important;
}

.type-input-union__types {
  display: flex;
}

.type-input-union__type {
  flex: 1 1 100%;

  padding: .1rem .5rem;

  white-space: nowrap;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;

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

.type-input-enum {
  .type-input-union__type {
    padding: .2rem .5rem;
  }
}

.type-input-array {
  width: 100%;

  padding: 0 !important;
}

.type-input-array__items {
  width: 100%;

  display: flex;
  flex-direction: column;
}

.type-input-array__item {
  width: 100%;

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
