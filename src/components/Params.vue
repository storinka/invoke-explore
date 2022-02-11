<template>
    <div class="table"
         :class="classes"
    >
        <Param :param="param"
               :path="path"
               :depth="depth"
               :input="input"
               v-for="param in params"
               :key="param.name"
        />
    </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, toRefs } from 'vue';
import { ParamDocument } from '../types';
import Param from './Param.vue';

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
</script>

<style lang="scss">
$borderRadius: 6px;

.table {
  width: 100%;

  border-spacing: 0;

  &.table--input-mode {
    //.tr:not(:first-child) {
    //  margin-top: 1rem;
    //}
    //
    //& > .tr {
    //  border-top: 1px solid var(--borderColor);
    //}

    .td--type {
      padding: 0;
    }

    .td--name {
      border-left: none !important;
    }

    .tr--data, .tr--union, .tr--array {
      display: flex;
      flex-direction: column;

      .td--name {
        display: flex;

        .type {
          margin-left: auto;
        }
      }
    }

    .tr--array, .tr--union {
      .td__arrow {
        margin-left: auto;
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

    //&.table--data {
    //  > .tr:last-child {
    //    &:not(&.tr--data) {
    //      > .td {
    //        border-bottom: none !important;
    //      }
    //    }
    //  }
    //}

    .td__arrow {
      margin-left: 10px;
      display: flex;
      align-items: center;

      max-height: 16px;

      transform: rotate(90deg);
    }

    .td__arrow--open {
      transform: rotate(-90deg);
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
    > .td--type {
      > .table {
        > .tr {
          border-left: 4px solid deepskyblue;
        }
      }
    }
  }

  .tr--data.tr--depth-1 {
    > .td--type {
      > .table {
        > .tr {
          border-left: 4px solid gold;
        }
      }
    }
  }
}

.td--type {
  overflow: auto;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
