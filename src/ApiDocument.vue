<template>
    <div class="api-document" :class="{ 'app-document--three-cols': isMethodActive }" v-if="apiDocument">
        <div class="api-document__sections">
            <div class="app-header">
                <div class="app-header__icon" v-if="apiDocument.iconUrl">
                    <img src="https://business.storinka.menu/_nuxt/img/logo.b45e76c.svg" alt="Icon">
                </div>

                {{ apiDocument.name }}

                <button @click="openSettings" class="app-header__settings-button">
                    ⚙
                </button>
            </div>

            <div class="api-document__sections-list">
                <Section v-for="(section, i) in apiDocument.sections"
                         :key="`section-${i}`"
                         :is-first="i === 0"
                         v-model="activeItem"
                         :section="section"
                />
            </div>
        </div>

        <template :key="`activeItem-${activeItem.name}`" v-if="activeItem">
            <div class="api-document-section-content api-document-section-content--with-header"
                 v-if="isTypeActive || isMethodActive"
            >
                <div class="app-header app-header--with-button">
                    {{ activeItem.name }}
                    <span style="margin-left: .5ch; color: #0d6efd; font-size: .6em;">
                        {{ isMethodActive ? 'METHOD' : 'TYPE' }}
                    </span>

                    <InvokeButton v-if="isMethodActive"/>
                </div>

                <div class="api-document-section__body">
                    <div class="api-document-section-block" v-if="activeItem.description && !isInputMode">
                        <div class="api-document-section-block__name">
                            Description
                        </div>
                        <div class="api-document-section-block__body" v-html="activeItem.description"/>
                    </div>
                    <div class="api-document-section-block" v-if="activeItem.params.length">
                        <div class="api-document-section-block__name">
                            Params
                        </div>
                        <NewParams class="api-document-section-block__params"
                                   :params="activeItem.params"
                                   :path="activeItem.name"
                                   :input-mode="isInputMode"
                        />
                    </div>
                    <div class="api-document-section-block" v-if="activeItem.resultType && !isInputMode">
                        <div class="api-document-section-block__name">
                            Result
                        </div>
                        <TypeName class="api-document-section-block__body"
                                  :type="activeItem.resultType"
                        />
                    </div>
                    <div class="api-document-section-block" v-if="activeItem.headers?.length || isInputMode">
                        <div class="api-document-section-block__name">
                            Headers
                        </div>
                        <Headers class="api-document-section-block__params"
                                 :path="activeItem.name"
                                 :headers="activeItem.headers"
                                 :input-mode="isInputMode"
                                 v-if="isInputMode"
                        />
                        <div class="api-document-section-block__body" v-else>
                            {{ activeItem.headers.map(h => h.name).join(", ") }}
                        </div>
                    </div>
                    <div class="api-document-section-block" v-if="isInputMode">
                        <div class="api-document-section-block__name">
                            Global Headers
                        </div>
                        <Headers class="api-document-section-block__params"
                                 :path="apiDocument.name"
                                 :headers="activeItem.headers"
                                 :input-mode="isInputMode"
                                 glob
                        />
                    </div>
                </div>
            </div>
            <div class="api-document-section-content api-document-section-content--iframe"
                 v-else-if="isIframeActive">
                <iframe :src="activeItem.url" frameborder="0"/>
            </div>
            <div class="api-document-section-content api-document-section-content--markdown"
                 v-else-if="isMarkdownActive">
                <div class="markdown" v-html="renderMarkdown(activeItem.content)"/>
            </div>
        </template>
        <section class="result-block" :class="{ 'not-result': invokeResult === undefined }" v-if="isMethodActive">
            <template v-if="isInvoking">
                <template v-if="!uploadProgress.total">
                    Preparing...
                </template>
                <template v-else>
                    {{ uploadProgress.loaded }} / {{ uploadProgress.total }}
                </template>
            </template>
            <div style="padding: 10px" v-else-if="isInputMode && invokeResult">
                <div v-html="invokeResult" v-if="typeof invokeResult === 'string'"></div>
                <vue-json-pretty :data="invokeResult" v-else/>
            </div>
            <template v-else-if="isInputMode">
                Ready to invoke
            </template>
            <template v-else>
                Try to invoke
            </template>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    activeDocument,
    apiDocument,
    inputMode,
    invokeResult,
    invokingUploadProgress,
    isInvoking,
    mitter,
    setRawApiDocument
} from './apiDocument';
import SectionItem from './components/SectionItem.vue';
import TypeName from './components/TypeName.vue';
import NewParams from './components/NewParams.vue';
import Section from './components/Section.vue';
import InvokeButton from './components/InvokeButton.vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import VueJsonPretty from 'vue-json-pretty';
import Headers from './components/Headers.vue';
import SettingsModal from './components/SettingsModal.vue';

const API_DOCUMENT_URL = "http://localhost:8081/getApiDocument";

export default defineComponent({
    name: "ApiDocument",
    components: { Headers, InvokeButton, Section, NewParams, TypeName, SectionItem, VueJsonPretty },
    computed: {
        apiDocument() {
            return apiDocument.value;
        },
        isInputMode() {
            return inputMode.value;
        },
        isInvoking() {
            return isInvoking.value;
        },
        invokeResult() {
            return invokeResult.value;
        },
        renderMarkdown() {
            return (content: string): string => {
                return DOMPurify.sanitize(marked.parse(content, { gfm: true }));
            };
        },
        isTypeActive() {
            return this.activeItem?.["@type"] === "TypeDocument";
        },
        isMethodActive() {
            return this.activeItem?.["@type"] === "MethodDocument";
        },
        isIframeActive() {
            return this.activeItem?.["@type"] === "IframeDocument";
        },
        isMarkdownActive() {
            return this.activeItem?.["@type"] === "MarkdownDocument";
        },
        activeItem: {
            get() {
                if (activeDocument.value?.['@type'] === 'MethodReferenceDocument') {
                    return apiDocument.value?.availableMethods.find((method) => method.name === activeDocument.value.methodName);
                }

                return activeDocument.value;
            },
            set(item) {
                if (item && item["@type"] === "MethodReferenceDocument") {
                    activeDocument.value = apiDocument.value?.availableMethods.find((method) => method.name === item.methodName);
                } else {
                    activeDocument.value = item;
                }
            },
        },
        uploadProgress() {
            return invokingUploadProgress.value;
        },
    },
    mounted() {
        fetch(API_DOCUMENT_URL)
            .then(r => r.json())
            .then(data => setRawApiDocument(data.result))
            .then(() => {
                this.activeItem = this.apiDocument?.sections[0]?.items[0];
            });
    },
    methods: {
        openSettings() {
            mitter.emit("modal:open", {
                component: SettingsModal,
                props: {},
            });
        },
    },
});
</script>

<style lang="scss">
@import "./assets/styles";

html, body {
  margin: 0;

  width: 100%;
  height: 100%;

  padding: 0;
}

.api-document {
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-columns: .3fr .7fr;

  &.app-document--three-cols {
    grid-template-columns: .3fr .4fr .3fr;

    .api-document-section-content {
      border-right: 1px solid var(--borderColor);
    }
  }
}

.api-document__sections {
  overflow: auto;

  border-right: 1px solid var(--borderColor);
}

.api-document-section-content {
  overflow: auto;
}

.api-document-section-content--iframe {
  overflow: hidden;

  iframe {
    width: 100%;
    height: 100%;
    max-height: 100%;
  }
}

.api-document-section-content--with-header {
  overflow: hidden;

  .api-document-section__body {
    max-height: calc(100% - 60px);
  }
}

.api-document-section-content--markdown {
  padding: 1rem;

  .markdown {
    margin: 0 auto;
    max-width: 1024px;

    pre {
      overflow-x: auto;
    }

    table {
      border-collapse: collapse;
    }

    table, th, td {
      border: 1px solid var(--borderColor);
    }

    td, th {
      padding: .5rem 1rem;
    }

    code {
      background-color: var(--borderColor);
      border-radius: 4px;
    }

    pre {
      padding: 1em;

      background-color: var(--borderColor);
      border-radius: 10px;

      code {
        background-color: transparent;
        border-radius: 0;
      }
    }
  }
}

.api-document-section__body {
  overflow: auto;

  height: 100%;
  max-height: 100%;
}

.api-document-section-block {
}

.api-document-section-block__name {
  padding: .5rem 1rem;

  font-size: .8rem;
  color: var(--mutedColor);

  border-bottom: 1px solid var(--borderColor);
}

.api-document-section-block__body {
  width: 100%;

  padding: .5rem 1rem;

  font-family: Inconsolata, monospace;

  border-bottom: 1px solid var(--borderColor);
}

.api-document-section-block__params {
  width: 100%;

  border-bottom: 1px solid var(--borderColor);
}
</style>
