<template>
    <div class="param"
         :class="{ 'param--input-mode': inputMode, 'param--complex-mode': complexMode, 'param--open': isOpen }"
    >
        <div class="param__name" @click="close">
            {{ param.name }}
            <span class="param__name-optional" v-if="param.isOptional">optional</span>

            <span class="arrow"
                  :class="{ 'arrow--open': isOpen }"
                  v-if="!param.type.isSimple && inputMode"
            >
                🢒
            </span>
        </div>
        <template v-if="isOpen">
            <component :is="NewTypeInput"
                       v-if="NewTypeInput && inputMode"
                       class="param__type"
                       :type="param.type"
                       :param="param"
                       :is-open="isOpen"
                       :path="`${path}.${param.name}`"
            />
            <component :is="TypeName"
                       v-else-if="TypeName"
                       class="param__type"
                       :type="param.type"
                       :param="param"
            />
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TypeName from './TypeName.vue';
import { ParamDocument } from '../types';
import NewTypeInput from './NewTypeInput.vue';

export default defineComponent({
    name: "NewParam",
    props: {
        param: {
            type: Object as () => ParamDocument,
            required: true,
        },
        inputMode: Boolean,
        path: String,
    },
    data() {
        return {
            isOpen: true,
        };
    },
    computed: {
        NewTypeInput() {
            return NewTypeInput;
        },
        TypeName() {
            return TypeName;
        },
        complexMode() {
            return !this.param.type.isSimple;
        },
    },
    methods: {
        close() {
            if (this.inputMode && !this.param.type.isSimple) {
                this.isOpen = !this.isOpen;
            }
        },
    },
    watch: {
        inputMode() {
            if (!this.inputMode) {
                this.isOpen = true;
            }
        },
    },
});
</script>

<style lang="scss">
.param {
  margin: 0;

  padding: 0;

  display: grid;
  grid-template-columns: .5fr .5fr;

  text-align: left;

  &:last-child {
    > .param__name, > .param__type {
      border-bottom: none;
    }
  }
}

.param__name-optional {
  margin-left: .5ch;

  font-size: .7em;

  text-transform: lowercase;

  color: var(--tagColor);
}

.param__name, .param__type {
  margin: 0;

  padding: .5rem 1rem;

  font-weight: 500;
  font-family: Inconsolata, monospace;

  border-bottom: 1px solid var(--borderColor);
}

.param__name {
  display: flex;
  align-items: center;

  border-right: 1px solid var(--borderColor);
}

.param__type.type-name {
  overflow: auto;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.param--input-mode {
  &.param--complex-mode {
    display: flex;
    flex-direction: column;

    > .param__name {
      border-right: none;
    }

    &.param--open {
      > .param__name {
        border-right: none;
        border-bottom: 1px solid var(--borderColor);
      }
    }
  }
}
</style>
