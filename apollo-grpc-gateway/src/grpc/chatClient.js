// Seen https://github.com/loopbackio/loopback4-example-shopping/blob/af15cf5e6a5d309c61da2ee9e522533ee9def980/packages/recommender/src/recommendation-grpc.ts#L14
/*
import {    
  loadPackageDefinition,  
  ServerCredentials  
} from '@grpc/grpc-js';
*/

import * as grpc from '@grpc/grpc-js';


import { loadSync } from "@grpc/proto-loader";


import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = __dirname + '/../../proto/chat.proto';


const packageDefinition = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

class ChatClient {
  // Seen in https://grpc.io/docs/languages/node/basics/
  constructor(host = 'localhost:8980') {    
    
    this.client = new chatProto.ChatService(
      host,
      grpc.credentials.createInsecure()
    );
  }

  // Send a single message
  sendMessage(from, message) {
    return new Promise((resolve, reject) => {
      const call = this.client.join();

      call.on('data', (message) => {
        // We don't need to handle incoming messages here
        // as we'll use subscriptions for that
      });

      call.on('error', reject);
      call.on('end', resolve);

      call.write({ from, message });
    });
  }

  // Subscribe to messages
  subscribeToMessages(callback) {
    const call = this.client.join();

    call.on('data', (message) => {
      callback(null, message);
    });

    call.on('error', (err) => {
      callback(err);
    });

    return call;
  }
}

export default ChatClient;