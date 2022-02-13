<template>
    <button v-if="inputMode"
            @click="cancel"
            class="invoke-cancel-button"
    >
        cancel
    </button>
    <button @click="invoke"
            :disabled="isInvoking && inputMode"
            :class="{ 'invoke-button--active': inputMode }"
            class="invoke-button"
    >
        Invoke
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    activeDocument,
    apiDocument,
    findTypeByName,
    inputMode,
    invokeResult,
    invokingUploadProgress,
    isInvoking
} from '../apiDocument';
import { ParamDocument, TypeDocument } from '../types';
import axios from 'axios';

function extractValue(path: string, type: TypeDocument, param?: ParamDocument) {
    if (type.isUnion) {
        const selectedTypeName = localStorage.getItem(`${path}[selectedType]`) || type.unionTypes[0].name;
        type = findTypeByName(selectedTypeName)!;
    }

    if (type.isArray) {
        const values = [];

        let itemsCount: any = localStorage.getItem(`${path}:${type.name}[itemsCount]`);
        itemsCount = itemsCount ? Number(itemsCount) : 0;

        for (let i = 0; i < itemsCount; i++) {
            const itemType = (type.validators.length ? type.validators : (param?.validators || []))
                .find(v => v.name === "ArrayOf")
                .data.itemType;

            const value = extractValue(`${path}:${type.name}[${i}]`, itemType);

            values.push(value);
        }

        return values;
    }

    if (type.isData) {
        const params = {};

        type.params.forEach(param => {
            params[param.name] = extractValue(`${path}.${param.name}`, param.type, param);
        });

        return params;
    }

    return JSON.parse(localStorage.getItem(`${path}:${type.name}`));
}

const rootPathForMethod = method => `${method.name}`;

const makeInvokeFn = () => {
    const { protocol, host, port, path } = apiDocument.value!.invokeInstruction!;

    return async (name: string, params: any, options: any): Promise<any> => {
        const url = `${protocol}://${host}:${port}/${path ? path + '/' : ''}${name}`;

        return await axios.post(url, params, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(options?.headers || {})
            },
            onUploadProgress: options?.onUploadProgress as any,
            onDownloadProgress: options?.onDownloadProgress as any,
        }).then(response => {
            return response.data.result;
        });
    };
};

export default defineComponent({
    name: "InvokeButton",
    computed: {
        inputMode() {
            return inputMode.value;
        },
        isInvoking() {
            return isInvoking.value;
        },
    },
    methods: {
        invoke() {
            if (this.isInvoking) {
                if (!this.inputMode) {
                    inputMode.value = true;
                }

                return;
            }

            if (!this.inputMode) {
                inputMode.value = true;
                return;
            }

            const invoke = makeInvokeFn();

            const params = {};

            const rootPath = rootPathForMethod(activeDocument.value);

            if (activeDocument.value) {
                activeDocument.value.params.forEach(param => {
                    params[param.name] = extractValue(`${rootPathForMethod(activeDocument.value)}.${param.name}`, param.type, param);
                });
            }

            const headers = {};

            if (activeDocument.value) {
                const ls = { ...localStorage };

                Object.entries(ls).forEach(([lk, lv]) => {
                    if (lk.startsWith(`${apiDocument.value.name}_global_headers.`) && lk.endsWith(".[name]")) {
                        const header = lk.substring(`${apiDocument.value.name}_global_headers.`.length);
                        const index = header.split('.')[0];

                        Object.entries(ls).forEach(([k, v]) => {
                            if (k === `${apiDocument.value.name}_global_headers.${index}.[value]`) {
                                headers[lv] = v;
                            }
                        });
                    }
                });

                activeDocument.value.headers.forEach(header => {
                    headers[header.name] = localStorage.getItem(`${rootPathForMethod(activeDocument.value)}_headers.${header.name}`);
                });

                Object.entries(ls).forEach(([lk, lv]) => {
                    if (lk.startsWith(`${activeDocument.value.name}_additional_headers.`) && lk.endsWith(".[name]")) {
                        const header = lk.substring(`${activeDocument.value.name}_additional_headers.`.length);
                        const index = header.split('.')[0];

                        Object.entries(ls).forEach(([k, v]) => {
                            if (k === `${activeDocument.value.name}_additional_headers.${index}.[value]`) {
                                headers[lv] = v;
                            }
                        });
                    }
                });
            }

            invokeResult.value = undefined;
            isInvoking.value = true;
            invokingUploadProgress.value = {
                loaded: 0,
                total: 0,
                percentage: 0
            };

            invoke(activeDocument.value.name, params, {
                onUploadProgress: ({ loaded, total }) => {
                    const percentage = loaded / total * 100;

                    invokingUploadProgress.value = {
                        loaded,
                        total,
                        percentage,
                    };
                },
                headers,
            }).then(result => invokeResult.value = result)
                .catch(error => {
                    if (error.response) {
                        invokeResult.value = error.response.data
                    } else {
                        invokeResult.value = error
                    }
                })
                .finally(() => {
                    isInvoking.value = false;
                });
        },
        cancel() {
            inputMode.value = false;
        },
    },
});
</script>

<style lang="scss">
.invoke-button {
  all: unset;

  margin-left: auto;

  height: 100%;

  padding: 0 1rem;

  background-color: var(--accentColor);
  color: var(--bgColor);

  cursor: pointer;

  transition: all 125ms ease;

  &:hover {
    background-color: var(--accentColorHover);
  }

  &:active {
    background-color: var(--accentColorActive);
  }

  &:disabled {
    opacity: .6;
    cursor: wait;
  }
}

.invoke-button--active {
  margin-left: 0;

  background-color: var(--darkButtonColor);

  &:hover {
    background-color: var(--darkButtonColor);
  }

  &:active {
    background-color: var(--darkButtonColor);
  }
}

.invoke-cancel-button {
  all: unset;

  margin-left: auto;

  height: 100%;

  padding: 0 1rem;

  cursor: pointer;
}
</style>
