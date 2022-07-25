function inStatement(array) {
  return `["${array.join('","')}"]`;
}

export const history = {
  offChain: {
    votes: (address = "", daoNames = []) => `
      query Votes {
        votes(
          first: 20,
          where: {
            space_in: ${inStatement(daoNames)}, 
            voter: "${address}" 
          }
        ) {
          choice
          voter
          proposal {
            id
            choices
            state
          }
        }
      }
    `,
    proposals: (daoNames = []) => `
      query Proposals {
        proposals(
          skip: 0
          where: { space_in: ${inStatement(daoNames)}, state: "closed" }
          orderBy: "created"
          orderDirection: desc
        ) {
          id
          title
          end
        }
      }
    `,
  },
  onChain: {
    votes: (address = "", daoNames = []) => `
    query Votes {
      votes(
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
    proposals: (daoNames = [], skipIds = []) => `
      query Proposals {
        proposals(
          where: { organization_in: ${inStatement(
            daoNames
          )}, id_not_in: ${inStatement(skipIds)} }
          orderBy: "timestamp"
          orderDirection: desc
        ) {
          id
          description
          timestamp
        }
    }`,
  },
};
