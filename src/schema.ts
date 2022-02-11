import { ref } from 'vue';
import { ParamDocument, SchemaDocument, TypeDocument } from './types';

export const schema = ref<undefined | SchemaDocument>();

// @ts-ignore
const getType = (typeName: string, schema: SchemaDocument): TypeDocument => {
    return schema.types.find(type => type.schemaTypeName === typeName);
};

// @ts-ignore
export const getTypeByName = (typeName: string): TypeDocument => {
    return schema.value.types.find(type => type.name === typeName);
};

export function setSchema(newSchema: SchemaDocument) {
    const resetType = (typeName: string | TypeDocument) => {
        if (typeof typeName === "string") {
            const type = getType(typeName, newSchema);

            if (!type) {
                console.log(typeName)
            }

            resetParams(type.params);
            type.unionTypes = type.unionTypes.map(type => resetType(type));

            type.validators.forEach(validator => {
                if (validator.data.itemType) {
                    validator.data.itemType = resetType(validator.data.itemType);
                }
            });

            return type;
        }

        return typeName;
    };

    const resetParams = (params: ParamDocument[]) => {
        params.forEach(param => {
            param.type = resetType(param.type);

            resetParams(param.type.params);

            param.validators.forEach(validator => {
                if (validator.data.itemType) {
                    validator.data.itemType = resetType(validator.data.itemType);
                }
            });
        });
    }

    newSchema.methods.forEach(method => {
        method.resultType = resetType(method.resultType);

        resetParams(method.params);
    });

    schema.value = newSchema;
}
