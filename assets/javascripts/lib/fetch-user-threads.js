/**
 * Fetch threads user has created
 * @returns
 */
export default function fetchUserThreads(username) {
  return fetch(`/topics/created-by/${username}.json`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    method: "GET",
    mode: "cors",
  }).then((res) => res.json());
}
