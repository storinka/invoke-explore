export interface ValidationDocument {
    name: string;
    description: string;
    class: string;
}

export interface TypeDocument {
    name: string;
    isUnion: boolean;
    isData: boolean;
    isBuiltin: boolean;
    isFile: boolean;
    description: string | null;
    summary: string | null;
    subtypes: TypeDocument[];
    validations: ValidationDocument[];
    params: ParamDocument[];
}

export interface ParamDocument {
    name: string;
    type: TypeDocument;
}
