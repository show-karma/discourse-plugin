/**
 * Creates a fetch request
 * @param {string} url target url
 * @param {*} body requets body. NULL if GET,DELETE
 * @param {"POST"|"GET"|"PUT"|"DELETE"|"PATCH"} method request method
 * @param {*} headers request headers
 * @returns
 */
export async function request(url, body, method = "POST", headers = {}) {
  const { data } = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  }).then(async (res) => await res.json());

  return { ...data };
}
