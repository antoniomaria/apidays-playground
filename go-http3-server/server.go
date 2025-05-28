package main

import (
	"crypto/tls"
	"flag"
	"fmt"
	"github.com/quic-go/quic-go/http3"
	"io"
	"log"
	"net/http"
)

func main() {
	// Command-line flags for address and port
	addr := flag.String("address", "0.0.0.0", "server address")
	port := flag.Int("port", 8443, "server port")
	flag.Parse()

	listenAddr := fmt.Sprintf("%s:%d", *addr, *port)

	// Handler for both HTTP/2 and HTTP/3 with multiple endpoints
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello from server supporting HTTP/2 and advertising HTTP/3!"))
	})
	
	mux.HandleFunc("/demo/tile", func(w http.ResponseWriter, r *http.Request) {
		// Small 40x40 png
		w.Write([]byte{
			0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
			0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x28,
			0x01, 0x03, 0x00, 0x00, 0x00, 0xb6, 0x30, 0x2a, 0x2e, 0x00, 0x00, 0x00,
			0x03, 0x50, 0x4c, 0x54, 0x45, 0x5a, 0xc3, 0x5a, 0xad, 0x38, 0xaa, 0xdb,
			0x00, 0x00, 0x00, 0x0b, 0x49, 0x44, 0x41, 0x54, 0x78, 0x01, 0x63, 0x18,
			0x61, 0x00, 0x00, 0x00, 0xf0, 0x00, 0x01, 0xe2, 0xb8, 0x75, 0x22, 0x00,
			0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
		})
	})
	mux.HandleFunc("/demo/tiles", func(w http.ResponseWriter, r *http.Request) {
		io.WriteString(w, "<html><head><style>img{width:40px;height:40px;}</style></head><body>")
		for i := 0; i < 100; i++ {
			fmt.Fprintf(w, `<img src="/demo/tile?cachebust=%d">`, i)
		}
		io.WriteString(w, "</body></html>")
	})

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
