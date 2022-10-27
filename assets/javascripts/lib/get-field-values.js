import { isTypeof } from "./is-typeof";
/**
 *
 * @param {import("karma-score").CustomField[]} fields
 * @returns
 */
export function getFieldValues(fields) {
  isTypeof(fields, "array");
  return fields.map((field) => ({
    label: field.label,
    value: field.value,
  }));
}

/**
 *
 * @param {import("karma-score").CustomField[]} fields
 * @param {import("karma-score").FormFieldValue[]} values
 */
export function valuesToFields(fields, values) {
  isTypeof(fields, "array");
  isTypeof(values, "array");
  values.map((v) => {
    const labelIdx = fields.findIndex((f) => f.label === v.label);
    if (labelIdx >= 0) {
      fields[labelIdx].value = v.value;
    }
  });

  return fields;
}

/**
 *
 * @param {import("karma-score").CustomField[]} fields
 */
export function createPostTextFromFields(fields) {
  let post = "";
  fields.forEach((field) => {
    post += `**${field.postTitle || field.label}**: ${[field.value]
      .flat()
      .join(", ")}\n`;
  });
  return post;
}
