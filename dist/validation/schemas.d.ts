import { z } from 'zod';
import { Predicate } from '@/types';
export declare const uuidSchema: z.ZodString;
export declare const objectDTOSchema: z.ZodObject<{
    uuid: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    abbreviation: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    isTemplate: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    uuid: string;
    version?: string | undefined;
    name?: string | undefined;
    abbreviation?: string | undefined;
    description?: string | undefined;
    isTemplate?: boolean | undefined;
}, {
    uuid: string;
    version?: string | undefined;
    name?: string | undefined;
    abbreviation?: string | undefined;
    description?: string | undefined;
    isTemplate?: boolean | undefined;
}>;
export type ObjectDTOSchemaType = z.infer<typeof objectDTOSchema>;
export declare const statementsPropertyValueSchema: z.ZodObject<{
    value: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value?: string | undefined;
}, {
    value?: string | undefined;
}>;
export type StatementsPropertyValueSchemaType = z.infer<typeof statementsPropertyValueSchema>;
export declare const statementsPropertySchema: z.ZodObject<{
    key: z.ZodOptional<z.ZodString>;
    values: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value?: string | undefined;
    }, {
        value?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    key?: string | undefined;
    values?: {
        value?: string | undefined;
    }[] | undefined;
}, {
    key?: string | undefined;
    values?: {
        value?: string | undefined;
    }[] | undefined;
}>;
export type StatementsPropertySchemaType = z.infer<typeof statementsPropertySchema>;
export declare const statementDTOSchema: z.ZodObject<{
    subject: z.ZodString;
    predicate: z.ZodNativeEnum<typeof Predicate>;
    object: z.ZodString;
    properties: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodOptional<z.ZodString>;
        values: z.ZodOptional<z.ZodArray<z.ZodObject<{
            value: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value?: string | undefined;
        }, {
            value?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        key?: string | undefined;
        values?: {
            value?: string | undefined;
        }[] | undefined;
    }, {
        key?: string | undefined;
        values?: {
            value?: string | undefined;
        }[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    object: string;
    subject: string;
    predicate: Predicate;
    properties?: {
        key?: string | undefined;
        values?: {
            value?: string | undefined;
        }[] | undefined;
    }[] | undefined;
}, {
    object: string;
    subject: string;
    predicate: Predicate;
    properties?: {
        key?: string | undefined;
        values?: {
            value?: string | undefined;
        }[] | undefined;
    }[] | undefined;
}>;
export type StatementDTOSchemaType = z.infer<typeof statementDTOSchema>;
export declare const propertyDTOSchema: z.ZodObject<{
    uuid: z.ZodString;
    key: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    inputType: z.ZodOptional<z.ZodString>;
    formula: z.ZodOptional<z.ZodString>;
    inputOrderPosition: z.ZodOptional<z.ZodNumber>;
    processingOrderPosition: z.ZodOptional<z.ZodNumber>;
    viewOrderPosition: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    uuid: string;
    key: string;
    version?: string | undefined;
    description?: string | undefined;
    label?: string | undefined;
    type?: string | undefined;
    inputType?: string | undefined;
    formula?: string | undefined;
    inputOrderPosition?: number | undefined;
    processingOrderPosition?: number | undefined;
    viewOrderPosition?: number | undefined;
}, {
    uuid: string;
    key: string;
    version?: string | undefined;
    description?: string | undefined;
    label?: string | undefined;
    type?: string | undefined;
    inputType?: string | undefined;
    formula?: string | undefined;
    inputOrderPosition?: number | undefined;
    processingOrderPosition?: number | undefined;
    viewOrderPosition?: number | undefined;
}>;
export type PropertyDTOSchemaType = z.infer<typeof propertyDTOSchema>;
export declare const propertyValueDTOSchema: z.ZodObject<{
    uuid: z.ZodString;
    value: z.ZodOptional<z.ZodString>;
    valueTypeCast: z.ZodOptional<z.ZodString>;
    sourceType: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    uuid: string;
    value?: string | undefined;
    valueTypeCast?: string | undefined;
    sourceType?: string | undefined;
}, {
    uuid: string;
    value?: string | undefined;
    valueTypeCast?: string | undefined;
    sourceType?: string | undefined;
}>;
export type PropertyValueDTOSchemaType = z.infer<typeof propertyValueDTOSchema>;
export declare const fileDTOSchema: z.ZodObject<{
    uuid: z.ZodString;
    fileName: z.ZodOptional<z.ZodString>;
    fileReference: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    uuid: string;
    fileReference: string;
    fileName?: string | undefined;
    label?: string | undefined;
}, {
    uuid: string;
    fileReference: string;
    fileName?: string | undefined;
    label?: string | undefined;
}>;
export type FileDTOSchemaType = z.infer<typeof fileDTOSchema>;
export declare const addressDTOSchema: z.ZodObject<{
    uuid: z.ZodString;
    fullAddress: z.ZodOptional<z.ZodString>;
    street: z.ZodOptional<z.ZodString>;
    houseNumber: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    uuid: string;
    fullAddress?: string | undefined;
    street?: string | undefined;
    houseNumber?: string | undefined;
    city?: string | undefined;
    postalCode?: string | undefined;
    country?: string | undefined;
    state?: string | undefined;
    district?: string | undefined;
}, {
    uuid: string;
    fullAddress?: string | undefined;
    street?: string | undefined;
    houseNumber?: string | undefined;
    city?: string | undefined;
    postalCode?: string | undefined;
    country?: string | undefined;
    state?: string | undefined;
    district?: string | undefined;
}>;
export type AddressDTOSchemaType = z.infer<typeof addressDTOSchema>;
export declare const findStatementsParamsSchema: z.ZodEffects<z.ZodObject<{
    subject: z.ZodOptional<z.ZodString>;
    predicate: z.ZodOptional<z.ZodNativeEnum<typeof Predicate>>;
    object: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    object?: string | undefined;
    subject?: string | undefined;
    predicate?: Predicate | undefined;
}, {
    object?: string | undefined;
    subject?: string | undefined;
    predicate?: Predicate | undefined;
}>, {
    object?: string | undefined;
    subject?: string | undefined;
    predicate?: Predicate | undefined;
}, {
    object?: string | undefined;
    subject?: string | undefined;
    predicate?: Predicate | undefined;
}>;
export type FindStatementsParamsType = z.infer<typeof findStatementsParamsSchema>;
export declare const objectWithPropertiesSchema: z.ZodObject<{
    object: z.ZodObject<{
        uuid: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        abbreviation: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        isTemplate: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        uuid: string;
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    }, {
        uuid: string;
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    }>;
    properties: z.ZodArray<z.ZodObject<{
        property: z.ZodObject<{
            uuid: z.ZodString;
            key: z.ZodString;
            version: z.ZodOptional<z.ZodString>;
            label: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
            inputType: z.ZodOptional<z.ZodString>;
            formula: z.ZodOptional<z.ZodString>;
            inputOrderPosition: z.ZodOptional<z.ZodNumber>;
            processingOrderPosition: z.ZodOptional<z.ZodNumber>;
            viewOrderPosition: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            uuid: string;
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        }, {
            uuid: string;
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        }>;
        value: z.ZodOptional<z.ZodObject<{
            uuid: z.ZodString;
            value: z.ZodOptional<z.ZodString>;
            valueTypeCast: z.ZodOptional<z.ZodString>;
            sourceType: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            uuid: string;
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        }, {
            uuid: string;
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        property: {
            uuid: string;
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        };
        value?: {
            uuid: string;
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        } | undefined;
    }, {
        property: {
            uuid: string;
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        };
        value?: {
            uuid: string;
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        } | undefined;
    }>, "many">;
    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
        uuid: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        abbreviation: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        isTemplate: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        uuid: string;
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    }, {
        uuid: string;
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    }>, "many">>;
    files: z.ZodOptional<z.ZodArray<z.ZodObject<{
        uuid: z.ZodString;
        fileName: z.ZodOptional<z.ZodString>;
        fileReference: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        uuid: string;
        fileReference: string;
        fileName?: string | undefined;
        label?: string | undefined;
    }, {
        uuid: string;
        fileReference: string;
        fileName?: string | undefined;
        label?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    object: {
        uuid: string;
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    };
    properties: {
        property: {
            uuid: string;
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        };
        value?: {
            uuid: string;
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        } | undefined;
    }[];
    children?: {
        uuid: string;
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    }[] | undefined;
    files?: {
        uuid: string;
        fileReference: string;
        fileName?: string | undefined;
        label?: string | undefined;
    }[] | undefined;
}, {
    object: {
        uuid: string;
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    };
    properties: {
        property: {
            uuid: string;
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        };
        value?: {
            uuid: string;
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        } | undefined;
    }[];
    children?: {
        uuid: string;
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    }[] | undefined;
    files?: {
        uuid: string;
        fileReference: string;
        fileName?: string | undefined;
        label?: string | undefined;
    }[] | undefined;
}>;
export type ObjectWithPropertiesType = z.infer<typeof objectWithPropertiesSchema>;
export declare const fileInputSchema: z.ZodObject<{
    file: z.ZodObject<{
        fileName: z.ZodString;
        fileReference: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fileName: string;
        fileReference: string;
        label?: string | undefined;
    }, {
        fileName: string;
        fileReference: string;
        label?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    file: {
        fileName: string;
        fileReference: string;
        label?: string | undefined;
    };
}, {
    file: {
        fileName: string;
        fileReference: string;
        label?: string | undefined;
    };
}>;
export declare const valueWithFilesSchema: z.ZodObject<{
    value: z.ZodObject<Omit<{
        uuid: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
        valueTypeCast: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodOptional<z.ZodString>;
    }, "uuid">, "strip", z.ZodTypeAny, {
        value?: string | undefined;
        valueTypeCast?: string | undefined;
        sourceType?: string | undefined;
    }, {
        value?: string | undefined;
        valueTypeCast?: string | undefined;
        sourceType?: string | undefined;
    }>;
    files: z.ZodOptional<z.ZodArray<z.ZodObject<{
        file: z.ZodObject<{
            fileName: z.ZodString;
            fileReference: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        }, {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }, {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    value: {
        value?: string | undefined;
        valueTypeCast?: string | undefined;
        sourceType?: string | undefined;
    };
    files?: {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }[] | undefined;
}, {
    value: {
        value?: string | undefined;
        valueTypeCast?: string | undefined;
        sourceType?: string | undefined;
    };
    files?: {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }[] | undefined;
}>;
export declare const propertyWithValuesFilesSchema: z.ZodObject<{
    property: z.ZodObject<z.objectUtil.extendShape<Omit<{
        uuid: z.ZodString;
        key: z.ZodString;
        version: z.ZodOptional<z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        inputType: z.ZodOptional<z.ZodString>;
        formula: z.ZodOptional<z.ZodString>;
        inputOrderPosition: z.ZodOptional<z.ZodNumber>;
        processingOrderPosition: z.ZodOptional<z.ZodNumber>;
        viewOrderPosition: z.ZodOptional<z.ZodNumber>;
    }, "uuid">, {
        key: z.ZodString;
    }>, "strip", z.ZodTypeAny, {
        key: string;
        version?: string | undefined;
        description?: string | undefined;
        label?: string | undefined;
        type?: string | undefined;
        inputType?: string | undefined;
        formula?: string | undefined;
        inputOrderPosition?: number | undefined;
        processingOrderPosition?: number | undefined;
        viewOrderPosition?: number | undefined;
    }, {
        key: string;
        version?: string | undefined;
        description?: string | undefined;
        label?: string | undefined;
        type?: string | undefined;
        inputType?: string | undefined;
        formula?: string | undefined;
        inputOrderPosition?: number | undefined;
        processingOrderPosition?: number | undefined;
        viewOrderPosition?: number | undefined;
    }>;
    values: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodObject<Omit<{
            uuid: z.ZodString;
            value: z.ZodOptional<z.ZodString>;
            valueTypeCast: z.ZodOptional<z.ZodString>;
            sourceType: z.ZodOptional<z.ZodString>;
        }, "uuid">, "strip", z.ZodTypeAny, {
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        }, {
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        }>;
        files: z.ZodOptional<z.ZodArray<z.ZodObject<{
            file: z.ZodObject<{
                fileName: z.ZodString;
                fileReference: z.ZodString;
                label: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            }, {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }, {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        value: {
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        };
        files?: {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }[] | undefined;
    }, {
        value: {
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        };
        files?: {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }[] | undefined;
    }>, "many">>;
    files: z.ZodOptional<z.ZodArray<z.ZodObject<{
        file: z.ZodObject<{
            fileName: z.ZodString;
            fileReference: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        }, {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }, {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    property: {
        key: string;
        version?: string | undefined;
        description?: string | undefined;
        label?: string | undefined;
        type?: string | undefined;
        inputType?: string | undefined;
        formula?: string | undefined;
        inputOrderPosition?: number | undefined;
        processingOrderPosition?: number | undefined;
        viewOrderPosition?: number | undefined;
    };
    values?: {
        value: {
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        };
        files?: {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }[] | undefined;
    }[] | undefined;
    files?: {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }[] | undefined;
}, {
    property: {
        key: string;
        version?: string | undefined;
        description?: string | undefined;
        label?: string | undefined;
        type?: string | undefined;
        inputType?: string | undefined;
        formula?: string | undefined;
        inputOrderPosition?: number | undefined;
        processingOrderPosition?: number | undefined;
        viewOrderPosition?: number | undefined;
    };
    values?: {
        value: {
            value?: string | undefined;
            valueTypeCast?: string | undefined;
            sourceType?: string | undefined;
        };
        files?: {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }[] | undefined;
    }[] | undefined;
    files?: {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }[] | undefined;
}>;
export declare const complexObjectCreationSchema: z.ZodObject<{
    object: z.ZodObject<Omit<{
        uuid: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        abbreviation: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        isTemplate: z.ZodOptional<z.ZodBoolean>;
    }, "uuid">, "strip", z.ZodTypeAny, {
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    }, {
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    }>;
    parents: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    files: z.ZodOptional<z.ZodArray<z.ZodObject<{
        file: z.ZodObject<{
            fileName: z.ZodString;
            fileReference: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        }, {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }, {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }>, "many">>;
    properties: z.ZodOptional<z.ZodArray<z.ZodObject<{
        property: z.ZodObject<z.objectUtil.extendShape<Omit<{
            uuid: z.ZodString;
            key: z.ZodString;
            version: z.ZodOptional<z.ZodString>;
            label: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
            inputType: z.ZodOptional<z.ZodString>;
            formula: z.ZodOptional<z.ZodString>;
            inputOrderPosition: z.ZodOptional<z.ZodNumber>;
            processingOrderPosition: z.ZodOptional<z.ZodNumber>;
            viewOrderPosition: z.ZodOptional<z.ZodNumber>;
        }, "uuid">, {
            key: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        }, {
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        }>;
        values: z.ZodOptional<z.ZodArray<z.ZodObject<{
            value: z.ZodObject<Omit<{
                uuid: z.ZodString;
                value: z.ZodOptional<z.ZodString>;
                valueTypeCast: z.ZodOptional<z.ZodString>;
                sourceType: z.ZodOptional<z.ZodString>;
            }, "uuid">, "strip", z.ZodTypeAny, {
                value?: string | undefined;
                valueTypeCast?: string | undefined;
                sourceType?: string | undefined;
            }, {
                value?: string | undefined;
                valueTypeCast?: string | undefined;
                sourceType?: string | undefined;
            }>;
            files: z.ZodOptional<z.ZodArray<z.ZodObject<{
                file: z.ZodObject<{
                    fileName: z.ZodString;
                    fileReference: z.ZodString;
                    label: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    fileName: string;
                    fileReference: string;
                    label?: string | undefined;
                }, {
                    fileName: string;
                    fileReference: string;
                    label?: string | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                file: {
                    fileName: string;
                    fileReference: string;
                    label?: string | undefined;
                };
            }, {
                file: {
                    fileName: string;
                    fileReference: string;
                    label?: string | undefined;
                };
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            value: {
                value?: string | undefined;
                valueTypeCast?: string | undefined;
                sourceType?: string | undefined;
            };
            files?: {
                file: {
                    fileName: string;
                    fileReference: string;
                    label?: string | undefined;
                };
            }[] | undefined;
        }, {
            value: {
                value?: string | undefined;
                valueTypeCast?: string | undefined;
                sourceType?: string | undefined;
            };
            files?: {
                file: {
                    fileName: string;
                    fileReference: string;
                    label?: string | undefined;
                };
            }[] | undefined;
        }>, "many">>;
        files: z.ZodOptional<z.ZodArray<z.ZodObject<{
            file: z.ZodObject<{
                fileName: z.ZodString;
                fileReference: z.ZodString;
                label: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            }, {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }, {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        property: {
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        };
        values?: {
            value: {
                value?: string | undefined;
                valueTypeCast?: string | undefined;
                sourceType?: string | undefined;
            };
            files?: {
                file: {
                    fileName: string;
                    fileReference: string;
                    label?: string | undefined;
                };
            }[] | undefined;
        }[] | undefined;
        files?: {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }[] | undefined;
    }, {
        property: {
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        };
        values?: {
            value: {
                value?: string | undefined;
                valueTypeCast?: string | undefined;
                sourceType?: string | undefined;
            };
            files?: {
                file: {
                    fileName: string;
                    fileReference: string;
                    label?: string | undefined;
                };
            }[] | undefined;
        }[] | undefined;
        files?: {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }[] | undefined;
    }>, "many">>;
    address: z.ZodOptional<z.ZodObject<Omit<{
        uuid: z.ZodString;
        fullAddress: z.ZodOptional<z.ZodString>;
        street: z.ZodOptional<z.ZodString>;
        houseNumber: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        district: z.ZodOptional<z.ZodString>;
    }, "uuid">, "strip", z.ZodTypeAny, {
        fullAddress?: string | undefined;
        street?: string | undefined;
        houseNumber?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
        district?: string | undefined;
    }, {
        fullAddress?: string | undefined;
        street?: string | undefined;
        houseNumber?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
        district?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    object: {
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    };
    properties?: {
        property: {
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        };
        values?: {
            value: {
                value?: string | undefined;
                valueTypeCast?: string | undefined;
                sourceType?: string | undefined;
            };
            files?: {
                file: {
                    fileName: string;
                    fileReference: string;
                    label?: string | undefined;
                };
            }[] | undefined;
        }[] | undefined;
        files?: {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }[] | undefined;
    }[] | undefined;
    files?: {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }[] | undefined;
    parents?: string[] | undefined;
    address?: {
        fullAddress?: string | undefined;
        street?: string | undefined;
        houseNumber?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
        district?: string | undefined;
    } | undefined;
}, {
    object: {
        version?: string | undefined;
        name?: string | undefined;
        abbreviation?: string | undefined;
        description?: string | undefined;
        isTemplate?: boolean | undefined;
    };
    properties?: {
        property: {
            key: string;
            version?: string | undefined;
            description?: string | undefined;
            label?: string | undefined;
            type?: string | undefined;
            inputType?: string | undefined;
            formula?: string | undefined;
            inputOrderPosition?: number | undefined;
            processingOrderPosition?: number | undefined;
            viewOrderPosition?: number | undefined;
        };
        values?: {
            value: {
                value?: string | undefined;
                valueTypeCast?: string | undefined;
                sourceType?: string | undefined;
            };
            files?: {
                file: {
                    fileName: string;
                    fileReference: string;
                    label?: string | undefined;
                };
            }[] | undefined;
        }[] | undefined;
        files?: {
            file: {
                fileName: string;
                fileReference: string;
                label?: string | undefined;
            };
        }[] | undefined;
    }[] | undefined;
    files?: {
        file: {
            fileName: string;
            fileReference: string;
            label?: string | undefined;
        };
    }[] | undefined;
    parents?: string[] | undefined;
    address?: {
        fullAddress?: string | undefined;
        street?: string | undefined;
        houseNumber?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
        district?: string | undefined;
    } | undefined;
}>;
export type ComplexObjectCreationSchemaType = z.infer<typeof complexObjectCreationSchema>;
