export const history = {
  onChain: {
    votes: (address, daoNames) => `
      query Votes {
        votes(
          first: 20,
          where: {
            space_in: ["${daoNames.join('","')}"], 
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
    proposals: (daoNames) => `
      query Proposals {
        proposals(
          skip: 0
          where: { space_in: ["${daoNames.join('","')}"], state: "closed" }
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
};
