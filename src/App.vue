<template>
    <div class="app" :class="{ invoke: invokeMode }">
        <nav class="methods-list">
            <header class="block-header block-header--bold">
                Methods
            </header>

            <a @click="activeMethod = method" class="methods-list-item" v-for="method in schema?.methods"
               :key="method.name">
                <div class="method-list-item--name">
                    {{ method.name }}
                </div>
                <div v-if="method.summary" class="method-list-item--summary">
                    {{ method.summary }}
                </div>
            </a>
        </nav>
        <section :key="activeMethod.name" class="method-block" v-if="activeMethod">
            <header class="block-header with-button">
                <button class="back">
                    ←
                </button>
                {{ activeMethod.name }}

                <button v-if="invokeMode" @click="invokeMode = false" class="block-header-cancel-button">
                    cancel
                </button>

                <button @click="onInvokeClick" class="block-header-invoke-button">
                    Invoke
                </button>
            </header>

            <main class="method-block-details">
                <div class="method-block-section-description">
                    Description
                </div>
                <section v-if="activeMethod.description" class="method-block-description">
                    {{ activeMethod.description }}
                </section>

                <div class="method-block-section-description">
                    Params
                </div>
                <section v-if="activeMethod.params.length" class="method-block-params">
                    <SDropdown v-for="param in activeMethod.params"
                               :key="param.name"
                               hover
                               :is-enabled="!!param.type.params.length"
                               theme="tooltip-light"
                               align="center"
                    >
                        <template #toggle="{ name }">
                            <div class="method-block-param">
                                <div class="method-block-param--name">
                                    {{ param.name }}
                                </div>
                                <div class="method-block-param--type input" v-if="invokeMode && !param.type.isData">
                                    <input type="text" :placeholder="param.type.name">
                                </div>
                                <div v-s-dropdown-toggle:[name] v-else class="method-block-param--type"
                                     :class="{ params: param.type.params.length }">
                                    {{ param.type.name }}
                                </div>

                                <div class="method-block-params" v-if="invokeMode && param.type.isData">
                                    <div class="method-block-param" v-for="p in param.type.params">
                                        <div class="method-block-param--name">
                                            {{ p.name }}
                                        </div>
                                        <div class="method-block-param--type input" v-if="!p.type.isData">
                                            <input type="text" :placeholder="p.type.name">
                                        </div>
                                        <div v-s-dropdown-toggle:[name] v-else class="method-block-param--type"
                                             :class="{ params: p.type.params.length }">
                                            {{ p.type.name }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <ParamsTable :params="param.type.params"/>
                    </SDropdown>
                </section>

                <div class="method-block-section-description">
                    Result
                </div>
                <section v-if="activeMethod.resultType" class="method-block-result-type">
                    {{ activeMethod.resultType.name }}
                </section>
            </main>
        </section>
        <section v-else class="method-block"></section>
        <section class="result-block" :class="{ empty: true }">
            Try to invoke
        </section>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SDropdown from '@storinka/dropdown'
import ParamsTable from './components/ParamsTable.vue';

interface InvokeSchema {
    methods: InvokeMethod[];
}

interface InvokeMethod {
}

const schema = ref<InvokeSchema | null>(null);
const activeMethod = ref<InvokeMethod | null>(null);
const invokeMode = ref(false);

onMounted(() => {
    fetch('http://localhost:8080')
        .then(r => r.json())
        .then(data => schema.value = data.result);
});

function onInvokeClick() {
    invokeMode.value = true;
}
</script>

<style lang="scss">
@import "@storinka/dropdown/dist/styles/tooltip-light-theme.css";

$border: #ddd;
$muted: #666;
$text: #111;
$hover: rgba(#eee, .4);
$button: #eee;

* {
    box-sizing: border-box;
}

html {
    height: 100%;
    min-height: 100%;

    color: $text;

    font-family: Inter, sans-serif;
}

input::placeholder {
    font-family: Inter, sans-serif;
}

body {
    height: 100%;

    padding: 0;
    margin: 0;

    //font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

#app {
    height: 100%;
}

.app {
    height: 100%;

    display: grid;
    grid-template-columns: .3fr .4fr .3fr;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
}

.block-header {
    height: 70px;
    width: 100%;

    padding: 0 1rem;

    display: flex;
    align-items: center;

    font-size: 1.2rem;

    border-bottom: 1px solid $border;

    &.with-button {
        padding-right: 0;
    }
}

.back {
    display: none;

    margin-right: 1rem;

    border: none;
    background: $button;

    height: 40px;
    width: 40px;

    align-items: center;
    justify-content: center;

    text-align: center;

    font-size: 1.2rem;

    border-radius: 50%;
}

.block-header-invoke-button {
    margin-left: auto;
    height: 100%;
    padding: 0 1rem;
    cursor: pointer;
    font-size: 1.2rem;
    border: none;
    background-color: $button;

    &:hover {
        background-color: lighten($button, 1);
    }

    &:active {
        background-color: darken($button, 1);
    }
}

.block-header-cancel-button {
    margin-left: auto;

    height: 100%;
    padding: 0 1rem;
    cursor: pointer;
    font-size: 1.2rem;
    border: none;

    background-color: transparent;
}

.block-header--bold {
    font-weight: bold;
}

.methods-list {
    height: 100%;

    padding: 0;
    margin: 0;

    list-style: none;

    border-right: 1px solid $border;

    .methods-list-item {
        padding: 1rem;

        display: flex;
        flex-direction: column;

        font-size: 1.1rem;
        font-weight: 500;

        border-bottom: 1px solid $border;

        text-decoration: none;

        color: $text;

        .methods-list-item--name {
        }

        .method-list-item--summary {
            font-size: .9rem;
            font-weight: normal;

            color: $muted;
        }

        &:hover {
            background-color: $hover;
            cursor: pointer;
        }
    }
}

.method-block {
    border-right: 1px solid $border;
}

.method-block-details {
}

.method-block-description {
    padding: .5rem 1rem;

    border-bottom: 1px solid $border;
}

.method-block-section-description {
    padding: .5rem 1rem;

    font-size: .8rem;
    color: $muted;

    border-bottom: 1px solid $border;
}

.method-block-result-type {
    padding: .5rem 1rem;

    font-weight: 500;

    border-bottom: 1px solid $border;
}

.method-block-params {
    .method-block-param {
        display: grid;
        grid-template-columns: .5fr .5fr;

        border-bottom: 1px solid $border;

        & > .method-block-params {
            grid-row: 2;
            grid-column: 1/3;

            border-top: 1px solid $hover;
            border-bottom: 1px solid $hover;

            .method-block-param {
                border-bottom: 1px solid $hover;
            }
        }

        .method-block-param--name {
            padding: .5rem 1rem;

            font-weight: 500;

            border-right: 1px solid $border;
        }

        .method-block-param--type {
            padding: .5rem 1rem;

            font-weight: 500;

            cursor: default;

            &.params {
                &:hover {
                    text-decoration: underline;
                }
            }

            &.input {
                padding: 0;
            }

            input {
                width: 100%;
                height: 100%;

                font-size: 1rem;

                padding: .5rem 1rem;
                border: none;

                &::placeholder {
                    font-weight: 500;
                }
            }
        }
    }
}

.s-dropdown.s-dropdown-tooltip-light-theme {
    background-color: white;

    padding: 0;
    border-radius: 0;

    box-shadow: 2px 2px 10px 0 #eee;
}

.result-block {
    &.empty {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

@media (max-width: 900px) {
    .back {
        display: flex;
    }

    .method-block {
        display: none !important;
    }

    .result-block {
        display: none !important;
    }
}

.invoke {
    @media (max-width: 900px) {
        .methods-list {
            display: none !important;
        }
    }

    .method-block {
        display: revert !important;

        .block-header-invoke-button {
            background-color: $text;
            color: white;

            margin-left: revert;

            &:hover {
                background-color: lighten($text, 8);
            }

            &:active {
                background-color: darken($text, 2);
            }
        }
    }

    .result-block {
        display: revert !important;
    }
}
</style>
