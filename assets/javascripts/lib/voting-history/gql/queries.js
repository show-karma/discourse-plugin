function inStatement(array) {
  return `["${array.join('","')}"]`;
}
function yesterdayUTC(daysAgo = 0) {
  return daysAgo === 0
    ? moment().unix()
    : moment
      .unix(Math.floor(new Date().setUTCHours(0, 0, 0, 0) / 1000))
      .subtract(daysAgo >= 0 ? daysAgo : 0, "days")
      .unix();
}

export const proposal = {
  /* where: { organization_in: ${inStatement(daoNames)}, status: "Active" } }*/
  onChain: {
    proposal: (daoNames = [], amount = 100, daysAgo = 0, voteAmount = 1000) => `query Proposals {
      proposals(
        first: ${amount},
        where: {
          and: [
            {
              or: [
                {timestamp_gt: ${yesterdayUTC(daysAgo)}},
                {status: "Active", endDate: null}
              ]
            },
            {id_not_in: ["ens.eth-0x3d92e95f813c9e79938934d81310dd40f0f444356b21c1bb23f26394236c36c7"]},
            {organization_in: ${inStatement(daoNames)}}
          ]
        }

      ) {
        id
        status
        title: description
        endsAt: endDate
        votes(
          first:${voteAmount},
          orderBy:timestamp,
          orderDirection:desc
        ) {
          choice: support,
          weight,
          timestamp
        }
        organization {id}
      }
    }`,
  },
  offChain: {
    proposal: (daoNames = [], amount = 100, daysAgo = 0) => `query Proposals {
      proposals(
        first: ${amount},
        where: { space_in: ${inStatement(daoNames)}, end_gt: ${yesterdayUTC(
      daysAgo
    )} }) {        id
        title
        state
        endsAt: end
        votes
        space {id}
        choices
        network
        start
        snapshot
        type
        strategies {
          name
          network
          params
        }
      }
    }`,
    votes: (proposalIds = [], page = 0) => `query Votes {
      votes(first:1000, skip:${page * 1000} ,where: {proposal_in: ${inStatement(
      proposalIds
    )}}){
        choice
        vp
        vp_by_strategy
        vp_state
        proposal {id}
        voter
      }
    }`,
    strategies: (daoNames = []) => `query Strategies {
      spaces (where: {
        id_in: ${inStatement(daoNames)}
      }) {
        id
        strategies {
          name
          network
          params
        }
      }
    }`,
  },
};

export const history = {
  offChain: {
    votes: (address = "", daoNames = [], amount = 3) => `query Votes {
        votes(
          first: ${amount},
          where: {
            space_in: ${inStatement(daoNames)},
            voter: "${address}"
          }
        ) {
          choice
          voter
          proposal {
            id
            title
            choices
            state
            end
          }
        }
      }
    `,
  },
  onChain: {
    proposalVotes: (proposalId, amount = 3, timestampLt = (Date.now() / 1000).toFixed(0)) => `query ProposalVotes {
      votes(
        first: ${amount}
				orderBy: timestamp
				orderDirection: desc
				where: {proposal: "${proposalId}", timestamp_lt: ${timestampLt} }
			) {
				id
				solution
				timestamp
				support
			}
    }`,
    votes: (address = "", daoNames = [], amount = 3, timestampLt = (Date.now() / 1000).toFixed(0)) => `query Votes {
      votes(
        first: ${amount}
				orderBy: timestamp
				orderDirection: desc
				where: { user: "${address}", organization_in: ${inStatement(daoNames)}, timestamp_lt: ${timestampLt} }
			) {
				id
				proposal {
					id
					description
					timestamp
				}
				organization {
					id
				}
				solution
				timestamp
				support
			}
    }`,
  },
};
