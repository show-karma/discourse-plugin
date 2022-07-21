import { ApolloClient, InMemoryCache } from "@apollo/client";

/**
 * Client for on chain votes at subgraph
 */
export const subgraphCli = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/show-karma/dao-on-chain-voting",
  cache: new InMemoryCache(),
});

/**
 * Client for off chain votes at Snapshot.org
 */
export const snapshotCli = new ApolloClient({
  uri: "https://hub.snapshot.org/graphql",
  cache: new InMemoryCache(),
});
