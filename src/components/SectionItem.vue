<template>
    <component :is="Section"
               :section="actualItem"
               v-if="Section && actualItem['@type'] === 'SectionDocument'"
    />
    <div class="api-document-section-item"
         v-else
         :class="{ 'api-document-section-item--active': active }"
    >
        <div class="api-document-section-item__name">
            {{ actualItem.name }}
        </div>
        <div class="api-document-section-item__summary" v-if="actualItem.summary">
            {{ actualItem.summary }}
        </div>

        <div class="api-document-section-item__type">
            {{ type }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    IframeDocument,
    MarkdownDocument,
    MethodDocument,
    MethodReferenceDocument,
    SectionDocument,
    TypeDocument
} from '../types';
import Section from './Section.vue';
import { apiDocument } from '../apiDocument';

export default defineComponent({
    name: "SectionItem",
    props: {
        item: {
            type: Object as () => TypeDocument | MethodDocument | SectionDocument | IframeDocument | MarkdownDocument | MethodReferenceDocument,
            required: true,
        },
        active: Boolean,
    },
    computed: {
        Section() {
            return Section;
        },
        actualItem() {
            if (this.item['@type'] === 'MethodReferenceDocument') {
                return apiDocument.value?.availableMethods.find((method) => method.name === this.item.methodName);
            }

            return this.item;
        },
        type() {
            return this.actualItem["@type"].substring(0, this.actualItem["@type"].length - "Document".length);
        },
    },
});
</script>

<style lang="scss">
.api-document-section-item {
  position: relative;

  padding: .6em 1rem;

  display: flex;
  flex-direction: column;

  font-size: 1rem;
  font-weight: 500;

  text-decoration: none;

  background-color: var(--bgColor);
  color: var(--textColor);

  border-bottom: 1px solid var(--borderColor);

  transition: all 125ms ease;

  &:not(&--active) {
    &:hover {
      background-color: var(--hoverColor);

      cursor: pointer;
    }

    &:active {
      background-color: var(--activeColor);

      cursor: pointer;
    }
  }

  &:last-child {
    border-bottom: 1px solid var(--borderColor);
  }
}

.api-document-section-item__name {
}

.api-document-section-item__summary {
  margin-top: .2rem;

  font-size: .8rem;
  font-weight: normal;

  color: var(--mutedColor);

  transition: all 125ms ease;
}

.api-document-section-item--active {
  background-color: var(--accentColor);
  color: var(--bgColor);

  cursor: default;

  .api-document-section-item__summary {
    color: var(--bgColor);
  }

  .api-document-section-item__type {
    color: var(--bgColor);
  }
}

.api-document-section-item:first-child {
  box-shadow: inset 0px 11px 8px -10px rgba(#333, .1);
}

.api-document-section-item:last-child {
  box-shadow: inset 0px -11px 8px -10px rgba(#333, .1);
}

.api-document-section-item__type {
  position: absolute;

  top: .6rem;
  right: 1rem;

  font-size: .5rem;

  text-transform: uppercase;

  color: var(--accentColor);

  transition: all 125ms ease;
}
</style>
