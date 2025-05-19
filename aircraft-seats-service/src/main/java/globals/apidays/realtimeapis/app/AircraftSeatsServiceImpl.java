package globals.apidays.realtimeapis.app;

import com.example.aircraft.*;
import io.grpc.stub.StreamObserver;

import java.util.concurrent.ConcurrentHashMap;

public class AircraftSeatsServiceImpl extends AircraftSeatsServiceGrpc.AircraftSeatsServiceImplBase {

    private final ConcurrentHashMap<String, SeatStatus> seatStatuses = new ConcurrentHashMap<>();

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

        UpdateSeatStatusResponse response = UpdateSeatStatusResponse.newBuilder()
                .setSuccess(true)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void subscribeToSeatStatusUpdates(SeatStatusSubscriptionRequest request, StreamObserver<SeatStatus> responseObserver) {
        // Simulate real-time updates by streaming seat status changes
        seatStatuses.values().forEach(responseObserver::onNext);

        // Keep the stream open for further updates (in a real implementation, updates would be pushed here)
        // For simplicity, we won't implement real-time updates in this example.
    }

    private String generateSeatKey(int rowNumber, String seatLetter) {
        return rowNumber + "-" + seatLetter;
    }
}