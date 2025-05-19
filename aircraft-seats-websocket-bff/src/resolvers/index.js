const resolvers = {
  Query: {
    ping: (parent, args, contextValue) => {
      console.log("Query ping context is: ", contextValue);
      return 'pong';
    },
    seatStatus: async (parent, { rowNumber, seatLetter }, contextValue) => {
      try {
        console.log(`Fetching seat status for row ${rowNumber}, seat ${seatLetter}`);
        const seatStatus = await contextValue.grpcClient.getSeatStatus(rowNumber, seatLetter);
        return seatStatus;
      } catch (err) {
        console.error('Error fetching seat status:', err);
        throw new Error('Failed to fetch seat status');
      }
    },
  },
  Mutation: {
    updateSeatStatus: async (parent, { rowNumber, seatLetter, occupied }, contextValue) => {
      try {
        console.log(`Updating seat status for row ${rowNumber}, seat ${seatLetter} to occupied: ${occupied}`);
        await contextValue.grpcClient.updateSeatStatus(rowNumber, seatLetter, occupied);
        return true;
      } catch (err) {
        console.error('Error updating seat status:', err);
        return false;
      }
    },
  },
  Subscription: {
    seatStatusUpdated: {
      subscribe: (parent, args, contextValue) => {
        console.log("Subscription seatStatusUpdated called");
        const { grpcClient, pubsub } = contextValue;

        // Setup gRPC subscription
        grpcClient.subscribeToSeatStatusUpdates((err, seatStatus) => {
          if (err) {
            console.error('gRPC subscription error:', err);
          } else {
            pubsub.publish('SEAT_STATUS_UPDATED', { seatStatusUpdated: seatStatus });
          }
        });
        
        // Return async iterator
        const asyncIterator = pubsub.asyncIterableIterator(['SEAT_STATUS_UPDATED']);
        // TODO Somehow close the grcp connection when client unsubscribes
        // grpcCall.cancel();

        return asyncIterator;

      },
    },
  },
};

export default resolvers;