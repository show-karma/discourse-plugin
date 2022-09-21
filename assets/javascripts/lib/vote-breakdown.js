import voting from "../lib/snapshot/index";
const scoreApiUrl = "https://score.snapshot.org/api/scores";

export async function getScores(
  space = "",
  strategies = [],
  network = "",
  addresses = [],
  snapshot = "latest"
) {
  try {
    const params = {
      space,
      network,
      snapshot,
      strategies,
      addresses,
    };
    const res = await fetch(scoreApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ params }),
    });
    const obj = await res.json();
    return obj.result.scores;
  } catch (e) {
    // eslint-disable-next-line no-restricted-globals
    return Promise.reject(e);
  }
}

export async function getResults(space, proposal, votes) {
  const voters = votes.map((vote) => vote.voter);
  const strategies = proposal.strategies ?? space.strategies;
  /* Get scores */
  if (proposal.state !== "pending") {
    const scores = await getScores(
      space.id,
      strategies,
      proposal.network,
      voters,
      // eslint-disable-next-line radix
      parseInt(proposal.snapshot)
    );

    votes = votes
      .map((vote) => {
        vote.scores = strategies.map(
          (_strategy, i) => scores[i][vote.voter] || 0
        );
        vote.balance = vote.scores.reduce((a, b) => a + b, 0);
        return vote;
      })
      .sort((a, b) => b.balance - a.balance)
      .filter((vote) => vote.balance > 0);
  }

  /* Get results */
  const votingClass = new voting[proposal.proposalType](
    proposal,
    votes,
    strategies
  );

  proposal.scores = votingClass.getScores();

  return proposal;
}

const getChoices = (choices = []) => {
  const vb = {};
  choices.forEach((choice) => (vb[choice] = 0));
  vb.total = 0;
  return vb;
};

/**
 * Parses the votes into breakdown sections in order to display
 * each option as a separate option in the UI.
 *
 * @param {*} votes
 * @param {*} choices
 * @returns
 */
export const getVoteBreakdown = (
  votes = [],
  choices = ["For", "Against", "Abstain"]
) => {
  const vb = getChoices(choices);
  votes.forEach((item) => {
    let choiceIdx = +item.choice;
    if (+item.choice === 0) {
      choiceIdx = 1;
    } else if (+item.choice === 1) {
      choiceIdx = 0;
    }
    const rValue = +item.weight / 1e18;
    vb[choices[choiceIdx]] += rValue;
    vb.total += rValue;
  });
  return vb;
};

export const getVoteBreakdownByProposal = (proposal = {}) => {
  const vb = getChoices(proposal.choices);
  const keys = Object.keys(vb);

  vb.total = 0;
  proposal.scores.forEach((score, idx) => {
    vb[keys[idx]] = score;
    vb.total += score;
  });
  proposal.voteBreakdown = vb;

  return proposal;
};
