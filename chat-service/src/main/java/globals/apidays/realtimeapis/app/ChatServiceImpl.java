package globals.apidays.realtimeapis.app;


import com.example.chat.*;
import com.google.common.util.concurrent.MoreExecutors;
import io.grpc.Context;
import io.grpc.stub.StreamObserver;

import java.util.concurrent.ConcurrentHashMap;


public class ChatServiceImpl extends ChatServiceGrpc.ChatServiceImplBase {

    private final ConcurrentHashMap<String, StreamObserver<ChatMessage>> clients = new ConcurrentHashMap<>();

    @Override
    public void joinChat(Connect request, StreamObserver<ChatMessage> responseObserver) {
        String user = request.getUser();

        if (clients.get(user) == null) {
            // First message is treated as login
            clients.put(user, responseObserver);
            System.out.println(user + " joined the chat");
        }

        Context.CancellationListener listener = (Context context) -> {
            System.out.println(user + " left the chat");
            clients.remove(user);
            responseObserver.onCompleted();
        };
        Context.current().addListener(listener, MoreExecutors.directExecutor());

    }

    @Override
    public void broadcastMessage(ChatMessage message, StreamObserver<Close> responseObserver) {
        // Broadcast message to all clients
        System.out.println("Broadcasting: " + message.getMessage() + " to "+ clients.size() + "users");
        clients.values().forEach(client -> {
            try {
                client.onNext(message);
            } catch (Exception e) {
                System.err.println("Error sending message to client: " + e.getMessage());
            }
        });

        responseObserver.onNext(Close.newBuilder().build());
        responseObserver.onCompleted();
    }

    @Override
    public StreamObserver<ChatMessage> join(StreamObserver<ChatMessage> responseObserver) {
        return new StreamObserver<ChatMessage>() {
            private String userName;

            @Override
            public void onNext(ChatMessage message) {
                if (userName == null) {
                    // First message is treated as login
                    userName = message.getFrom();
                    clients.put(userName, responseObserver);
                    System.out.println(userName + " joined the chat");
                } else {
                    // Broadcast message to all clients
                    System.out.println("Broadcasting: " + message.getMessage());
                    clients.values().forEach(client -> {
                        try {
                            client.onNext(message);
                        } catch (Exception e) {
                            System.err.println("Error sending message to client: " + e.getMessage());
                        }
                    });
                }
            }

            @Override
            public void onError(Throwable t) {
                if (userName != null) {
                    System.out.println(userName + " disconnected with error: " + t.getMessage());
                    clients.remove(userName);
                }
            }

            @Override
            public void onCompleted() {
                if (userName != null) {
                    System.out.println(userName + " left the chat");
                    clients.remove(userName);
                }
                responseObserver.onCompleted();
            }
        };
    }
}