const { BigInt } = window;

function applyTemplate(template, id, space) {
  return template.replace("{id}", id).replace("{space}", space ?? "");
}

export default function getProposalLink(proposal, tokenContract, siteSettings = {}) {
  if (!proposal) {
    return "";
  }

  let nLink;
  if (proposal.type === "Off-chain") {
    nLink = siteSettings.Custom_offchain_proposal_url
      ? applyTemplate(
          siteSettings.Custom_offchain_proposal_url,
          proposal.id,
          proposal.snapshotId
        )
      : `https://snapshot.org/#/${proposal.snapshotId}/proposal/${proposal.id}`;
  } else {
    const proposalId = BigInt(proposal.id).toString();
    nLink = siteSettings.Custom_onchain_proposal_url
      ? applyTemplate(
          siteSettings.Custom_onchain_proposal_url,
          proposalId,
          proposal.snapshotId
        )
      : tokenContract
      ? `https://tally.xyz/governance/eip155:1:${tokenContract}/proposal/${proposalId}`
      : "";
  }

  return nLink;
}
