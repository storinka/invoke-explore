export interface ValidatorDocument {
    name: string;
    description: string;
    class: string;
    data: {
        itemType?: TypeDocument;
    };
}

export interface TypeDocument {
    name: string;
    isUnion: boolean;
    isData: boolean;
    isBuiltin: boolean;
    isFile: boolean;
    description: string | null;
    summary: string | null;
    unionTypes: TypeDocument[];
    params: ParamDocument[];
    validators: ValidatorDocument[];
}

export interface ParamDocument {
    name: string;
    type: TypeDocument;
    validators: ValidatorDocument[];
}

export interface SchemaDocument {
    methods: MethodDocument[];
    types: TypeDocument[];
}

export interface MethodDocument {
    name: string;
    description?: string;
    resultType: TypeDocument;
    summary?: string;
    params: ParamDocument[];
}
