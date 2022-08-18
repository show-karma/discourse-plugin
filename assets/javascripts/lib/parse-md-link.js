export function parseMdLink(string = "") {
  const regex = /\[(.*?)\]\((.*?)\)/gim;
  const groupRgx = /\[(.*?)\]\((.*?)\)/;

  const myMatch = string.match(regex);

  let parsedString = string;
  if (myMatch) {
    myMatch.forEach((match) => {
      const [full, text, url] = match.match(groupRgx);
      if (full && text && url) {
        parsedString = parsedString
          .replace(
            full,
            `<a href="${url}" noopener target="_blank rel="noopener noreferrer"">${text}</a>`
          )
          .replace(/\\|\#/g, "");
      }
    });
  }
  return parsedString;
}
