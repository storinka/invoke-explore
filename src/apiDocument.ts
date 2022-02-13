import { ref } from "vue";
import {
    ApiDocument,
    IframeDocument,
    InvokeInstructionDocument,
    MarkdownDocument,
    MethodDocument,
    ParamDocument,
    RawApiDocument,
    RawIframeDocument,
    RawInvokeInstructionDocument,
    RawMarkdownDocument,
    RawMethodDocument,
    RawParamDocument,
    RawSectionDocument,
    RawTypeDocument,
    RawValidatorDocument,
    SectionDocument,
    TypeDocument,
    ValidatorDocument
} from "./types";
import mitt from 'mitt';

export const mitter = mitt();

export const activeDocument = ref<MethodDocument | TypeDocument | IframeDocument | MarkdownDocument | undefined>(undefined);
export const inputMode = ref(false);
export const isInvoking = ref(false);
export const invokeResult = ref<undefined | string | Object>(undefined);
export const invokingUploadProgress = ref<{ loaded: number; total: number; percentage: number; }>({
    loaded: 0,
    total: 0,
    percentage: 0
});

export const apiDocument = ref<undefined | ApiDocument>(undefined);

const transformedTypeDocuments = {};

export const findTypeByName = (name: string): TypeDocument | undefined => {
    return apiDocument.value?.availableTypes.find(type => type.name === name);
}

export const findTypeInRaw = (uniqueTypeName: string, rawApiDocument: RawApiDocument): RawTypeDocument | undefined => {
    return rawApiDocument.availableTypes.find(type => type.uniqueTypeName === uniqueTypeName);
};

function transformIframeDocument(rawIframeDocument: RawIframeDocument, rawApiDocument: RawApiDocument): IframeDocument {
    return rawIframeDocument;
}

function transformMarkdownDocument(rawMarkdownDocument: RawMarkdownDocument, rawApiDocument: RawApiDocument): MarkdownDocument {
    return rawMarkdownDocument;
}

function transformTypeDocument(rawTypeDocument: RawTypeDocument, rawApiDocument: RawApiDocument): TypeDocument {
    if (transformedTypeDocuments[rawTypeDocument.uniqueTypeName]) {
        return transformedTypeDocuments[rawTypeDocument.uniqueTypeName];
    }

    const typeDocument = transformedTypeDocuments[rawTypeDocument.uniqueTypeName] = {
        ...rawTypeDocument,
        arrayType: undefined as undefined | TypeDocument,
        unionTypes: [],
        params: [],
        validators: [],
    };

    typeDocument.arrayType = rawTypeDocument.arrayType ? transformTypeDocument(findTypeInRaw(rawTypeDocument.arrayType, rawApiDocument) as RawTypeDocument, rawApiDocument) : undefined;
    typeDocument.unionTypes = rawTypeDocument.unionTypes.map(rawType => transformTypeDocument(findTypeInRaw(rawType, rawApiDocument) as RawTypeDocument, rawApiDocument));
    typeDocument.params = rawTypeDocument.params.map(rawParam => transformParamDocument(rawParam, rawApiDocument));
    typeDocument.validators = rawTypeDocument.validators.map(rawValidator => transformValidatorDocument(rawValidator, rawApiDocument));

    return typeDocument;
}

function transformMethodDocument(rawMethodDocument: RawMethodDocument, rawApiDocument: RawApiDocument): MethodDocument {
    return {
        ...rawMethodDocument,
        resultType: transformTypeDocument(findTypeInRaw(rawMethodDocument.resultType as string, rawApiDocument) as RawTypeDocument, rawApiDocument),
        params: rawMethodDocument.params.map(rawParam => transformParamDocument(rawParam, rawApiDocument)),
    };
}

function transformParamDocument(rawParamDocument: RawParamDocument, rawApiDocument: RawApiDocument): ParamDocument {
    return {
        ...rawParamDocument,
        type: transformTypeDocument(findTypeInRaw(rawParamDocument.type as string, rawApiDocument) as RawTypeDocument, rawApiDocument),
        validators: rawParamDocument.validators.map(rawValidator => transformValidatorDocument(rawValidator, rawApiDocument)),
    };
}

function transformValidatorDocument(rawValidatorDocument: RawValidatorDocument, rawApiDocument: RawApiDocument): ValidatorDocument {
    if (rawValidatorDocument.name === "ArrayOf") {
        return {
            ...rawValidatorDocument,
            data: {
                ...rawValidatorDocument.data,
                itemType: transformTypeDocument(findTypeInRaw(rawValidatorDocument.data.itemType as string, rawApiDocument) as RawTypeDocument, rawApiDocument)
            },
        };
    }

    return rawValidatorDocument;
}

function transformInvokeInstructionDocument(rawInvokeInstructionDocument: RawInvokeInstructionDocument, rawApiDocument: RawApiDocument): InvokeInstructionDocument {
    return rawInvokeInstructionDocument;
}

function transformSectionDocument(rawSectionDocument: RawSectionDocument, rawApiDocument: RawApiDocument): SectionDocument {
    return {
        ...rawSectionDocument,
        items: rawSectionDocument.items.map(rawItem => {
            switch (rawItem["@type"]) {
                case "SectionDocument":
                    return transformSectionDocument(rawItem as RawSectionDocument, rawApiDocument);
                case "IframeDocument":
                    return transformIframeDocument(rawItem as RawIframeDocument, rawApiDocument);
                case "MarkdownDocument":
                    return transformMarkdownDocument(rawItem as RawMarkdownDocument, rawApiDocument);
                case "TypeDocument":
                    return transformTypeDocument(rawItem as RawTypeDocument, rawApiDocument);
                case "MethodDocument":
                    return transformMethodDocument(rawItem as RawMethodDocument, rawApiDocument);
            }
        }),
    }
}

export function setRawApiDocument(rawApiDocument: RawApiDocument): void {
    apiDocument.value = {
        ...rawApiDocument,

        sections: rawApiDocument.sections.map(section => transformSectionDocument(section, rawApiDocument)),
        invokeInstruction: transformInvokeInstructionDocument(rawApiDocument.invokeInstruction, rawApiDocument),
        availableTypes: rawApiDocument.availableTypes.map(type => transformTypeDocument(type, rawApiDocument)),
    };
}
