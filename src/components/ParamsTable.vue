<template>
    <table>
        <tr>
            <th>Name</th>
            <th>Type</th>
        </tr>
        <SDropdown v-for="param in params"
                   :key="param.name"
                   hover
                   :is-enabled="!!param.type.params.length"
                   theme="tooltip-light"
                   align="center"
        >
            <template #toggle="{ name }">
                <tr>
                    <td>
                        {{ param.name }}
                    </td>
                    <td v-s-dropdown-toggle:[name]>
                        {{ param.type.name }}
                    </td>
                </tr>
            </template>

            <ParamsTable :params="param.type.params"/>
        </SDropdown>
    </table>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue';

const props = defineProps<{ params: any[] }>();
const { params } = toRefs(props);
</script>

<style lang="scss">
table {
    border-spacing: 0;
}

tr {
    text-align: left;

    margin: 0;
    padding: 0;

    &:first-child {
        td, th {
            border-top: 1px solid #eee;
        }
    }
}

td, th {
    margin: 0;
    padding: .5rem;

    border-left: 1px solid #eee;
    border-bottom: 1px solid #eee;

    &:last-child {
        border-right: 1px solid #eee;
    }
}
</style>
