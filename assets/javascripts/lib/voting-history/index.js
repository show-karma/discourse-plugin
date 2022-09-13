import { fetchOffChainProposalVotes } from "./gql/off-chain-fetcher";
import { fetchOnChainProposalVotes } from "./gql/on-chain-fetcher";
import template from "./template";

const karma = "https://showkarma.xyz/profile";

const VotingHistory = {
  shouldShowVotingHistory(ctx) {
    const amount = ctx.SiteSettings.Show_voting_history?.trim?.() || 0;
    const regex = /\D/g;
    if (!regex.test(amount)) {
      return Math.min(+amount, 50);
    }
    return 0;
  },

  async start(profile, ctx, wrapperId = ".__karma-stats") {
    if (!ctx || !ctx.SiteSettings || !profile) {
      return;
    }

    if (profile && profile.address) {
      $(`${wrapperId} #__karma-voting-wrapper`).css("display", "initial");
      $(`${wrapperId} #__karma-user-profile`).prop(
        "href",
        `${karma}/${profile.address}`
      );
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

    // const offChain = await fetchOffChainProposalVotes(
    //   daoNames,
    //   profile.address,
    //   amount
    // );

    // const votes = onChain.concat(offChain);
    const votes = onChain;

    votes.sort((a, b) =>
      moment(a.executed).isBefore(moment(b.executed)) ? 1 : -1
    );

    return votes.slice(0, amount);
  },

  async render(data = [], elId = `.__karma-stats #__karma-voting-history`) {
    const wrapper = $(`${elId}`);
    let display;
    if (data.length) {
      display = data.map((d) =>
        template(d.proposal, d.voteMethod, d.executed, d.choice)
      );
    } else {
      display = "<p>No voting history found.</p>";
    }
    wrapper.html(display);
  },
};

export default VotingHistory;
