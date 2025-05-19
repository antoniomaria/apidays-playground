package globals.apidays.realtimeapis.app;

import com.example.aircraft.*;
import com.google.common.util.concurrent.MoreExecutors;

import io.grpc.stub.StreamObserver;
import io.grpc.Context;
import java.util.concurrent.ConcurrentHashMap;

public class AircraftSeatsServiceImpl extends AircraftSeatsServiceGrpc.AircraftSeatsServiceImplBase {

    private final ConcurrentHashMap<String, SeatStatus> seatStatuses = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, StreamObserver<SeatStatus>> activeObservers = new ConcurrentHashMap<>();

    @Override
    public void getSeatStatus(SeatStatusRequest request, StreamObserver<SeatStatusResponse> responseObserver) {
        String seatKey = generateSeatKey(request.getRowNumber(), request.getSeatLetter());
        SeatStatus seatStatus = seatStatuses.getOrDefault(seatKey, SeatStatus.newBuilder()
                .setRowNumber(request.getRowNumber())
                .setSeatLetter(request.getSeatLetter())
                .setOccupied(false)
                .build());

        SeatStatusResponse response = SeatStatusResponse.newBuilder()
                .setRowNumber(seatStatus.getRowNumber())
                .setSeatLetter(seatStatus.getSeatLetter())
                .setOccupied(seatStatus.getOccupied())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateSeatStatus(UpdateSeatStatusRequest request, StreamObserver<UpdateSeatStatusResponse> responseObserver) {
        String seatKey = generateSeatKey(request.getRowNumber(), request.getSeatLetter());
        SeatStatus updatedStatus = SeatStatus.newBuilder()
                .setRowNumber(request.getRowNumber())
                .setSeatLetter(request.getSeatLetter())
                .setOccupied(request.getOccupied())
                .build();

        seatStatuses.put(seatKey, updatedStatus);

        // Notify all subscribers of the update
        notifyObservers(updatedStatus);

        UpdateSeatStatusResponse response = UpdateSeatStatusResponse.newBuilder()
                .setSuccess(true)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void subscribeToSeatStatusUpdates(SeatStatusSubscriptionRequest request, StreamObserver<SeatStatus> responseObserver) {
        // Add the observer to a list of active observers
        String observerId = generateObserverId();
        activeObservers.put(observerId, responseObserver);

        // Send initial snapshot of all seat statuses
        seatStatuses.values().forEach(responseObserver::onNext);

        // Handle client disconnection        

        Context.CancellationListener listener = (Context context) -> {
            activeObservers.remove(observerId);
            responseObserver.onCompleted();
        };
        Context.current().addListener(listener, MoreExecutors.directExecutor());
    }

    // Method to notify all active observers of a seat status update
    private void notifyObservers(SeatStatus updatedStatus) {
        activeObservers.values().forEach(observer -> {
            try {
                observer.onNext(updatedStatus);
            } catch (Exception e) {
                // Remove observers that fail to receive updates
                activeObservers.values().remove(observer);
            }
        });
    }

    // Helper method to generate a unique observer ID
    private String generateObserverId() {
        return java.util.UUID.randomUUID().toString();
    }

    private String generateSeatKey(int rowNumber, String seatLetter) {
        return rowNumber + "-" + seatLetter;
    }
}