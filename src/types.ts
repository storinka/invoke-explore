// raw

export interface RawMethodDocument {
    "@type": "MethodDocument";

    name: string;
    summary?: string;
    description?: string;
    resultType?: string;
    params: RawParamDocument[];
    tags: string[];
    headers: RawHeaderDocument[];
}

export interface RawParamDocument {
    "@type": "ParamDocument";

    name: string;
    summary?: string;
    description?: string;
    isOptional: boolean;
    defaultValue?: any;
    type: string;
    validators: RawValidatorDocument[];
}

export interface RawValidatorDocument {
    "@type": "ValidatorDocument";

    name: string;
    summary?: string;
    description?: string;
    data?: any;
}

export interface RawTypeDocument {
    "@type": "TypeDocument";

    name: string;
    uniqueTypeName: string;
    summary?: string;
    description?: string;
    isSimple: boolean;
    isData: boolean;
    isUnion: boolean;
    isBinary: boolean;
    isEnum: boolean;
    isArray: boolean;
    arrayType?: string;
    unionTypes: string[];
    enumValues: Array<number | string>;
    params: RawParamDocument[];
    validators: RawValidatorDocument[];
}

export interface RawIframeDocument {
    "@type": "IframeDocument";

    name: string;
    url: string;
}

export interface RawMarkdownDocument {
    "@type": "MarkdownDocument";

    name: string;
    content: string;
}

export interface RawSectionDocument {
    "@type": "SectionDocument";

    name: string;
    items: Array<RawTypeDocument | RawMethodDocument | RawSectionDocument | RawIframeDocument | RawMarkdownDocument | RawMethodReferenceDocument>
}

export interface RawInvokeInstructionDocument {
    "@type": "InvokeInstructionDocument";

    name: string;
    protocol: string;
    host: string;
    port: string;
    path?: string;
    type: string;
}

export interface RawHeaderDocument {
    "@type": "HeaderDocument";

    name: string;
}

export interface RawApiDocument {
    "@type": "ApiDocument";

    invokeVersion: string;
    name: string;
    summary?: string;
    iconUrl?: string;
    sections: RawSectionDocument[];
    invokeInstruction: RawInvokeInstructionDocument;
    availableTypes: RawTypeDocument[];
    availableMethods: RawMethodDocument[];
}

export interface RawMethodReferenceDocument {
    "@type": "MethodReferenceDocument";

    methodName: string;
}

// transformed

export type MethodDocument = Omit<RawMethodDocument, "resultType" | "params"> & {
    resultType?: TypeDocument;
    params: ParamDocument[];
    headers: HeaderDocument[];
}

export type ParamDocument = Omit<RawParamDocument, "type" | "validators"> & {
    type: TypeDocument;
    validators: ValidatorDocument[];
}

export type ValidatorDocument = RawValidatorDocument;

export type TypeDocument = Omit<RawTypeDocument, "unionTypes" | "arrayType" | "params" | "validators"> & {
    arrayType?: TypeDocument;
    unionTypes: TypeDocument[];
    params: ParamDocument[];
    validators: ValidatorDocument[];
}

export type IframeDocument = RawIframeDocument;

export type MarkdownDocument = RawMarkdownDocument;

export type HeaderDocument = RawHeaderDocument;

export type SectionDocument = Omit<RawSectionDocument, "items"> & {
    items: Array<TypeDocument | MethodDocument | SectionDocument | IframeDocument | MarkdownDocument | MethodReferenceDocument>
}

export type InvokeInstructionDocument = RawInvokeInstructionDocument;
export type MethodReferenceDocument = RawMethodReferenceDocument;

export type ApiDocument =
    Omit<RawApiDocument, "sections" | "invokeInstruction" | "availableTypes" | "availableMethods">
    & {
    sections: SectionDocument[];
    invokeInstruction: InvokeInstructionDocument;
    availableTypes: TypeDocument[];
    availableMethods: MethodDocument[];
}
