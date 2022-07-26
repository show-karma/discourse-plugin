import { fetchOffChainProposalVotes } from "./gql/off-chain-fetcher";
import { fetchOnChainProposalVotes } from "./gql/on-chain-fetcher";

import template from "./template";

const VotingHistory = {
  shouldShowVotingHistory(ctx) {
    const amount = ctx.SiteSettings.Show_voting_history?.trim?.() || 0;
    const regex = /\D/g;
    if (!regex.test(amount)) {
      return Math.min(+amount, 50);
    }
    return 0;
  },

  async start(profile, ctx) {
    if (!ctx || !ctx.SiteSettings) {
      return;
    }

    const { DAO_name: daoName } = ctx.SiteSettings;
    const amount = this.shouldShowVotingHistory(ctx);
    const daoNames = [daoName];

    if (!/\.eth$/g.test(daoName)) {
      daoNames.push(`${daoName}.eth`);
    }

    const onChain = await fetchOnChainProposalVotes(
      daoNames,
      profile.address,
      amount
    );

    const offChain = await fetchOffChainProposalVotes(
      daoNames,
      profile.address,
      amount
    );

    const votes = onChain.concat(offChain);

    votes.sort((a, b) =>
      moment(a.executed).isBefore(moment(b.executed)) ? 1 : -1
    );

    this.render(votes.slice(0, amount), "__karma-voting-history");
  },

  async render(data = [], elId = "") {
    const wrapper = $(`#${elId}`);
    const display = data.map((d) =>
      template(d.proposal, d.voteMethod, d.executed, d.choice)
    );
    wrapper.html(display);
  },
};

export default VotingHistory;
