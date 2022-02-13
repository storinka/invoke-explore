<template>
    <div class="type-name"
         @click="type.isArray || type.isUnion ? undefined : open()"
         :class="{ 'type-name--union': type.isUnion, 'type-name--typed-array': arrayItemType }"
    >
        <template v-if="type.isUnion">
            <template v-for="(subtype, i) in type.unionTypes" :key="subtype.name">
                <TypeName :param="param" :type="subtype"/>
                <span class="type-name__divider" v-if="i !== type.unionTypes.length - 1">|</span>
            </template>
        </template>
        <template v-else-if="arrayItemType">
            <span>array</span>
            <span>{{ "<" }}</span>
            <TypeName :type="arrayItemType"/>
            <span>{{ ">" }}</span>
        </template>
        <template v-else>
            {{ type.name }}
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ParamDocument, TypeDocument, ValidatorDocument } from '../types';
import { mitter } from '../apiDocument';
import TypeModal from './TypeModal.vue';

export default defineComponent({
    name: "TypeName",
    props: {
        type: {
            type: Object as () => TypeDocument,
            required: true,
        },
        param: Object as () => ParamDocument,
    },
    computed: {
        validators(): ValidatorDocument[] {
            if (this.type.validators.length) {
                return this.type.validators;
            }

            if (this.param) {
                return this.param.validators;
            }

            return [];
        },
        arrayItemType(): TypeDocument | undefined {
            const validatorsType = this.validators
                .find(validator => validator.name === "ArrayOf")?.data?.itemType as TypeDocument;

            if (validatorsType) {
                return validatorsType;
            }

            return this.type.arrayType;
        },
    },
    methods: {
        open() {
            console.log('emits');

            mitter.emit("modal:open", {
                component: TypeModal,
                props: {
                    type: this.type,
                },
            });
        },
    },
});
</script>

<style lang="scss">
.type-name {
  display: inline-flex;
  flex-wrap: nowrap;

  font-weight: 500;
  font-family: Inconsolata, monospace;

  color: var(--typeColor);

  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.type-name--union, .type-name--typed-array {
  cursor: default;

  &:hover {
    text-decoration: none;
  }
}

.type-name--disabled {
  pointer-events: none !important;
  text-decoration: none !important;
}

.type-name__divider {
  margin-left: 1ch;
  margin-right: 1ch;
}
</style>
