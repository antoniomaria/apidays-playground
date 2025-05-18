# GraphQL Yoga Example

This project demonstrates a simple GraphQL server using [GraphQL Yoga](https://the-guild.dev/graphql/yoga). It includes a `countdown` subscription implemented over Server-Sent Events (SSE).

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- `npm` (comes with Node.js).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/graphql-yoga-see.git
   cd graphql-yoga-see
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Server
Start the server with the following command:
```bash
npm run start
```

The server will start and listen on [http://localhost:4000/graphql](http://localhost:4000/graphql).

---

## Using the Client

### Querying the Subscription with `curl`
You can test the `countdown` subscription using `curl`. The subscription streams countdown values from a specified number to `0`.

Run the following command:
```bash
curl -N -H "Content-Type: application/json" \
     -X POST \
     --data '{"query": "subscription { countdown(from: 5) }"}' \
     http://localhost:4000/graphql
```

### Expected Output
The server will stream the countdown values in real-time:
```json
data: {"data":{"countdown":5}}

data: {"data":{"countdown":4}}

data: {"data":{"countdown":3}}

data: {"data":{"countdown":2}}

data: {"data":{"countdown":1}}

data: {"data":{"countdown":0}}
```

---

## Project Structure
- `app.js`: The main server file containing the GraphQL schema and resolvers.
- `package.json`: Project dependencies and scripts.

---

## License
This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
```

### Changes Made:
1. Added a **title** and **description**.
2. Organized sections into **Getting Started**, **Using the Client**, and **Project Structure**.
3. Included **prerequisites** and **installation steps**.
4. Improved formatting for commands and outputs.
5. Added a **License** section for completeness. 

Feel free to adjust the repository URL or license details as needed!