/**
 * Validates if `o` is typeof `t` and perform desired actions.
 * @param {*} o the object to be tested
 * @param {"number"|"string"|"object"|"array"} t the typeof (number, string, object, array)
 * @param {boolean} _throw will throw an error if true, otherwise, returns false.
 * @returns
 */
export function isTypeof(o, t, _throw = true) {
  const dispatchError = (b) => {
    if (b && _throw) {
      throw new Error(`Invalid type. Expecting ${t}, received ${typeof o}`);
    }
  };

  let bool = true;

  bool = ("array".includes(t) && !Array.isArray(o)) || typeof o !== t;
  dispatchError(bool);
  return bool;
}
