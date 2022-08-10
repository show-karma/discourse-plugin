export function parseMdLink(string = "") {
  /* Match full links and relative paths */
  const regex = /\[(.*?)\]\((.*?)\)/gim;
  const groupRgx = /\[(.*?)\]\((.*?)\)/;

  // const string = "[View the analytics docs](https://getanalytics.io/)"

  const myMatch = string.match(regex);

  let parsedString = string;
  if (myMatch)
    myMatch.forEach((match) => {
      const [full, text, url] = match.match(groupRgx);
      if (full && text && url) {
        parsedString = parsedString.replace(
          full,
          `<a href="${url}" noopener target="_blank rel="noopener noreferrer"">${text}</a>`
        );
      }
    });
  return parsedString;
}
