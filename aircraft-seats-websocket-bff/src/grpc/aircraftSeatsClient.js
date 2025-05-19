import * as grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = __dirname + '/../../proto/aircraft_seats_service.proto';

const packageDefinition = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const aircraftSeatsProto = grpc.loadPackageDefinition(packageDefinition).aircraft;

class AircraftSeatsClient {
  constructor(host = 'localhost:8980') {
    this.client = new aircraftSeatsProto.AircraftSeatsService(
      host,
      grpc.credentials.createInsecure()
    );
  }

  // Fetch the status of a specific seat
  getSeatStatus(rowNumber, seatLetter) {
    return new Promise((resolve, reject) => {
      const request = { rowNumber, seatLetter };
      this.client.GetSeatStatus(request, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
  }

  // Update the status of a specific seat
  updateSeatStatus(rowNumber, seatLetter, occupied) {
    return new Promise((resolve, reject) => {
      const request = { rowNumber, seatLetter, occupied };
      this.client.UpdateSeatStatus(request, (err, response) => {
        if (err) return reject(err);
        resolve(response.success);
      });
    });
  }

  // Subscribe to real-time seat status updates
  subscribeToSeatStatusUpdates(callback) {
    const request = {};
    const call = this.client.SubscribeToSeatStatusUpdates(request);

    call.on('data', (seatStatus) => {
      callback(null, seatStatus);
    });

    call.on('error', (err) => {
      callback(err);
    });

    return call;
  }
}

export default AircraftSeatsClient;