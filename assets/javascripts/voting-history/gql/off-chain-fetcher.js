import gql from "./fetcher";
import { history } from "./queries";

const subgraphUrl = new URL(
  "https://api.thegraph.com/subgraphs/name/show-karma/dao-on-chain-voting"
);

/**
 * Concat proposal and votes into a common interface
 * @param proposals
 * @param votes
 */
function concatProposals(proposals = [], votes = []) {
  const array = [];

  votes.forEach((vote) => {
    const { proposal } = vote;
    array.push({
      voteMethod: "On-chain",
      proposal: proposal?.description,
      choice: vote?.support,
      solution: vote?.solution,
      executed: moment.unix(proposal.timestamp).format("MMMM D, YYYY"),
    });
  });

  proposals.forEach((proposal) => {
    array.push({
      voteMethod: "On-chain",
      proposal: proposal?.description,
      choice: -1,
      solution: null,
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
export async function fetchOffChainProposalVotes(daoNames = [], address = "") {
  try {
    const votesQuery = history.offChain.votes(address, daoNames);
    const { votes } = await gql.query(subgraphUrl, votesQuery);

    if (votes && Array.isArray(votes)) {
      const skipIds = votes.map((vote) => vote.proposal.id);

      const proposalQuery = history.offChain.proposals(daoNames, skipIds);
      const { proposals } = await gql.query(subgraphUrl, proposalQuery);
      return concatProposals(proposals, votes);
    }
  } catch (error) {
    throw error;
    //
  }
  return [];
}
