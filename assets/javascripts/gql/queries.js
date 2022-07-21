import { gql } from "@apollo/client";

export const history = {
  onChain: {
    votes: gql`
      query Votes($address: String!, $daoname: [String]!) {
        votes(first: 20, where: { space_in: $daoname, voter: $address }) {
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
    proposals: gql`
      query Proposals($daoname: [String]!) {
        proposals(
          skip: 0
          where: { space_in: $daoname, state: "closed" }
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
