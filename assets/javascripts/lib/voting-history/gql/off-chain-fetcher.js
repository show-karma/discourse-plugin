import gql from "./fetcher";
import { history, proposal as proposalQuery } from "./queries";
import { parseMdLink } from "../../parse-md-link";
import { dateDiff } from "../../date-diff";
import { getVoteBreakdown } from "../../vote-breakdown";

const subgraphUrl = new URL("https://hub.snapshot.org/graphql");

/**
 * Concat proposal and votes into a common interface
 * @param proposals
 * @param votes
 */
function parseVotes(votes = []) {
  const array = [];

  votes.forEach((vote) => {
    const { proposal } = vote;
    array.push({
      proposalId: proposal.id,
      voteMethod: "Off-chain",
      proposal: parseMdLink(proposal?.title),
      choice: Array.isArray(vote.choice)
        ? "Multiple"
        : proposal.choices[vote.choice - 1],
      executed: moment.unix(proposal.end).format("MMMM D, YYYY"),
    });
  });

  return array;
}

/**
 * Fetch proposals from the subgraph
 * @param daoName
 * @returns array of voted and not voted proposals (not sorted)
 */
export async function fetchOffChainProposalVotes(
  daoNames = [],
  address = "",
  amount = 3
) {
  try {
    const votesQuery = history.offChain.votes(address, daoNames, amount);
    const { votes } = await gql.query(subgraphUrl, votesQuery);

    if (votes && Array.isArray(votes)) {
      return parseVotes(votes);
    }
    return [];
  } catch (error) {
    throw error;
    //
  }
}

const withVoteBreakdown = async (proposals = []) => {
  const voteBreakdownQuery = proposalQuery.offChain.votes(
    proposals.map((p) => p.id)
  );
  const { votes } = await gql.query(subgraphUrl, voteBreakdownQuery);

  if (votes && Array.isArray(votes)) {
    return proposals.map((proposal) => {
      const proposalVotes = votes.filter(
        (item) => item.proposal.id === proposal.id
      );
      // eslint-disable-next-line no-bitwise
      if (~proposalVotes) {
        proposal.voteBreakdown = getVoteBreakdown(
          proposalVotes,
          Array.isArray(proposal.choices) ? proposal.choices : undefined
        );
      }
      return proposal;
    });
  }
  return proposals;
};

const parseProposals = (proposals = []) =>
  proposals.map((proposal) => ({
    id: proposal.id,
    type: "Off-chain",
    title: parseMdLink(proposal.title),
    voteCount: proposal.votes,
    voteBreakdown: { for: 0, abs: 0, no: 0, total: 0 },
    endsAt: moment.unix(proposal.endsAt).format("MMMM D, YYYY"),
    dateDescription: dateDiff(proposal.endsAt),
    snapshotId: proposal.space.id,
    choices: proposal.choices,
  }));

export async function fetchActiveOffChainProposals(daoNames, daysAgo) {
  try {
    const proposalsQuery = proposalQuery.offChain.proposal(
      daoNames,
      undefined,
      daysAgo
    );
    const { proposals } = await gql.query(subgraphUrl, proposalsQuery);
    if (proposals && Array.isArray(proposals)) {
      return withVoteBreakdown(parseProposals(proposals));
    }
    return [];
  } catch (error) {
    throw error;
    //
  }
}
