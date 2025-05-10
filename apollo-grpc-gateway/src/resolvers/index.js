// Seen in https://stackoverflow.com/questions/76191154/the-requested-module-does-not-provide-an-export-named-default
// const ChatClient = require('../grpc/chatClient');
import ChatClient from "../grpc/chatClient.js";
import { PubSub } from 'graphql-subscriptions';

// seen in https://github.com/apollographql/docs-examples/blob/main/apollo-server/v4/subscriptions-graphql-ws/src/index.ts
const pubsub = new PubSub();

const chatClient = new ChatClient();

const resolvers = {
  Query: {
    ping:  (parent, args, context) => {
      console.log("my winner context is " , context )      
      return 'pong';}
  },
  Mutation: {
    sendMessage: async (_, { from, message }) => {
      try {
        console.log("Message received: ", message)
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
      
      subscribe: (parent, args, context) => {        
        console.log("my winner context is " , context )                
        
        // Setup gRPC subscription
        const grpcCall = chatClient.subscribeToMessages((err, message) => {
          if (err) {
            console.error('gRPC subscription error:', err);
          } else {
            pubsub.publish('MESSAGE_RECEIVED', { messageReceived: message });
          }
        });

        // Return async iterator
        const asyncIterator = pubsub.asyncIterableIterator(['MESSAGE_RECEIVED']);

        return asyncIterator
        // Cleanup when client unsubscribes
        /*
        return {
          ...asyncIterator,
          return: () => {
            grpcCall.cancel();
            return asyncIterator.return();
          },
        }; */
      },
    },
  },
};

export default resolvers;