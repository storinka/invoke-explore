<template>
  <div class="api-document-section">
    <div class="api-document-section__name" @click="isOpen = !isOpen">
      {{ section.name }} ({{ mappedItems.length }})

      <span class="arrow" :class="{ 'arrow--open': isOpen }">
                ⧁
            </span>
    </div>

    <div class="api-document-section__items" ref="items" :style="{ maxHeight: `${maxHeight}px` }"
         v-if="SectionItem">
      <component :is="SectionItem"
                 @click="setActiveItem(item)"
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
import { apiDocument, isSearching, searchQuery } from '../apiDocument';

export default defineComponent({
  name: "Section",
  props: {
    section: Object as () => SectionDocument,
    modelValue: Object,
    isFirst: Boolean,
  },
  setup() {
    return { searchQuery, isSearching };
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
      }).filter((item) => {
        if (this.isSearching && item) {
          const checkName = () => item.name.toLowerCase().includes(this.searchQuery.toLowerCase());
          const checkSummary = () => item.summary.toLowerCase().includes(this.searchQuery.toLowerCase());

          if (item.name && item.summary) {
            return checkName() || checkSummary();
          }

          if (item.name) {
            return checkName();
          }
        }

        return true;
      });
    }
  },
  mounted() {
    this.resetHeight();

    if (this.$route.query.item) {
      const [itemName, itemType] = String(this.$route.query.item).split(':');

      this.mappedItems?.forEach((item) => {
        if (item) {
          if (item['@type'] === itemType && item.name === itemName) {
            this.setActiveItem(item);

            setTimeout(() => {
              document.querySelector('.api-document__sections').scrollTo({
                top: document.querySelector('.api-document-section-item.api-document-section-item--active')?.offsetTop - 200,
                behavior: "smooth"
              });
            }, 500);
          }
        }
      });
    }
  },
  methods: {
    resetHeight() {
      if (this.isOpen) {
        this.maxHeight = this.$refs.items.scrollHeight;
      } else {
        this.maxHeight = 0;
      }
    },
    setActiveItem(item: any) {
      this.activeItem = item;

      this.$router.push({
        query: {
          ...this.$route.query,
          item: `${item.name}:${item['@type']}`,
        },
      });
    },
  },
  watch: {
    "isOpen"() {
      this.resetHeight();
    },
    "searchQuery"() {
      this.$nextTick(() => {
        this.resetHeight();
      });
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
