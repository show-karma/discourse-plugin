import { fetchDaoSnapshotAndOnChainIds } from "../fetch-snapshot-onchain-ids";
import { fetchOffChainProposalVotes } from "./gql/off-chain-fetcher";
import { fetchOnChainProposalVotes } from "./gql/on-chain-fetcher";
import template from "./template";

const karma = "https://karmahq.xyz/profile";

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

    const daoName = window.selectedDao;
    const amount = this.shouldShowVotingHistory(ctx);

    // TODO fix this workaround by refactoring this code into components
    this.daoIds = (await fetchDaoSnapshotAndOnChainIds(daoName));


    let onChain = [];
    if (this.daoIds.onChain?.length) {
      onChain = await fetchOnChainProposalVotes(
        [this.daoIds.onChain].flat(),
        profile.address,
        amount
      );
    }

    let offChain = [];
    if (this.daoIds.snapshotIds?.length) {
      offChain = await fetchOffChainProposalVotes(
        [this.daoIds.snapshotIds].flat(),
        profile.address,
        amount
      );
    }

    const votes = onChain.concat(offChain);
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
