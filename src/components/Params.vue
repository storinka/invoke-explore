<template>
    <div class="params"
         :class="classes"
    >
        <Param :param="param"
               :path="path"
               :depth="depth"
               :input="inputMode"
               v-for="param in params"
               :key="param.name"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ParamDocument } from '../types';
import Param from './Param.vue';

export default defineComponent({
    name: "Params",
    components: { Param },
    props: {
        path: String,
        params: Object as () => ParamDocument[],
        depth: Number,
        inputMode: Boolean,
    },
    computed: {
        classes() {
            const classes = [];

            if (this.inputMode) {
                classes.push('params--input-mode');
            }

            classes.push(`params--depth-${this.depth}`);

            return classes;
        },
    },
});
</script>

<style lang="scss">
$borderRadius: 6px;

.params {
  width: 100%;

  border-spacing: 0;

  &.params--input-mode {
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

    .tr--data > .td--type > .params > .tr:first-child {
      border-top: none !important;
    }

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

.params--input-mode {
  .tr--data.tr--depth-0 {
    > .td--type {
      > .params {
        > .tr {
          border-left: 4px solid deepskyblue;
        }
      }
    }
  }

  .tr--data.tr--depth-1 {
    > .td--type {
      > .params {
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
