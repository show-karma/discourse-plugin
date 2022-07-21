import { history } from "./queries";

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
export async function fetchOnChainProposalVotes(daoname = [], address = "") {
  try {
    const { data: votes } = await subgraphCli.query({
      query: history.onChain.votes,
      variables: {
        daoname: [daoname].flat(),
        address,
      },
    });
    if (votes && Array.isArray(votes.votes)) {
      const skipIds = votes.votes.map((vote) => vote.proposal.id);
      const { data: proposals } = await subgraphCli.query({
        query: history.onChain.proposals,
        variables: {
          daoname: [daoname].flat(),
          skipIds,
        },
      });
      return concatProposals(proposals.proposals, votes.votes);
    }
  } catch (error) {
    throw error;
    //
  }
  return [];
}
