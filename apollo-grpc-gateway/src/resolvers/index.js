// Seen in https://stackoverflow.com/questions/76191154/the-requested-module-does-not-provide-an-export-named-default
// const ChatClient = require('../grpc/chatClient');
import ChatClient from "../grpc/chatClient.js";

const chatClient = new ChatClient();

const resolvers = {
  Query: {
    ping: () => 'pong',
  },
  Mutation: {
    sendMessage: async (_, { from, message }) => {
      try {
        await chatClient.sendMessage(from, message);
        return true;
      } catch (err) {
        console.error('Error sending message:', err);
        return false;
      }
    },
  },
  Subscription: {
    messageReceived: {
      subscribe: (_, __, { pubsub }) => {
        // Setup gRPC subscription
        const grpcCall = chatClient.subscribeToMessages((err, message) => {
          if (err) {
            console.error('gRPC subscription error:', err);
          } else {
            pubsub.publish('MESSAGE_RECEIVED', { messageReceived: message });
          }
        });

        // Return async iterator
        const asyncIterator = pubsub.asyncIterator(['MESSAGE_RECEIVED']);

        // Cleanup when client unsubscribes
        return {
          ...asyncIterator,
          return: () => {
            grpcCall.cancel();
            return asyncIterator.return();
          },
        };
      },
    },
  },
};

// module.exports = { resolvers };
export default resolvers;