import KarmaApiClient from "../../karma-api-client";

const getVoteReason = (vote) => {
  if (!vote.reason || typeof vote.reason === 'boolean') { return 'Did not vote'; }
  if (vote.reason.toLowerCase() === 'for') { return 1; }
  if (vote.reason.toLowerCase() === 'abstain') { return 'ABSTAIN'; }
  return 0;
};

/**
 * Concat proposal and votes into a common interface
 * @param proposals
 * @param votes
 */
function concatOnChainProposals(proposals, votes) {
  const array = [];

  votes.forEach((vote) => {
    const { proposal } = vote;
    const original = proposals.find(item => +item.id === +proposal);
    array.push({
      voteMethod: 'On-chain',
      proposal: original?.description || `Proposal ${proposal}`,
      choice: getVoteReason(vote),
      solution: vote?.solution,
      reason: vote?.reason,
      executed: moment
        .unix(original?.timestamp || Math.round(Date.now() / 1000))
        .format('MMMM D, YYYY'),
      executedTimestamp: original?.timestamp || Math.round(Date.now() / 1000),
      voteId: proposal,
      trackId: Number(original?.trackId),
      version: original?.version,
    });
  });

  proposals.forEach(proposal => {
    if (!array.find(item => item.voteId && +item.voteId === +proposal.id)) {
      array.push({
        voteMethod: 'On-chain',
        proposal: proposal.description,
        choice: -1,
        solution: null,
        executed: moment.unix(proposal.timestamp).format('MMMM D, YYYY'),
        executedTimestamp: proposal.timestamp,
        voteId: proposal.id.toString(),
        finished: proposal.finished,
        trackId: Number(proposal?.trackId),
        version: proposal?.version,
      });
    }
  });

  return array.sort((a, b) => b.executedTimestamp - a.executedTimestamp);
}

async function proposalsWithMetadata(daoName) {
  const url = `https://delegate.moonbeam.network/api/proposals?dao=${daoName?.toLowerCase()}&source=on-chain`;
  const data = await fetch(url, {
    method: "GET",
  }).then(async (res) => await res.json());
  return data;
}

async function getDaoProposals(
  cachedProposals = [],
  daoName = 'moonbeam'
) {
  const proposals = await proposalsWithMetadata(daoName);
  const proposalsMap = proposals.map(proposal => {
    const status = Object.entries(proposal.information)[0];
    const matchedProposal = cachedProposals.find(
      pr =>
        +pr.id === +proposal.proposalId &&
        (proposal.trackId === null) === (pr.version === 'V1')
    );
    const timestamp =
      (cachedProposals.find(
        pr =>
          +pr.id === +proposal.proposalId &&
          (proposal.trackId === null) === (pr.version === 'V1')
      )?.startDate || 0) / 1000;

    return {
      proposal: proposal.proposalId,
      id: `${proposal.proposalId}`,
      description:
        proposal.proposal || `Proposal ${proposal.proposalId.toString()}`,
      timestamp: Math.round(timestamp),
      trackId: proposal.trackId,
      finished: !status ? true : status[0] !== 'ongoing',
      version: matchedProposal?.version,
    };
  });

  // eslint-disable-next-line id-length
  return proposalsMap.sort((a, b) => b.timestamp - a.timestamp);
}

async function fetchOnChainVotes(daoName, address) {
  if (!daoName || !address) { return []; }
  try {
    daoName = [daoName].flat()[0];
    const cli = new KarmaApiClient([daoName].flat()[0], address);
    const { votes, proposals: cachedProposals } = await cli.fetchVoteSummary();

    const voteList = votes.map(vote => ({
      proposal: vote.proposalId.split('-')[0],
      openGov: vote.proposalId.split('-')[1] === 'V2',
      reason: vote.reason,
    }));
    if (voteList && Array.isArray(voteList)) {
      const proposals = await getDaoProposals(cachedProposals, daoName);

      return concatOnChainProposals(proposals, voteList);
    }
  } catch (error) {
    return [];
  }
  return [];
}

export async function moonriverFetcher(
  daoName,
  address
) {
  try {
    const votes = await fetchOnChainVotes(daoName, address);
    return votes;
  } catch (error) {
    return [];
  }
}
