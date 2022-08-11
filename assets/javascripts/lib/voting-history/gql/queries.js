function inStatement(array) {
  return `["${array.join('","')}"]`;
}
function yesterdayUTC(daysAgo = 1) {
  return moment
    .unix(Math.floor(new Date().setUTCHours(0, 0, 0, 0) / 1000))
    .subtract(daysAgo > 1 ? daysAgo - 1 : 0, "days")
    .unix();
}

export const proposal = {
  onChain: {
    proposal: (daoNames = [], amount = 100, daysAgo = 1) => `query Proposals {
      proposals(
        first: ${amount},
        where: { organization_in: ${inStatement(
          daoNames
        )}, timestamp_gt: ${yesterdayUTC(daysAgo)} }
      ) {
        id
        title: description
        endsAt: timestamp
        votes {user {id}}
      }
    }`,
  },
  offChain: {
    proposal: (daoNames = [], amount = 100, daysAgo) => `query Proposals {
      proposals(
        first: ${amount},
        where: { space_in: ${inStatement(daoNames)}, end_gt: ${yesterdayUTC(
      daysAgo
    )} }) {
        id
        title
        endsAt: end
        votes
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
    votes: (address = "", daoNames = [], amount = 3) => `query Votes {
      votes(
        first: ${amount}
				orderBy: timestamp
				orderDirection: desc
				where: { user: "${address}", organization_in: ${inStatement(daoNames)} }
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
