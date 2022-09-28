export async function request(url, body, method = "POST") {
  const { data } = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (res) => await res.json());

  return { ...data };
}
