How to Test It

1. Compile the project with Maven (mvn clean install)

2. Start the server
   
   java -cp target/grpc-chat-1.0-SNAPSHOT.jar globals.apidays.realtimeapis.app.AircraftSeatServer

3. start multiple clients in different terminals:
   java -cp target/grpc-chat-1.0-SNAPSHOT.jar globals.apidays.realtimeapis.app.ChatClient Alice
   java -cp target/grpc-chat-1.0-SNAPSHOT.jar globals.apidays.realtimeapis.app.ChatClient Bob