import { isTypeof } from "./is-typeof";

function validate({ postId, body, csrf }) {
  isTypeof(body, "string");
  isTypeof(csrf, "string");
  isTypeof(postId, "number");

  if (!(postId && body && csrf)) {
    throw new Error("Something is missing from params.");
  }

  if (body.length < 20) {
    throw new Error("Body should have at least 20 chars.");
  }
}

/**
 * Post to a topic on discourse
 * @returns
 */
export default function updatePost({
  /**
   * The post id to edit
   */
  postId,
  /**
   * The body content. Must be at least 20 char
   */
  body,
  /**
   * CSRF token provided by the session (`this.session.csrfToken`)
   */
  csrf,
}) {
  validate(...arguments);

  const reqBody = {
    raw: body,
    edit_reason: "",
  };

  return fetch(`/posts/${postId}.json`, {
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrf,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(reqBody),
    method: "PUT",
    mode: "cors",
  })
    .then((res) => res.json())
    .catch((e) => {
      throw e;
    });
}
