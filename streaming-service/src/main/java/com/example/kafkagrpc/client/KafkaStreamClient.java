

package com.example.kafkagrpc.client;

import com.example.kafkagrpc.KafkaMessage;
import com.example.kafkagrpc.KafkaStreamServiceGrpc;
import com.example.kafkagrpc.StreamRequest;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

public class KafkaStreamClient {
    public static void main(String[] args) {
        String target = "localhost:50051"; // where the grpc server is running
        String topic = "test-topic"; // The topic will be subscribing via grpc streaming

        ManagedChannel channel = ManagedChannelBuilder.forTarget(target)
                .usePlaintext()
                .build();

        try {
            KafkaStreamServiceGrpc.KafkaStreamServiceBlockingStub stub =
                    KafkaStreamServiceGrpc.newBlockingStub(channel);

            StreamRequest request = StreamRequest.newBuilder()
                    .setTopic(topic)
                    .build();

            stub.streamMessages(request).forEachRemaining(message -> {
                System.out.printf("Received message - Key: %s, Value: %s, Partition: %d, Offset: %d%n",
                        message.getKey(), message.getValue(), message.getPartition(), message.getOffset());
            });
        } finally {
            channel.shutdown();
        }
    }
}