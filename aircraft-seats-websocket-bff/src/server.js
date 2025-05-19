import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';

// Seen in https://the-guild.dev/graphql/ws/get-started
import { useServer } from 'graphql-ws/use/ws';
import { PubSub } from 'graphql-subscriptions';
import bodyParser from 'body-parser';
import cors from 'cors';

import typeDefs from './schema/typeDefs.js';
import resolvers from './resolvers/index.js';
import AircraftSeatsClient from "./grpc/aircraftSeatsClient.js";

const PORT = 4000;

// Create schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app and HTTP server; we will attach the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = createServer(app);

// Set up WebSocket server.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// seen in https://github.com/apollographql/docs-examples/blob/main/apollo-server/v4/subscriptions-graphql-ws/src/index.ts
const pubsub = new PubSub();

const grpcClient = new AircraftSeatsClient();

const serverCleanup = useServer({
  schema,
  context: async (context, msg, args) => {
    console.log("Creating a ws-socket context")
    // Returning an object will add that information to
    // contextValue, which all of our resolvers have access to.

    // pass context to Apollo/GraphQL Subscription subscribe handler (with remote redis)
    return {
      pubsub,
      grpcClient
    };
  },
  onDisconnect(context, code, reason) {
    console.log('Disconnected! ');
  },
}, wsServer);

// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});


await server.start();

app.use('/graphql', cors(), bodyParser.json(),
  expressMiddleware(server, {
    context: ({ req, res }) => (
      {
        grpcClient
      }
    ),
  }),
);

// Now that our HTTP server is fully set up, actually listen.
httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
  console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`);
});
