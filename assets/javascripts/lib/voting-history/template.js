const voteIcon = {
  no: "https://www.karmahq.xyz/icons/cross-circle.svg",
  yes: "https://www.karmahq.xyz/icons/check-circle.svg",
  empty: "https://www.karmahq.xyz/icons/empty-circle.svg",
};

function getIcon(choice = "not vote") {
  if (!choice || /not vote/gi.test(choice)) {
    return voteIcon.empty;
  }
  if (
    choice.toLocaleLowerCase().substring(0, 2) === "no" ||
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
  return `<img src="${getIcon(voteText)}" alt="check-circle">
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
