package globals.apidays.realtimeapis.app;


import io.grpc.Server;
import io.grpc.ServerBuilder;

import java.io.IOException;

public class AircraftSeatServer {
    private final int port;
    private final Server server;

    public AircraftSeatServer(int port) {
        this.port = port;
        this.server = ServerBuilder.forPort(port)
                .addService(new AircraftSeatsServiceImpl())
                .build();
    }

    public void start() throws IOException {
        server.start();
        System.out.println("Server started, listening on " + port);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.err.println("Shutting down gRPC server");
            AircraftSeatServer.this.stop();
            System.err.println("Server shut down");
        }));
    }

    public void stop() {
        if (server != null) {
            server.shutdown();
        }
    }

    private void blockUntilShutdown() throws InterruptedException {
        if (server != null) {
            server.awaitTermination();
        }
    }

    public static void main(String[] args) throws IOException, InterruptedException {
        AircraftSeatServer server = new AircraftSeatServer(8980);
        server.start();
        server.blockUntilShutdown();
    }
}