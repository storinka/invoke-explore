<template>
    <div class="api-document-section">
        <div class="api-document-section__name" @click="isOpen = !isOpen">
            {{ section.name }} ({{ section.items.length }})

            <span class="arrow" :class="{ 'arrow--open': isOpen }">
                🢒
            </span>
        </div>

        <div class="api-document-section__items" ref="items" :style="{ maxHeight: `${maxHeight}px` }"
             v-if="SectionItem">
            <component :is="SectionItem"
                       @click="activeItem = item"
                       :active="activeItem?.['@type'] === item['@type'] && activeItem?.name === item.name"
                       :item="item"
                       :key="item.name"
                       v-for="item in mappedItems"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SectionItem from './SectionItem.vue';
import { MethodDocument, SectionDocument, TypeDocument } from '../types';
import { apiDocument } from '../apiDocument';

export default defineComponent({
    name: "Section",
    props: {
        section: Object as () => SectionDocument,
        modelValue: Object,
        isFirst: Boolean,
    },
    data() {
        return {
            isOpen: !!this.isFirst,
            maxHeight: 0 as undefined | number,
        };
    },
    computed: {
        SectionItem() {
            return SectionItem;
        },
        activeItem: {
            get(): MethodDocument | TypeDocument {
                return this.modelValue;
            },
            set(activeItem: MethodDocument | TypeDocument) {
                this.$emit("update:modelValue", activeItem);
            },
        },
        mappedItems() {
            return this.section?.items.map(item => {
                if (item['@type'] === 'MethodReferenceDocument') {
                    return apiDocument.value?.availableMethods.find((method) => method.name === item.methodName);
                }

                if (item['@type'] === 'TypeReferenceDocument') {
                    return apiDocument.value?.availableTypes.find((type) => type.uniqueTypeName === item.uniqueTypeName);
                }

                return item;
            });
        }
    },
    mounted() {
        this.resetHeight();
    },
    methods: {
        resetHeight() {
            if (this.isOpen) {
                this.maxHeight = this.$refs.items.scrollHeight;
            } else {
                this.maxHeight = 0;
            }
        }
    },
    watch: {
        "isOpen"() {
            this.resetHeight();
        },
    },
});
</script>

<style lang="scss">
.api-document-section__name {
  position: sticky;
  z-index: 1;

  top: 60px;

  height: 50px;
  width: 100%;

  padding: 0 1rem;

  display: flex;
  align-items: center;

  font-weight: 600;
  font-size: 1rem;

  background-color: var(--bgColor);

  border-bottom: 1px solid var(--borderColor);
}

.api-document-section__items {
  overflow: hidden;

  transition: max-height 250ms ease-in-out;
}
</style>
