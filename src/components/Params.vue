<template>
  <div class="table"
       :class="classes"
  >
    <div class="tr"
         :class="trClasses(param)"
         v-for="param in params"
         :key="param.name"
    >
      <div class="td td--name">
        {{ param.name }}

        <Type v-if="param.type.isData && input"
              no-open
              :type="param.type"
        />
      </div>
      <div class="td td--type">
        <TypeInput :path="`${path}.${param.name}`"
                   v-if="input"
                   :depth="depth"
                   :type="param.type"
        />
        <Type v-else
              :type="param.type"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, toRefs } from 'vue';
import Type from './Type.vue';
import { ParamDocument } from '../types';
import TypeInput from './TypeInput.vue';

interface Props {
  path?: string;
  params?: ParamDocument[];
  depth: number;
  input?: boolean;
}

const props = defineProps<Props>();
const { params, path, depth, input } = toRefs(props);

const classes = computed(() => {
  const classes = [];

  if (input.value) {
    classes.push('table--input-mode');
  }

  classes.push(`table--depth-${depth.value}`);

  return classes;
});

const trClasses = computed(() => {
  return (param: ParamDocument) => {
    return [
      param.type.isData ? 'tr--data' : undefined,
      param.type.isUnion ? 'tr--union' : undefined,
      `tr--depth-${depth.value}`
    ];
  }
});
</script>

<style lang="scss">
$borderRadius: 6px;

.table {
  width: 100%;

  border-spacing: 0;

  &.table--input-mode {
    .tr:not(:first-child) {
      margin-top: 1rem;
    }

    & > .tr {
      border-top: 1px solid var(--borderColor);
    }

    .td--type {
      padding: 0;
    }

    .td--name {
      border-left: none !important;
    }

    .tr--data, .tr--union {
      display: flex;
      flex-direction: column;

      .td--name {
        display: flex;
        justify-content: space-between;
      }
    }

    .tr--union {
      .td--type {
        border-top: none !important;
      }
    }

    .tr--data > .td--type > .table > .tr:first-child {
      border-top: none !important;
    }

    &.table--data {
      > .tr:last-child {
        &:not(&.tr--data) {
          > .td {
            border-bottom: none !important;
          }
        }
      }
    }
  }

  .type-input {
    padding: 0;

    width: 100%;
    height: 100%;

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

.tr {
  margin: 0;

  padding: 0;

  display: grid;
  grid-template-columns: .5fr .5fr;

  text-align: left;

  &:first-child {
    .td, .th {
      border-top: 1px solid var(--borderColor);

      &:first-child {
        border-radius: $borderRadius 0 0 0;
      }

      &:last-child {
        border-radius: 0 $borderRadius 0 0;
      }
    }
  }

  &:last-child {
    .td, .th {
      &:first-child {
        border-radius: 0 0 0 $borderRadius;
      }

      &:last-child {
        border-radius: 0 0 $borderRadius 0;
      }
    }
  }

  &:only-child {
    .td, .th {
      &:first-child {
        border-radius: $borderRadius 0 0 $borderRadius;
      }

      &:last-child {
        border-radius: 0 $borderRadius $borderRadius 0;
      }
    }
  }
}

.td, .th {
  margin: 0;
  padding: .5rem 1rem;

  border-left: 1px solid var(--borderColor);
  border-bottom: 1px solid var(--borderColor);

  &:last-child {
    border-right: 1px solid var(--borderColor);
  }
}

.td {
  font-weight: 500;
  font-family: Inconsolata, monospace;
}

.params--no-corner-borders {
  .tr:first-child {
    .th, .td {
      border-radius: 0;
      border-top: none;
    }
  }

  .tr:last-child {
    .th, .td {
      border-radius: 0;
    }
  }

  .th:first-child,
  .td:first-child {
    border-left: none;
  }

  .th:last-child,
  .td:last-child {
    border-right: none;
  }
}

.table--input-mode {
  .tr--data.tr--depth-0 {
    border-left: 4px solid lightcoral;
    //background-color: lighten(lightcoral, 25);
  }

  .tr--data.tr--depth-1 {
    border-left: 4px solid lightgreen;
    //background-color: lighten(lightgreen, 20);
  }
}
</style>
