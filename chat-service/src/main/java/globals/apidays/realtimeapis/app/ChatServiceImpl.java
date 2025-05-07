package globals.apidays.realtimeapis.app;


import com.example.chat.ChatProto;
import com.example.chat.ChatMessage;
import com.example.chat.ChatServiceGrpc;
import io.grpc.stub.StreamObserver;

import java.util.concurrent.ConcurrentHashMap;


public class ChatServiceImpl extends ChatServiceGrpc.ChatServiceImplBase {

    private final ConcurrentHashMap<String, StreamObserver<ChatMessage>> clients = new ConcurrentHashMap<>();

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