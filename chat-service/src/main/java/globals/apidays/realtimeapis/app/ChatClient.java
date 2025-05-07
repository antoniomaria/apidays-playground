package globals.apidays.realtimeapis.app;

import com.example.chat.ChatMessage;
import com.example.chat.ChatServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.stub.StreamObserver;

import java.util.Scanner;
import java.util.concurrent.TimeUnit;

public class ChatClient {
    private final ManagedChannel channel;
    private final ChatServiceGrpc.ChatServiceStub asyncStub;
    private String userName;

    public ChatClient(String host, int port, String userName) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext()
                .build();
        this.asyncStub = ChatServiceGrpc.newStub(channel);
        this.userName = userName;
    }

    public void start() {
        StreamObserver<ChatMessage> requestObserver = asyncStub.join(new StreamObserver<ChatMessage>() {
            @Override
            public void onNext(ChatMessage message) {
                if (!message.getFrom().equals(userName)) {
                    System.out.println(message.getFrom() + ": " + message.getMessage());
                }
            }

            @Override
            public void onError(Throwable t) {
                System.err.println("Error in chat: " + t.getMessage());
            }

            @Override
            public void onCompleted() {
                System.out.println("Chat ended");
            }
        });

        // Send initial message to register user
        requestObserver.onNext(ChatMessage.newBuilder()
                .setFrom(userName)
                .setMessage("has joined")
                .build());

        Scanner scanner = new Scanner(System.in);
        while (true) {
            String line = scanner.nextLine();
            if (line.equalsIgnoreCase("exit")) {
                requestObserver.onCompleted();
                break;
            }
            requestObserver.onNext(ChatMessage.newBuilder()
                    .setFrom(userName)
                    .setMessage(line)
                    .build());
        }

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
        if (args.length < 1) {
            System.err.println("Usage: ChatClient <username> [host] [port]");
            return;
        }

        String userName = args[0];
        String host = args.length > 1 ? args[1] : "localhost";
        int port = args.length > 2 ? Integer.parseInt(args[2]) : 8980;

        ChatClient client = new ChatClient(host, port, userName);
        client.start();
    }
}