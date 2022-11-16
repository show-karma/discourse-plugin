/**
 * Checks if the given string is an Eth Address
 *
 * @method isAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
export function isEthAddress(address) {
  return (
    /^(0x)?[0-9a-f]{40}$/i.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)
  );
}
