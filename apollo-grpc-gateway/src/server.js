import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { PubSub } from 'graphql-subscriptions';

/*
const { PubSub } = require('graphql-subscriptions');

const typeDefs = require('./schema/typeDefs');
const resolvers = require('./resolvers');

*/

import typeDefs from './schema/typeDefs.js';
import resolvers from './resolvers/index.js';


const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({ pubsub }),
  subscriptions: {
    path: '/subscriptions',
    onConnect: () => {
      console.log('Client connected for subscriptions');
    },
    onDisconnect: () => {
      console.log('Client disconnected from subscriptions');
    },
  },
});

/*
server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});*/

// Passing an ApolloServer instance to the `startStandaloneServer` function:

//  1. creates an Express app

//  2. installs your ApolloServer instance as middleware

//  3. prepares your app to handle incoming requests

const { url } = await startStandaloneServer(server, {

  listen: { port: 4000 },

});


console.log(`🚀  Server ready at: ${url}`);