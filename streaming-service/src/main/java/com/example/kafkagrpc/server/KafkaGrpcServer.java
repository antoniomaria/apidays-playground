package com.example.kafkagrpc.server;

import com.example.kafkagrpc.KafkaMessage;
import com.example.kafkagrpc.KafkaStreamServiceGrpc;
import com.example.kafkagrpc.StreamRequest;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.stub.ServerCallStreamObserver;
import io.grpc.stub.StreamObserver;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.io.IOException;
import java.time.Duration;
import java.util.Collections;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

public class KafkaGrpcServer {
    private final int port;
    private final Server server;
    private final String bootstrapServers;
    private final String groupId;

    public KafkaGrpcServer(int port, String bootstrapServers, String groupId) {
        this.port = port;
        this.bootstrapServers = bootstrapServers;
        this.groupId = groupId;
        this.server = ServerBuilder.forPort(port)
                .addService(new KafkaStreamServiceImpl())
                .build();
    }

    public void start() throws IOException {
        server.start();
        System.out.println("Server started, listening on " + port);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.err.println("*** shutting down gRPC server since JVM is shutting down");
            KafkaGrpcServer.this.stop();
            System.err.println("*** server shut down");
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

    private class KafkaStreamServiceImpl extends KafkaStreamServiceGrpc.KafkaStreamServiceImplBase {

        @Override
        public void streamMessages(StreamRequest request, StreamObserver<KafkaMessage> responseObserver) {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            AtomicBoolean isRunning = new AtomicBoolean(true);

            // Seen in: https://github.com/grpc/grpc-java/blob/3f5fdf12663dac0d221e6b9fb4b0dfed7486a6a9/examples/src/main/java/io/grpc/examples/manualflowcontrol/ManualFlowControlServer.java
            // Set up manual flow control for the request stream. It feels backwards to configure the request
            // stream's flow control using the response stream's observer, but this is the way it is.
            final ServerCallStreamObserver<KafkaMessage> serverCallStreamObserver =
                    (ServerCallStreamObserver<KafkaMessage>) responseObserver;

            executor.execute(() -> {
                Properties props = new Properties();
                props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
                props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId + "-" + request.getTopic());
                props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
                props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
                props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
                props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");

                try (Consumer<String, String> consumer = new KafkaConsumer<>(props)) {
                    consumer.subscribe(Collections.singletonList(request.getTopic()));

                    while (isRunning.get()) {
                        ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));

                        records.forEach(record -> {
                            KafkaMessage message = KafkaMessage.newBuilder()
                                    .setKey(record.key() != null ? record.key() : "")
                                    .setValue(record.value())
                                    .setTimestamp(record.timestamp())
                                    .setPartition(record.partition())
                                    .setOffset(record.offset())
                                    .build();

                            responseObserver.onNext(message);
                        });
                    }
                } catch (Exception e) {
                    if (isRunning.get()) {
                        responseObserver.onError(e);
                    }
                } finally {
                    if (isRunning.getAndSet(false)) {
                        responseObserver.onCompleted();
                    }
                    executor.shutdown();
                }
            });

            // TODO Handle client disconnection
            serverCallStreamObserver.setOnCancelHandler(() -> {
                isRunning.set(false);
                executor.shutdownNow();
            });
        }
    }

    public static void main(String[] args) throws IOException, InterruptedException {
        int port = 50051;
        String bootstrapServers = "localhost:9092"; // Where kafka is listening. Remember run docker-compose up
        String groupId = "grpc-server-group";

        final KafkaGrpcServer server = new KafkaGrpcServer(port, bootstrapServers, groupId);
        server.start();
        server.blockUntilShutdown();
    }
}