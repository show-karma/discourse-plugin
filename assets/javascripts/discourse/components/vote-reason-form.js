import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import { inject as service } from "@ember/service";
import { action, computed, set } from "@ember/object";
import { fetchActiveOnChainProposals } from "../../lib/voting-history/gql/on-chain-fetcher";
import { fetchActiveOffChainProposals } from "../../lib/voting-history/gql/off-chain-fetcher";

export default Component.extend({
  router: service(),

  form: { reason: "", user: "" },
});
