import { createServer } from 'node:http'
import { createSchema, createYoga } from 'graphql-yoga'

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello: String
    }
    type Subscription {
      countdown(from: Int!): Int!
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world',
    },
    Subscription: {
      countdown: {
        // This will return the value on every 1 sec until it reaches 0
        subscribe: async function* (_, { from }) {
          for (let i = from; i >= 0; i--) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Corrected setTimeout usage
            yield { countdown: i };
          }
        },
      },
    },
  },
});

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ schema });

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  console.info('Server is running on http://localhost:4000/graphql');
});