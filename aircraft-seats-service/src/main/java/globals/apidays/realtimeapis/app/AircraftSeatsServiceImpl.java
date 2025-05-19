package globals.apidays.realtimeapis.app;

import com.example.aircraft.*;
import com.google.common.util.concurrent.MoreExecutors;

import io.grpc.stub.StreamObserver;
import io.grpc.Context;

import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AircraftSeatsServiceImpl extends AircraftSeatsServiceGrpc.AircraftSeatsServiceImplBase {

    private static final Logger logger = LoggerFactory.getLogger(AircraftSeatsServiceImpl.class);

    private final ConcurrentHashMap<String, SeatStatus> seatStatuses = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, StreamObserver<SeatStatus>> activeObservers = new ConcurrentHashMap<>();

    @Override
    public void getSeatStatus(SeatStatusRequest request, StreamObserver<SeatStatusResponse> responseObserver) {
        logger.info("Received GetSeatStatus request: rowNumber={}, seatLetter={}",
                request.getRowNumber(), request.getSeatLetter());

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
        logger.info("Received UpdateSeatStatus request: rowNumber={}, seatLetter={}, occupied={}",
                request.getRowNumber(), request.getSeatLetter(), request.getOccupied());

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
        logger.info("Received SubscribeToSeatStatusUpdates request");

        // Add the observer to a list of active observers
        String observerId = generateObserverId();
        activeObservers.put(observerId, responseObserver);

        // Send initial snapshot of all seat statuses
        seatStatuses.values().forEach(responseObserver::onNext);

        // Handle client disconnection        
        Context.CancellationListener listener = (Context context) -> {
            logger.info("Client disconnected: observerId={}", observerId);
            activeObservers.remove(observerId);
            responseObserver.onCompleted();
        };
        Context.current().addListener(listener, MoreExecutors.directExecutor());
    }

    // Method to notify all active observers of a seat status update
    private void notifyObservers(SeatStatus updatedStatus) {
        logger.info("Notifying observers of seat status update: rowNumber={}, seatLetter={}, occupied={}",
                updatedStatus.getRowNumber(), updatedStatus.getSeatLetter(), updatedStatus.getOccupied());

        activeObservers.values().forEach(observer -> {
            try {
                observer.onNext(updatedStatus);
            } catch (Exception e) {
                logger.warn("Failed to notify an observer. Removing it from active observers.", e);
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