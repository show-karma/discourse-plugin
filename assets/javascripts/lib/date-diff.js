export function dateDiff(date) {
  const now = Date.now() / 1000;
  let diff =
    now >= +date ? `${moment().diff(moment.unix(date), "hour")}` : false;

  if (!diff) {
    return undefined;
  }

  let unit = "hours";
  if (diff && diff >= 24) {
    diff = Math.floor(diff / 24);
    unit = `day${diff > 1 ? "s" : ""}`;
  }

  return `${diff} ${unit} ago`;
}
