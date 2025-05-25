# Aircraft Seats Map

A React application for visualizing and interacting with aircraft seat layouts in real time.  
This project uses **React**, **GraphQL**, and **Apollo Client** with subscriptions over **WebSocket** for live seat status updates.

## Features

- Real-time seat status updates using GraphQL subscriptions (WebSocket)
- Interactive seat selection and status display
- Modular React components

## Tech Stack

- [React](https://react.dev/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [GraphQL](https://graphql.org/)
- [graphql-ws](https://github.com/enisdenjo/graphql-ws) for WebSocket subscriptions

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone git@github.com:antoniomaria/apidays-playground.git
   cd aircraft-seats-websocket-ui
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```   

### Running the Application

1. **Start the development server:**
   ```sh
   npm start
   ```
   or
   ```sh
   yarn start
   ```

2. Open your browser and go to [http://localhost:3000](http://localhost:3000).

**Note:**  
This UI expects a GraphQL backend running at `http://localhost:4000/graphql` with WebSocket support at `ws://localhost:4000/graphql`. See from the same repository the project: aircraft-seats-websocket-bff

## Project Structure

- `src/components/` – React components for seats, rows, and wings
- `src/index.js` – Apollo Client setup with HTTP and WebSocket links
