import { getNumberWithOrdinal } from "../get-number-with-ordinal";
import { BaseScore } from "./BaseScore";

function irv(
  ballots = [[]],
  rounds = [
    {
      round: 0,
      sortedByHighest: [["", [0, [0]]]],
    },
  ]
) {
  const candidates = [...new Set(ballots.map((vote) => vote[0]).flat())];
  const votes = Object.entries(
    ballots.reduce((votesAcc, [v], i, src) => {
      const balance = src[i][1];
      votesAcc[v[0]][0] += balance;

      const score = src[i][2];
      if (score.length > 1) {
        votesAcc[v[0]][1] = score.map(
          (s, sI) => s + votesAcc[v[0]][1][sI] || s
        );
      } else {
        votesAcc[v[0]][1] = [
          votesAcc[v[0]][1].concat(score).reduce((a, b) => a + b, 0),
        ];
      }
      return votesAcc;
    }, Object.assign({}, ...candidates.map((c) => ({ [c]: [0, []] }))))
  );

  const votesWithoutScore = votes.map((vote) => [vote[0], vote[1][0]]);

  const [, topCount] = votesWithoutScore.reduce(
    ([n, m], [v, c]) => (c > m ? [v, c] : [n, m]),
    ["?", -Infinity]
  );
  const [bottomCand] = votesWithoutScore.reduce(
    ([n, m], [v, c]) => (c < m ? [v, c] : [n, m]),
    ["?", Infinity]
  );

  const sortedByHighest = votes.sort((a, b) => b[1][0] - a[1][0]);

  const totalPowerOfVotes = ballots
    .map((bal) => bal[1])
    .reduce((a, b) => a + b, 0);

  rounds.push({
    round: rounds.length + 1,
    sortedByHighest,
  });

  return topCount > totalPowerOfVotes / 2 || sortedByHighest.length < 3
    ? rounds
    : irv(
        ballots
          .map((ballot) => [
            // eslint-disable-next-line eqeqeq
            ballot[0].filter((c) => c != bottomCand),
            ballot[1],
            ballot[2],
          ])
          .filter((ballot) => ballot[0].length > 0),
        rounds
      );
}

function getFinalRound(votes = []) {
  const rounds = irv(
    votes.map((vote) => [vote.choice, vote.balance, vote.scores]),
    []
  );
  const finalRound = rounds[rounds.length - 1];
  return finalRound.sortedByHighest;
}

export default class RankedChoiceVoting extends BaseScore {
  static isValidChoice(voteChoice = [0], proposalChoices = [""]) {
    return (
      Array.isArray(voteChoice) &&
      // If voteChoice index is not in choices, return false
      voteChoice.every((vc) => proposalChoices?.[vc - 1] !== undefined) &&
      // If any voteChoice is duplicated, return false
      voteChoice.length === new Set(voteChoice).size &&
      // If voteChoice is empty, return false
      voteChoice.length > 0 &&
      // If not all proposalChoices are selected, return false
      // TODO: We should add support for pacial bailout in the future
      voteChoice.length === proposalChoices.length
    );
  }

  getValidVotes() {
    return this.votes.filter((vote) =>
      RankedChoiceVoting.isValidChoice(vote.choice, this.proposal.choices)
    );
  }

  getScores() {
    const finalRound = getFinalRound(this.getValidVotes());
    return this.proposal.choices.map((choice, i) =>
      finalRound
        .filter((res) => Number(res[0]) === i + 1)
        .reduce((a, b) => a + b[1][0], 0)
    );
  }

  getScoresByStrategy() {
    const finalRound = getFinalRound(this.getValidVotes());
    return this.proposal.choices.map((choice, i) =>
      this.strategies.map((strategy, sI) => {
        return finalRound
          .filter((res) => Number(res[0]) === i + 1)
          .reduce((a, b) => a + b[1][1][sI], 0);
      })
    );
  }

  getScoresTotal() {
    return this.getScores().reduce((a, b) => a + b);
  }

  getChoiceString() {
    return this.selected
      .map((choice) => {
        if (this.proposal.choices[choice - 1]) {
          return this.proposal.choices[choice - 1];
        }
      })
      .map((el, i) => `(${getNumberWithOrdinal(i + 1)}) ${el}`)
      .join(", ");
  }
}
