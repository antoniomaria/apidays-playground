package main

import (
	aircraftv1 "aircraft-seats-service-go/internal/gen/proto/example/com/aircraft/v1"
	"aircraft-seats-service-go/internal/gen/proto/example/com/aircraft/v1/aircraftv1connect"
	"context"
	"fmt"
	"log"
	"net/http"
	"sync"
	"connectrpc.com/connect"
	"github.com/google/uuid"
	"github.com/quic-go/quic-go/http3"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)


type aircraftServer struct {
	seatStatuses    map[string]*aircraftv1.SeatStatus
	activeObservers map[string]connect.ServerStream[aircraftv1.SeatStatus]
	mu sync.Mutex

}

func NewAircraftServer() *aircraftServer {
    return &aircraftServer{
        seatStatuses:    make(map[string]*aircraftv1.SeatStatus),
        activeObservers: make(map[string]connect.ServerStream[aircraftv1.SeatStatus]),
    }
}




func (s *aircraftServer) GetSeatStatus(ctx context.Context, req *connect.Request[aircraftv1.SeatStatusRequest]) (*connect.Response[aircraftv1.SeatStatusResponse], error) {
	log.Printf("Received GetSeatStatus request: rowNumber=%d, seatLetter=%s", req.Msg.RowNumber, req.Msg.SeatLetter)

	seatKey :=  s.generateSeatKey(req.Msg.RowNumber, req.Msg.SeatLetter)

	seatStatus, exists :=s.seatStatuses[seatKey]
	if !exists {
		seatStatus = &aircraftv1.SeatStatus{
			RowNumber: req.Msg.RowNumber,
			SeatLetter: req.Msg.SeatLetter,
			Occupied: false,
		}
	}

	response := &aircraftv1.SeatStatusResponse{
		RowNumber:  seatStatus.RowNumber,
		SeatLetter: seatStatus.SeatLetter,
		Occupied:   seatStatus.Occupied,
	}

	return connect.NewResponse(response), nil
}


func (s *aircraftServer) UpdateSeatStatus(ctx context.Context, req *connect.Request[aircraftv1.UpdateSeatStatusRequest]) (*connect.Response[aircraftv1.UpdateSeatStatusResponse], error) {
	log.Printf("Received UpdateSeatStatus request: rowNumber=%d, seatLetter=%s, occupied=%t", req.Msg.RowNumber, req.Msg.SeatLetter, req.Msg.Occupied)

	seatKey := fmt.Sprintf("%d-%s", req.Msg.RowNumber, req.Msg.SeatLetter)

	s.mu.Lock()
	s.seatStatuses[seatKey] = &aircraftv1.SeatStatus{
		RowNumber: req.Msg.RowNumber,
		SeatLetter: req.Msg.SeatLetter,
		Occupied: req.Msg.Occupied,
	}
	s.mu.Unlock()

	s.notifyObservers(s.seatStatuses[seatKey])

	response := &aircraftv1.UpdateSeatStatusResponse{
		Success: true,
	}
	return connect.NewResponse(response), nil
}

func (s *aircraftServer) SubscribeToSeatStatusUpdates(ctx context.Context, req *connect.Request[aircraftv1.SeatStatusSubscriptionRequest], stream *connect.ServerStream[aircraftv1.SeatStatus]) error {
	log.Println("Received SubscribeToSeatStatusUpdates request")

	s.mu.Lock()
	observerID := s.generateObserverId()
	s.activeObservers[observerID] = *stream
	s.mu.Unlock()

	s.mu.Lock()
	for _, seat := range s.seatStatuses {
		log.Printf("seat=%s",seat)
		stream.Send(seat)
	}
	s.mu.Unlock()

	<-ctx.Done()

	s.mu.Lock()
	delete(s.activeObservers, observerID)
	s.mu.Unlock()

	return nil
}


func (s *aircraftServer) notifyObservers(updatedStatus *aircraftv1.SeatStatus) {
	log.Printf("Notifying observers of seat status update: rowNumber=%d, seatLetter=%s, occupied=%t",
		updatedStatus.RowNumber, updatedStatus.SeatLetter, updatedStatus.Occupied)

	for id, observer := range  s.activeObservers {
		err := observer.Send(updatedStatus)
		if err != nil {
			log.Printf("Failed to notify observer %s, removing it", id)
			delete( s.activeObservers, id)
		}
	}
}


func (s *aircraftServer) generateObserverId() string {
	return uuid.New().String()
}

func (s *aircraftServer) generateSeatKey(rowNumber int32, seatLetter string) string {
	return fmt.Sprintf("%d-%s", rowNumber, seatLetter)
}

//for http3
func main1() {
	mux := http.NewServeMux()
	aircraftSvc := NewAircraftServer()
    mux.Handle(aircraftv1connect.NewAircraftSeatsServiceHandler(aircraftSvc))

	addr := "127.0.0.1:8980"
	log.Printf("Starting connectrpc on %s", addr)
	h3srv := http3.Server{
		Addr:    addr,
		Handler: mux,
	}
	if err := h3srv.ListenAndServeTLS("cert.crt", "cert.key"); err != nil {
		log.Fatalf("error: %s", err)
	}
}


func main() {
	mux := http.NewServeMux()
	aircraftSvc := NewAircraftServer()
    mux.Handle(aircraftv1connect.NewAircraftSeatsServiceHandler(aircraftSvc))

	addr := "127.0.0.1:8980" 
	log.Printf("Starting connectrpc on %s", addr)


	srv := http.Server{
		Addr:    addr,
		Handler: h2c.NewHandler(mux, &http2.Server{}),
	}
		if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("error: %s", err)
	}


}

