import gql from "./fetcher";
import { history, proposal as proposalQuery } from "./queries";
import { parseMdLink } from "../../parse-md-link";
import { dateDiff } from "../../date-diff";
import { getVoteBreakdown } from "../../vote-breakdown";

const subgraphUrl = new URL(
  "https://api.thegraph.com/subgraphs/name/show-karma/dao-on-chain-voting"
);

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
      title: proposal?.description?.split(/\n/)[0]?.replace(/\#+/gim, ""),
      proposalId: proposal.id,
      voteMethod: "On-chain",
      proposal: parseMdLink(proposal?.description),
      choice: vote?.support,
      solution: vote?.solution,
      executed: moment.unix(proposal.timestamp).format("MMMM D, YYYY"),
    });
  });

  return array;
}

/**
 * Fetch proposals from the subgraph
 * @param daoName
 * @returns array of voted and not voted proposals (not sorted)
 */
export async function fetchOnChainProposalVotes(
  daoNames = [],
  address = "",
  amount = 3
) {
  try {
    const votesQuery = history.onChain.votes(address, daoNames, amount);
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

const getProposalTitle = (proposal) => {
  const parts = proposal?.title?.split(/\n/);
  if (parts) {
    for (const title of parts) {
      if (title.replace(/\s+/, "").length) {
        return title?.replace(/\#+/gim, "");
      }
    }
  }
  return "No title";
};

const parseProposals = (proposals = []) =>
  proposals.map((proposal) => ({
    id: proposal.id.split("-")[1],
    type: "On-chain",
    title: getProposalTitle(proposal),
    shortname: proposal.title.slice(0, 40) + "...",
    voteCount: proposal.votes.length,
    voteBreakdown: getVoteBreakdown(proposal.votes),
    endsAt: proposal.endsAt
      ? moment.unix(proposal.endsAt).format("MMM D, YYYY")
      : null,
    voteStarts: moment.unix(proposal.endsAt).format("MMM D, YYYY"),
    dateDescription: dateDiff(proposal.endsAt),
    snapshotId: proposal.organization.id,
  }));

export async function fetchActiveOnChainProposals(daoNames, daysAgo) {
  try {
    const proposalsQuery = proposalQuery.onChain.proposal(
      daoNames,
      undefined,
      daysAgo
    );
    const { proposals } = await gql.query(subgraphUrl, proposalsQuery);
    if (proposals && Array.isArray(proposals)) {
      return parseProposals(proposals);
    }
    return [];
  } catch (error) {
    throw error;
    //
  }
}
