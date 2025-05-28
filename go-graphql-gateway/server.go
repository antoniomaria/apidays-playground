package main

import (
	"graphql-gateway/graph"
	"log"
	"net/http"	
	"flag"
	"fmt"
	"github.com/quic-go/quic-go/http3"
	"crypto/tls"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/vektah/gqlparser/v2/ast"
)



func main() {
	// Command-line flags for address and port
	addr := flag.String("address", "0.0.0.0", "server address")
	port := flag.Int("port", 443, "server port")
	flag.Parse()

	listenAddr := fmt.Sprintf("%s:%d", *addr, *port)

	graphqlHandler := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	graphqlHandler.AddTransport(transport.Options{})
	graphqlHandler.AddTransport(transport.GET{})
	graphqlHandler.AddTransport(transport.POST{})

	graphqlHandler.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	graphqlHandler.Use(extension.Introspection{})
	graphqlHandler.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	mux := http.NewServeMux()
	mux.Handle("/", playground.Handler("GraphQL playground", "/query"))
	mux.Handle("/query", graphqlHandler)
	
	log.Printf("connect to https://%s/ for GraphQL playground", listenAddr)

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

	http3 := &http3.Server{
		Addr:      listenAddr,
		TLSConfig: tlsConfig,
		Handler:   mux,
	}

	log.Printf("HTTP/2 server listening on https://%s", listenAddr)
	log.Printf("HTTP/3 server listening on https://%s", listenAddr)

	// handle http2 for browsers that don't yet support HTTP/3 and add QUIC endpoint headers
	go func() {
		http2 := &http.Server{
			Addr:      listenAddr,
			TLSConfig: tlsConfig,
			Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				err = http3.SetQUICHeaders(w.Header())
				if err != nil {
					log.Fatal(err)
				}
				mux.ServeHTTP(w, r)
			}),
		}
		log.Fatal(http2.ListenAndServeTLS("", "")) // empty cert and key because we use the same TLS config
	}()
	// start http3 server
	log.Fatal(http3.ListenAndServe())
	
}
