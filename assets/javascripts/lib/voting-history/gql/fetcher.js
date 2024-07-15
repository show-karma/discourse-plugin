function parseBody(body) {
  return JSON.stringify(body)
    .replace(/(\\\\)/gm, "\\")
    .replace(/(\\t)/gm, "");
}

const gql = {
  async query(url, query) {
    const { data } = await fetch(url, {
      body: parseBody({ query }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (res) => await res.json());
    const response = data?.data?.data || data?.data || data;
    return { ...response };
  },
};

export default gql;
