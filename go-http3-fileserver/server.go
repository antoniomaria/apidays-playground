package main

import (
	"crypto/tls"
	"flag"
	"fmt"
	"github.com/quic-go/quic-go/http3"	
	"log"
	"net/http"
)

func main() {
	// Command-line flags for address and port
	addr := flag.String("address", "0.0.0.0", "server address")
	port := flag.Int("port", 4445, "server port")
	serveRoot := flag.String("www", "/Users/antonio.sanchez/git/apidays-playground/go-http3-fileserver/html", "Root of path to serve under https://127.0.0.1/files/")
	
	flag.Parse()

	listenAddr := fmt.Sprintf("%s:%d", *addr, *port)

	// Handler for both HTTP/2 and HTTP/3 with multiple endpoints
	mux := http.NewServeMux()
	
	mux.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello from server supporting HTTP/2 and advertising HTTP/3!"))
	})

	mux.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir(*serveRoot))))
	
	// TLS configuration with proper ALPN
	tlsCertFile := "./_wildcard.app.lan+3.pem"
	tlsKeyFile := "./_wildcard.app.lan+3-key.pem"

	cert, err := tls.LoadX509KeyPair(tlsCertFile, tlsKeyFile)
	if err != nil {
		log.Fatalf("failed to load TLS certificate: %v", err)
	}

	tlsConfig := &tls.Config{
		MinVersion:   tls.VersionTLS13,
		NextProtos:   []string{http3.NextProtoH3, "h2"}, // HTTP/2 and HTTP/3
		Certificates: []tls.Certificate{cert},
	}

	server := &http3.Server{
		Addr:      listenAddr,
		TLSConfig: tlsConfig,
		Handler:   mux,
	}

	log.Printf("HTTP/2 server listening on https://%s", listenAddr)
	log.Printf("HTTP/3 server listening on https://%s", listenAddr)

	// handle http2 for browsers that don't yet support HTTP/3 and add QUIC endpoint headers
	go func() {
		s := &http.Server{
			Addr:      listenAddr,
			TLSConfig: tlsConfig,
			Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				err = server.SetQUICHeaders(w.Header())
				if err != nil {
					log.Fatal(err)
				}
				mux.ServeHTTP(w, r)
			}),
		}

		log.Fatal(s.ListenAndServeTLS("", ""))
	}()
	// start http3 server
	log.Fatal(server.ListenAndServe())
}
