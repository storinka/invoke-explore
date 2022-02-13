<template>
    <div class="headers">
        <template v-if="glob">
            <Header :header="header"
                    v-for="(header, i) in globalHeaders"
                    :input-mode="inputMode"
                    edit-name
                    @remove="remove(i, 'global')"
                    @updateName="changeHeaderName(i, $event, 'global')"
                    :path="`${this.path}_global_headers.${i}.[value]`"
                    :key="`${i}-${globalHeaders.length}`"/>
            <button class="type-input-array__add-button" @click="addHeader('global')">
                +
            </button>
        </template>
        <template v-else>
            <Header :header="header"
                    v-for="header in headers"
                    :input-mode="inputMode"
                    :path="`${path}_headers.${header.name}`"
                    :key="header.name"/>

            <template v-if="inputMode">
                <Header :header="header"
                        v-for="(header, i) in additionalHeaders"
                        :input-mode="inputMode"
                        edit-name
                        @remove="remove(i, 'additional')"
                        @updateName="changeHeaderName(i, $event, 'additional')"
                        :path="`${this.path}_additional_headers.${i}.[value]`"
                        :key="`${i}-${additionalHeaders.length}`"/>
                <button class="type-input-array__add-button" @click="addHeader('additional')">
                    +
                </button>
            </template>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { HeaderDocument } from '../types';
import Header from './Header.vue';

export default defineComponent({
    name: "Headers",
    components: { Header },
    props: {
        headers: Object as () => HeaderDocument[],
        inputMode: Boolean,
        path: String,
        glob: Boolean,
    },
    data() {
        return {
            update: 0,
        };
    },
    computed: {
        additionalHeaders(): HeaderDocument[] {
            this.update;

            const ls = { ...localStorage };
            const headers = [];

            Object.entries(ls).forEach(([k, v]) => {
                if (k.startsWith(`${this.path}_additional_headers.`) && k.endsWith(".[name]")) {
                    const header = k.substring(`${this.path}_additional_headers.`.length);
                    const index = header.split('.')[0];

                    headers.push({
                        index: Number(index),
                        header: {
                            name: v,
                        },
                    });
                }
            });

            return headers
                .sort((a, b) => a.index - b.index)
                .map(({ header }) => header);
        },
        globalHeaders(): HeaderDocument[] {
            this.update;

            const ls = { ...localStorage };
            const headers = [];

            Object.entries(ls).forEach(([k, v]) => {
                if (k.startsWith(`${this.path}_global_headers.`) && k.endsWith(".[name]")) {
                    const header = k.substring(`${this.path}_global_headers.`.length);
                    const index = header.split('.')[0];

                    headers.push({
                        index: Number(index),
                        header: {
                            name: v,
                        },
                    });
                }
            });

            return headers
                .sort((a, b) => a.index - b.index)
                .map(({ header }) => header);
        },
    },
    methods: {
        changeHeaderName(index, newName, mode: string = 'additional') {
            localStorage.setItem(`${this.path}_${mode}_headers.${index}.[name]`, newName);

            this.update++;
        },
        addHeader(mode: string = 'additional') {
            const lastIndex = this.getLastIndex(mode);

            localStorage.setItem(`${this.path}_${mode}_headers.${lastIndex + 1}.[name]`, "");
            localStorage.setItem(`${this.path}_${mode}_headers.${lastIndex + 1}.[value]`, "");

            this.update++;
        },
        remove(index: number, mode: string = 'additional') {
            // if (!window.confirm(`Sure want to delete item #${index}?`)) {
            //     return;
            // }

            const size = this.getLastIndex(mode) + 1;

            const items = { ...localStorage };

            for (let i = index + 1; i <= size; i++) {
                const currPrefix = `${this.path}_${mode}_headers.${i}.`;
                const prevPrefix = `${this.path}_${mode}_headers.${i - 1}.`;

                Object.entries(items).forEach(([k, v]) => {
                    if (k.startsWith(currPrefix)) {
                        const rest = k.substring(currPrefix.length);

                        localStorage.setItem(`${prevPrefix}${rest}`, v);
                    }
                });
            }

            Object.keys(items).forEach((k) => {
                const prefix = `${this.path}_${mode}_headers.${size - 1}.`;

                if (k.startsWith(prefix)) {
                    localStorage.removeItem(k);
                }
            });

            this.update++;
        },
        getLastIndex(mode: string = 'additional') {
            let lastIndex = -1;

            const ls = { ...localStorage };

            Object.entries(ls).forEach(([k, v]) => {
                if (k.startsWith(`${this.path}_${mode}_headers.`)) {
                    const header = k.substring(`${this.path}_${mode}_headers.`.length);
                    const index = Number(header.split('.')[0]);

                    if (index > lastIndex) {
                        lastIndex = index;
                    }
                }
            });

            return lastIndex;
        }
    },
});
</script>

<style lang="scss">
</style>
