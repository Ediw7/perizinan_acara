import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { createApolloProvider } from '@vue/apollo-option';

const cache = new InMemoryCache();

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache,
  headers: {
    authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const apolloProvider = createApolloProvider({
  defaultClient: client,
});

export default apolloProvider;



