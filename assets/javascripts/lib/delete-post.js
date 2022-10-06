import { isTypeof } from "./is-typeof";

function validate({ postId, csrf }) {
  isTypeof(csrf, "string");
  isTypeof(postId, "number");

  if (!(postId && csrf)) {
    throw new Error("Something is missing from params.");
  }
}

/**
 * Post to a topic on discourse
 * @returns
 */
export default function deletePost({
  /**
   * The topic/thread id
   */
  postId,
  /**
   * CSRF token provided by the session (`this.session.csrfToken`)
   */
  csrf,
}) {
  validate(...arguments);

  return fetch(`/posts/${postId}.json`, {
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrf,
    },
    method: "DELETE",
    mode: "cors",
  })
    .then((res) => res.json())
    .catch((e) => {
      throw e;
    });
}
