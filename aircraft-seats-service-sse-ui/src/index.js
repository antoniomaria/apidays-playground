import React from 'react';
import ReactDOM from 'react-dom/client';
//import './index.css';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';

import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';

import {
  ApolloLink,  
  Observable,
} from '@apollo/client/core';
import { print } from 'graphql';
import { createClient, ClientOptions, Client } from 'graphql-sse';


const httpLink = new HttpLink({
  uri: 'https://graphql-gateway.app.lan:4444/graphql', // our go graphql appliation
});


class SSELink extends ApolloLink {
  constructor(options) {
    super();
    this.client = createClient(options);
  }

  request(operation) {
    return new Observable((sink) => {
      return this.client.subscribe(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: sink.error.bind(sink),
        },
      );
    });
  }
}
 
export const sseLink = new SSELink({
  url: 'https://graphql-gateway.app.lan:4444/graphql',
  headers: () => {
    const session = "1234"; // Replace with your session management logic
    if (!session) return {};
    return {
      Authorization: `Bearer ${session.token}`,
    };
  },
});



// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  sseLink, // Use SSE link for subscriptions
  httpLink,
);


const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()

});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);
