package main

import (
	"crypto/tls"
	"flag"
	"fmt"
	"graphql-gateway/graph"
	"log"
	"net/http"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/quic-go/quic-go/http3"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/v2/ast"
)

func main() {
	// Command-line flags for address, port, certificate, and key
	addr := flag.String("address", "0.0.0.0", "server address")
	port := flag.Int("port", 4444, "server port")
	certFile := flag.String("cert", "_wildcard.app.lan+3.pem", "TLS certificate file")
	keyFile := flag.String("key", "_wildcard.app.lan+3-key.pem", "TLS key file")
	flag.Parse()

	listenAddr := fmt.Sprintf("%s:%d", *addr, *port)

	graphqlHandler := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	graphqlHandler.AddTransport(transport.SSE{
		// Load balancers, proxies, or firewalls often have idle timeout
		// settings that specify the maximum duration a connection can
		// remain open without data being sent across it. If the idle
		// timeout is exceeded without any data being transmitted, the
		// connection may be closed when connecting SSE over HTTP/1.
		//
		// End-to-end HTTP/2 connections do not require a ping interval
		// to keep the connection open.
		KeepAlivePingInterval: 10 * time.Second,
	}) // Add SSE first.

	graphqlHandler.AddTransport(transport.Options{})
	graphqlHandler.AddTransport(transport.GET{})
	graphqlHandler.AddTransport(transport.POST{})

	graphqlHandler.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	graphqlHandler.Use(extension.Introspection{})
	graphqlHandler.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	mux := http.NewServeMux()
	mux.Handle("/", playground.Handler("GraphQL playground", "/graphql"))
	mux.Handle("/graphql", graphqlHandler)

	// Add CORS middleware with localhost allowed
	corsHandler := cors.New(cors.Options{
		AllowedMethods: []string{
			http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodHead,
		},
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		AllowedHeaders: []string{
			"Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With",
			// Add SSE-specific headers if needed
			"Cache-Control", "X-Requested-With",
		},
		ExposedHeaders: []string{
			"Content-Type", "Cache-Control",
			// Expose SSE-specific headers if needed
		},
	}).Handler(mux)

	log.Printf("connect to https://%s/ for GraphQL playground", listenAddr)

	// TLS configuration with proper ALPN
	cert, err := tls.LoadX509KeyPair(*certFile, *keyFile)
	if err != nil {
		log.Fatalf("failed to load TLS certificate: %v", err)
	}

	tlsConfig := &tls.Config{
		MinVersion:   tls.VersionTLS13,
		NextProtos:   []string{http3.NextProtoH3, "h2"}, // HTTP/2 and HTTP/3
		Certificates: []tls.Certificate{cert},
	}

	http3Server := &http3.Server{
		Addr:      listenAddr,
		TLSConfig: tlsConfig,
		Handler:   corsHandler, // Use CORS handler here
	}

	log.Printf("HTTP/2 server listening on https://%s", listenAddr)
	log.Printf("HTTP/3 server listening on https://%s", listenAddr)

	go func() {
		http2 := &http.Server{
			Addr:      listenAddr,
			TLSConfig: tlsConfig,
			Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				err = http3Server.SetQUICHeaders(w.Header())
				if err != nil {
					log.Fatal(err)
				}
				corsHandler.ServeHTTP(w, r) // Use CORS handler here
			}),
		}
		log.Fatal(http2.ListenAndServeTLS("", "")) // empty cert and key because we use the same TLS config
	}()
	log.Fatal(http3Server.ListenAndServe())
}
