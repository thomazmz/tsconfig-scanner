import joi from "joi";

function baseArray() {
  return joi.array().required().strict();
}

export function array(schema?: joi.Schema) {
  return schema ? baseArray().items(schema) : baseArray();
}

function baseString() {
  return joi.string().strict().required();
}

export function string(...allowedValues: string[]) {
  return allowedValues.length > 0
    ? baseString().valid(...allowedValues)
    : baseString().allow("");
}

function baseObject(schemaMap?: joi.SchemaMap) {
  return joi.object(schemaMap).required().strict();
}

export function object(schemaMap?: joi.SchemaMap) {
  return baseObject(schemaMap);
}

function baseNumber() {
  return joi.number().required();
}

export function number(...allowedValues: number[]) {
  return allowedValues.length > 0
    ? baseNumber().valid(...allowedValues)
    : baseNumber();
}