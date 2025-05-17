package globals.apidays.realtimeapis.app;

import com.example.chat.ChatMessage;
import com.example.chat.ChatServiceGrpc;
import com.example.chat.Close;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.stub.StreamObserver;

import java.util.Scanner;
import java.util.concurrent.TimeUnit;

public class SimpleChatClient {
    private final ManagedChannel channel;
    private final ChatServiceGrpc.ChatServiceStub asyncStub;
    private String userName;

    public SimpleChatClient(String host, int port, String userName) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext()
                .build();
        this.asyncStub = ChatServiceGrpc.newStub(channel);
        this.userName = userName;
    }

    public void start() {
        ChatMessage message = ChatMessage.newBuilder().setFrom(userName).setMessage("hoxxxla hola").build();


        asyncStub.broadcastMessage(message, new StreamObserver<Close>() {
            @Override
            public void onNext(Close close) {

            }

            @Override
            public void onError(Throwable throwable) {

            }

            @Override
            public void onCompleted() {
                System.out.println("message sent");
            }
        });


        shutdown();
    }

    public void shutdown() {
        try {
            channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            System.err.println("Error while shutting down: " + e.getMessage());
        }
    }

    public static void main(String[] args) {


        String userName = "antonio";
        String host = "localhost";
        int port = 8980;

        SimpleChatClient client = new SimpleChatClient(host, port, userName);
        client.start();
    }
}