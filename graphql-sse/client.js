import { createClient } from 'graphql-sse';

const client = createClient({
  url: 'http://localhost:3000/graphql/stream',
});

// Query example
async function executeQuery() {
  const query = client.iterate({
    query: '{ hello }',
  });

  for await (const result of query) {
    console.log('Query result:', result);
    break; // Exit after the first result
  }
}

// Subscription example
async function executeSubscription() {
  const subscription = client.iterate({
    query: 'subscription { greetings }',
  });

  for await (const event of subscription) {
    console.log('Subscription event:', event);

    // Exit the subscription loop after receiving the first event
    //break;
  }
}

// Execute the functions
executeQuery();
executeSubscription();