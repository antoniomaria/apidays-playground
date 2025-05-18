import express from 'express';
import { createHandler } from 'graphql-sse/lib/use/express';
import path from 'path';
import { fileURLToPath } from 'url';

import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
 
/**
 * Construct a GraphQL schema and define the necessary resolvers.
 *
 * type Query {
 *   hello: String
 * }
 * type Subscription {
 *   greetings: String
 * }
 */
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => 'world',
      },
    },
  }),
  subscription: new GraphQLObjectType({
    name: 'Subscription',
    fields: {
      greetings: {
        type: GraphQLString,
        subscribe: async function* () {
          const greetings = ['Hi', 'Bonjour', 'Hola', 'Ciao', 'Zdravo'];
          let index = 0;
          while (true) {
            yield { greetings: greetings[index] };
            index = (index + 1) % greetings.length; // Cycle through greetings
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
          }
        },
      },
    },
  }),
});


// Create the GraphQL over SSE handler
const handler = createHandler({ schema });


const app = express();
const port = 3000;

// Resolve the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve all methods on `/graphql/stream`
app.use('/graphql/stream', handler);

// Serve the HTML file
app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});