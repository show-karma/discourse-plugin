/* eslint-disable no-restricted-globals */
import gql from "./fetcher";
import { history, proposal as proposalQuery } from "./queries";
import { parseMdLink } from "../../parse-md-link";
import { dateDiff } from "../../date-diff";

const subgraphUrl = new URL("https://hub.snapshot.org/graphql");

/**
 * Concat proposal and votes into a common interface
 * @param proposals
 * @param votes
 * @returns {import("karma-score").ParsedProposal[])}
 */
function parseVotes(votes = []) {
  const array = [];

  votes.forEach((vote) => {
    const { proposal } = vote;
    array.push({
      title: proposal?.title,
      proposalId: proposal.id,
      voteMethod: "Off-chain",
      proposal: parseMdLink(proposal?.title),
      choice:
        Array.isArray(vote.choice) || Object.keys(vote.choice || {}).length
          ? "Multiple"
          : proposal.choices[vote.choice - 1]?.toUpperCase(),
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

const paginateVote = async (proposals = []) => {
  const loop = async (acc = [], page = 0) => {
    const voteBreakdownQuery = proposalQuery.offChain.votes(
      proposals.map((p) => p.id),
      page
    );
    const { votes } = await gql.query(subgraphUrl, voteBreakdownQuery);
    if (Array.isArray(votes)) {
      acc.push(...votes);
    }

    if (votes?.length === 1000) {
      await loop(acc, page + 1);
    }
    return acc;
  };

  const result = await loop();
  return result;
};

const withVoteBreakdown = async (proposals = []) => {
  if (proposals.length) {
    const votes = await paginateVote(proposals);
    const { spaces } = await gql.query(
      subgraphUrl,
      proposalQuery.offChain.strategies([proposals[0].snapshotId])
    );

    const [space] = spaces;

    if (votes && Array.isArray(votes)) {
      proposals = proposals.map((proposal) => {
        proposal.votes = votes.filter(
          (item) => item.proposal.id === proposal.id
        );
        proposal.space = space;
        return proposal;
      });

      return proposals;
    }
  }
  return [];
};

const parseProposals = (proposals = []) =>
  proposals.map((proposal) => ({
    id: proposal.id,
    type: "Off-chain",
    title: parseMdLink(proposal.title),
    shortname: proposal.title.slice(0, 40) + "...",
    voteCount: proposal.votes,
    voteBreakdown: { For: 0, Abstain: 0, Against: 0, total: 0 },
    endsAt: moment.unix(proposal.endsAt).format("MMM D, YYYY"),
    voteStarts: moment.unix(proposal.start).format("MMM D, YYYY"),
    dateDescription: dateDiff(proposal.endsAt),
    snapshotId: proposal.space.id,
    choices: proposal.choices,
    strategies: proposal.strategies,
    network: proposal.network,
    snapshot: proposal.snapshot,
    proposalType: proposal.type,
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
