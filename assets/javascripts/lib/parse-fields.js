function getFieldType(type, optionsType = "select:") {
  if (!type) {
    return "string";
  }

  if (typeof type !== "string") {
    throw new Error(`"type" must be typeof string, ${typeof type} received.`);
  }

  const types = `(string|text|number|${optionsType})`;
  const rgx = new RegExp(types, "i");
  const match = type.match(rgx);
  if (!match) {
    throw new Error(
      `Type value must be like ${types}, received ${type} instead.`
    );
  }

  return String(match[0]);
}

function tryJson(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return null;
  }
}

function parseScheme(fieldStr, delimiter) {
  const fields = [];
  const parts = fieldStr.split(delimiter.field);
  parts.forEach((p) => {
    const [label, fieldType] = p.split(delimiter.type);
    let options;
    try {
      const type = getFieldType(fieldType, delimiter.options.self);
      if (type.includes(delimiter.options.self)) {
        options = fieldType
          .split(type)[1]
          .split(delimiter.options.values)
          .slice(1)
          .map((name, id) => ({
            id,
            name: name.trim(),
          }));
      }
      fields.push({
        label: label.trim(),
        type: type.replaceAll(/\W/gi, "").trim(),
        options,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.info(e.message + ` ::Field "${label}" ignored`);
    }
  });
  return fields;
}

/**
 * Parses a string of defined fields into a field definition array.
 *
 * @param {string} fieldStr the field string
 * @param {{
 *  field: string,
 *  type: string,
 *  options: {
 *    self: string,
 *    values: string
 *  }
 * }} delimiter Object with delimiters
 * @returns
 */
export default function parseFields(
  fieldStr,
  delimiter = {
    field: ";",
    type: "|",
    options: {
      self: "select:",
      values: "o:",
    },
  }
) {
  const isJson = tryJson(fieldStr);
  if (isJson) {
    return isJson;
  }

  return parseScheme(fieldStr, delimiter);
}
