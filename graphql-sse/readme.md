# GraphQL SSE Example

This project demonstrates how to use GraphQL over Server-Sent Events (SSE) with a simple query and subscription. It uses **Express** as the server framework.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd graphql-sse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server

Start the server:
```bash
npm start
```

The server (built with **Express**) will be running at `http://localhost:3000`.

## Querying the Subscription Endpoint

### Using `curl`

You can use `curl` to interact with the subscription endpoint.

#### Query Example
Send a query to fetch the `hello` field:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "{ hello }"}' \
  http://localhost:3000/graphql/stream
```

#### Subscription Example
Subscribe to the `greetings` field:
```bash
curl -N -H "Accept: text/event-stream" \
  -H "Content-Type: application/json" \
  -d '{"query": "subscription { greetings }"}' \
  http://localhost:3000/graphql/stream
```

This will stream greetings (e.g., "Hi", "Bonjour", "Hola") to your terminal, one every second.

## Accessing the Client

You can also access the client HTML page by navigating to:
```
http://localhost:3000/client
```

This page demonstrates how to query and subscribe to the GraphQL server using the `graphql-sse` client.