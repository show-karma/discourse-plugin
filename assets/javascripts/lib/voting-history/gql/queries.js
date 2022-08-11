function inStatement(array) {
  return `["${array.join('","')}"]`;
}
function yesterdayUTC() {
  return (
    Math.floor(new Date().setUTCHours(0, 0, 0, 0) / 1000)
  );
}

export const proposal = {
  onChain: {
    proposal: (daoNames = [], amount = 100) => `query Proposals {
      proposals(
        first: ${amount},
        where: { organization_in: ${inStatement(
          daoNames
        )}, timestamp_gt: ${yesterdayUTC()} }
      ) {
        id
        title: description
        endsAt: timestamp
        votes {user {id}}
      }
    }`,
  },
  offChain: {
    proposal: (daoNames = [], amount = 100) => `query Proposals {
      proposals(
        first: ${amount},
        where: { space_in: ${inStatement(
          daoNames
        )}, end_gt: ${yesterdayUTC()} }) {
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
