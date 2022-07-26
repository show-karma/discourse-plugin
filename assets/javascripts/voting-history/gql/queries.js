function inStatement(array) {
  return `["${array.join('","')}"]`;
}

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
