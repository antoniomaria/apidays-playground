const typeDefs = `#graphql
  type SeatStatus {
    rowNumber: Int!
    seatLetter: String!
    occupied: Boolean!
  }

  type Query {
    # Placeholder for any queries you might need
    ping: String
    seatStatus(rowNumber: Int!, seatLetter: String!): SeatStatus
  }

  type Mutation {
    updateSeatStatus(rowNumber: Int!, seatLetter: String, occupied: Boolean!): Boolean
  }

  type Subscription {
    seatStatusUpdated: SeatStatus
  }
`;

export default typeDefs;
