import { fetchOnChainProposalVotes } from "./gql/on-chain-fetcher";
import { history } from "./gql/queries";

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
    const query = history.onChain.votes(profile.address, [daoName]);
    // const votes = await fetchOnChainProposalVotes(
    //   [daoName],
    //   profile.address,
    //   amount
    // );
    // eslint-disable-next-line no-console
    console.debug(amount, daoName, profile.ensName, query);
  },
};

export default VotingHistory;
