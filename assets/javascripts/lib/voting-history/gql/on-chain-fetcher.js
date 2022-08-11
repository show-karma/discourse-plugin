import gql from "./fetcher";
import { history, proposal } from "./queries";
import { parseMdLink } from "../../parse-md-link";

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

const parseProposals = (proposals = []) =>
  proposals.map((proposal) => ({
    type: "On-chain",
    title: parseMdLink(proposal.title),
    voteCount: proposal.votes.length,
    endsAt: moment.unix(proposal.endsAt).format("MMMM D, YYYY"),
  }));

export async function fetchActiveOnChainProposals(daoNames) {
  try {
    const proposalsQuery = proposal.onChain.proposal(daoNames);
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
