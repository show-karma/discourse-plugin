const circle = (color, inner = "") => `<svg class="vote-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2"/>${inner}</svg>`;

const voteIcon = {
  no: circle(
    "#F04438",
    `<path d="M9 9l6 6M15 9l-6 6" stroke="#F04438" stroke-width="2" stroke-linecap="round"/>`
  ),
  yes: circle(
    "#12B76A",
    `<path d="M7.5 12.5l3 3 6-6.5" stroke="#12B76A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
  ),
  empty: circle("#98A2B3"),
};

function getIcon(choice = "not vote") {
  if (!choice || /not vote/gi.test(choice)) {
    return voteIcon.empty;
  }
  if (
    choice?.toLowerCase?.().substring(0, 2) === "no" ||
    /agai+nst/gi.test(choice)
  ) {
    return voteIcon.no;
  }
  if (/abstain/gi.test(choice)) {
    return voteIcon.empty;
  }

  return voteIcon.yes;
}

export function renderVote(vote) {
  const voteText = (+vote === 0 ? "No" : +vote === 1) ? "Yes" : vote;
  return `${getIcon(voteText)}
  <p class="vote-choice">${voteText ?? "Didn't vote"}</p>`;
}

export default (name, type, executedAt, vote) => `
<div class="voting-item">
    <div class="details">
        <p class="name">${name}</p>
        <div class="status-container">
            <p class="chain">${type}</p>
            <p class="executed">Executed ${executedAt}</p>
        </div>
    </div>
    <div class="decision">
        ${renderVote(vote)}
    </div>
</div>
`;
