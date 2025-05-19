const resolvers = {
  Query: {
    ping:  (parent, args, contextValue) => {
      console.log("Query ping  context is: " , contextValue )      
      return 'pong';}
  },
  Mutation: {
    sendMessage: async (_, { from, message }, contextValue) => {
      try {
        console.log("Message received: ", message)        
        await contextValue.grpcClient.sendMessage(from, message);
        return true;
      } catch (err) {
        console.error('Error sending message:', err);
        return false;
      }
    },
  },
  Subscription: {
    messageReceived: {
      unsubscribe: () => {
        console.log("bye bye")
      },
      
      subscribe: (parent, args, contextValue) => {    
        console.log("Subscription messageReceived called ", )                
        const { grpcClient, pubsub } = contextValue;        
        
        // Setup gRPC subscription
        const grpcCall = grpcClient.subscribeToMessages((err, message) => {
          if (err) {
            console.error('gRPC subscription error:', err);
          } else {
            pubsub.publish('MESSAGE_RECEIVED', { messageReceived: message });
          }
        });
        
        // Return async iterator
        const asyncIterator = pubsub.asyncIterableIterator(['MESSAGE_RECEIVED']);
        // TODO Somehow close the grcp connection when client unsubscribes
        // grpcCall.cancel();

        return asyncIterator                
      },
    },
  },
};

export default resolvers;