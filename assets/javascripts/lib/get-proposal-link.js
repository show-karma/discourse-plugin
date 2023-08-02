const { BigInt } = window;

export default function getProposalLink(proposal, tokenContract) {
  if (!proposal) {
    return "";
  }

  let nLink;
  if (proposal.type === "Off-chain") {
    nLink = `https://snapshot.org/#/${proposal.snapshotId}/proposal/${proposal.id}`;
  } else {
    console.log({ proposal })
    const proposalId = BigInt(proposal.id).toString();
    nLink = tokenContract
      ? `https://tally.xyz/governance/eip155:1:${tokenContract}/proposal/${proposalId}`
      : "";
  }

  return nLink;
}
