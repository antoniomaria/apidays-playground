# Apollo gRPC Gateway

This project is a gateway that bridges GraphQL (Apollo Server) and gRPC. It exposes a GraphQL API (including subscriptions) that internally communicates with a gRPC chat service. Clients can send and receive chat messages using GraphQL queries, mutations, and subscriptions, while the backend uses gRPC for message transport.

## Tech Stack

- **Node.js** (ES Modules)
- **Apollo Server** (GraphQL API & Subscriptions)
- **Express** (HTTP server)
- **gRPC** (`@grpc/grpc-js`, `@grpc/proto-loader`)
- **graphql-ws** (WebSocket subscriptions)
- **graphql-subscriptions** (PubSub for subscriptions)
- **WS** (WebSocket server)
- **GraphQL Tools** (schema building)

## Installation

1. **Clone the repository:**
   ```sh
   git clone git@github.com:antoniomaria/apidays-playground.git
   cd apollo-grpc-gateway
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

## Running Locally

1. **Start the gRPC chat backend** (make sure you have a compatible gRPC chat server running on `localhost:8980`).

2. **Start the gateway server:**
   ```sh
   npm start
   ```

3. **Access the GraphQL endpoint:**
   - Query endpoint: [http://localhost:4000/graphql](http://localhost:4000/graphql)
   - Subscription endpoint: `ws://localhost:4000/graphql`

## Project Structure

- `src/server.js` – Main server entry point
- `src/grpc/chatClient.js` – gRPC client for chat service
- `src/resolvers/` – GraphQL resolvers
- `src/schema/typeDefs.js` – GraphQL schema definitions
- `proto/chat.proto` – gRPC service definition

## Inspired by

- [subscriptions-graphql-ws] - Apollo 4 subscription graphql-ws example
- [ws-get-started] - ws-get-started
- [grpc-node-basics] - A basic tutorial introduction to gRPC in Node.

[subscriptions-graphql-ws]: <https://github.com/apollographql/docs-examples/tree/main/apollo-server/v4/subscriptions-graphql-ws>
[ws-get-started]: <https://the-guild.dev/graphql/ws/get-started>
[grpc-node-basics]: <https://grpc.io/docs/languages/node/basics>
