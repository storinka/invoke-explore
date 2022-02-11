<template>
    <div v-if="route.query.schemaUrl" class="app" :class="{ invoke: invokeMode, result: result && !isInvoking }">
        <nav class="methods-list">
            <header class="block-header block-header--bold">
                Methods
            </header>

            <a @click="activeMethod = method"
               :class="{ 'methods-list-item--active': activeMethod === method }"
               class="methods-list-item"
               v-for="method in schema?.methods"
               :key="method.name"
            >
                <div class="method-list-item--name">
                    {{ method.name }}
                </div>
                <div v-if="method.summary" class="method-list-item__summary">
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

                <button :disabled="isInvoking" @click="onInvokeClick" class="block-header-invoke-button">
                    Invoke
                </button>
            </header>

            <main class="method-block-details">
                <div class="method-block-section-description" v-if="activeMethod.description">
                    Description
                </div>
                <section v-html="activeMethod.description.replaceAll('\n', '<br>')"
                         v-if="activeMethod.description"
                         class="method-block-description">
                </section>

                <div class="method-block-section-description">
                    Params
                </div>
                <Params class="params--no-corner-borders"
                        :path="rootPathForMethod(activeMethod)"
                        :depth="0"
                        :input="invokeMode"
                        :params="activeMethod.params"/>

                <div class="method-block-section-description" v-if="!invokeMode">
                    Result
                </div>
                <section v-if="activeMethod.resultType && !invokeMode" class="method-block-result-type">
                    <Type :type="activeMethod.resultType" :validators="[]"/>
                </section>
            </main>
        </section>
        <section v-else class="method-block"></section>
        <section class="result-block" :class="{ empty: true }">
            <template v-if="isInvoking">
                Invoking...
            </template>
            <div style="padding: 10px" v-else-if="invokeMode && result">
                <div v-html="result" v-if="typeof result === 'string'"></div>
                <vue-json-pretty :data="result" v-else/>
            </div>
            <template v-else-if="invokeMode">
                Ready to invoke
            </template>
            <template v-else>
                Try to invoke
            </template>
        </section>
    </div>
    <div class="enter-url" v-else>
        <form @submit.prevent="openSchemaFromInput" class="input-container">
            <input placeholder="Schema url" type="text" v-model="schemaUrlInput">

            <button v-if="schemaUrlInput" @click="openSchemaFromInput">
                Open
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
// eslint-disable
import { computed, onMounted, ref, watch } from 'vue';
import Type from './components/Type.vue';
import Params from './components/Params.vue';
import { MethodDocument } from './types';
import { getTypeByName, schema, setSchema } from './schema';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const invokeMode = ref(false);
const isInvoking = ref(false);
const result = ref(null);

const schemaUrlInput = ref('');

function openSchemaFromInput() {
    router.push({
        query: {
            ...route.query,
            schemaUrl: schemaUrlInput.value
        }
    });
}

const activeMethod = computed({
    get(): MethodDocument | null {
        return schema.value?.methods.find(m => m.name === route.query.method);
    },
    set(method: MethodDocument | null) {
        if (method) {
            router.replace({
                query: {
                    ...route.query,
                    method: method.name
                }
            });
        } else {
            router.replace({
                query: {
                    ...route.query,
                    method: null
                }
            })
        }
    }
});

function openSchemaFromUrl() {
    if (route.query.schemaUrl) {
        schema.value = undefined;
        fetch(String(route.query.schemaUrl))
            .then(r => r.json())
            .then(data => setSchema(data.result))
            .then(() => {
                activeMethod.value = schema.value?.methods[0]
            });
    }
}

onMounted(() => {
    openSchemaFromUrl();
});

watch(activeMethod, () => {
    invokeMode.value = false;
    result.value = null;
});

watch(() => route.query.schemaUrl, () => {
    openSchemaFromUrl();
});

function onInvokeClick() {
    if (invokeMode.value) {
        invoke();
    } else {
        invokeMode.value = true;
    }
}

function extractValue(path, type, param) {
    let selectedType = type.name;

    console.log(`extracting ${path}`);

    if (type.isUnion) {
        const selectedTypeName = localStorage.getItem(`${path}[selectedType]`) || type.unionTypes[0].name;
        type = getTypeByName(selectedTypeName);
    }

    if (type.name.startsWith("array")) {
        const values = [];

        let itemsCount: any = localStorage.getItem(`${path}:${type.name}[itemsCount]`);
        itemsCount = itemsCount ? Number(itemsCount) : 0;

        for (let i = 0; i < itemsCount; i++) {
            const itemType = (type.validators.length ? type.validators : param.validators).find(v => v.name === "ArrayOf").data.itemType;

            const value = extractValue(`${path}:${type.name}[${i}]`, itemType);

            values.push(value);
        }

        return values;
    }

    if (type.isData) {
        const params = {};

        type.params.forEach(param => {
            const value = extractValue(`${path}.${type.name}.${param.name}`, param.type, param);

            params[param.name] = value;
        });

        return params;
    }

    return JSON.parse(localStorage.getItem(`${path}:${type.name}`));
}

const rootPathForMethod = method => `${route.query.schemaUrl}.${method.name}`;

function invoke() {
    const params = {};

    if (activeMethod.value) {
        activeMethod.value?.params.forEach(param => {
            const value = extractValue(`${rootPathForMethod(activeMethod.value)}.${param.name}`, param.type, param);

            params[param.name] = value;
        });
    }

    isInvoking.value = true;

    fetch(`http://localhost:8080/${activeMethod.value.name}`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(r => {
            return r.clone().json().catch(() => r.text())
        })
        .then(data => {
            result.value = typeof data === 'string' ? data : data.result || data;
        })
        .finally(() => {
            isInvoking.value = false;
        })
}
</script>

<style lang="scss">
@import "./assets/styles";
</style>
