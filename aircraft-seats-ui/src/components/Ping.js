import React from 'react';
import { gql, useQuery } from '@apollo/client';

const PING_QUERY = gql`
  query Query {
    ping
  }
`;

function Ping() {
  const { loading, error, data } = useQuery(PING_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <div>Server response: {data.ping}</div>;
}

export default Ping;