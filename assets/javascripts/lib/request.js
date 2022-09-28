export async function request(url, body, method = "POST") {
  const { data } = await fetch(url, {
    method,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (res) => await res.json());

  return { ...data };
}
