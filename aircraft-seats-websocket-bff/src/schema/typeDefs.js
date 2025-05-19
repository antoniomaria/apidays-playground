const typeDefs = `#graphql
  type Message {
    from: String!
    message: String!
  }

  type Query {
    # Placeholder for any queries you might need
    ping: String
  }

  type Mutation {
    sendMessage(from: String!, message: String!): Boolean
  }

  type Subscription {
    messageReceived: Message
  }
`;

export default typeDefs;
