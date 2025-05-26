package main

import (
	"graphql-gateway/graph"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/quic-go/quic-go/http3"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "7001"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", srv)

	log.Printf("connect to https://localhost:%s/ for GraphQL playground (QUIC/HTTP3)", port)

	// QUIC requires TLS certificates
	certFile := "./G680077+1.pem"
	keyFile := "./G680077+1-key.pem"
 	
	mux := http.NewServeMux()
  	mux.HandleFunc("/ping", pingHandler)
	// Use http3.Server to serve over QUIC		
	// use default http.DefaultServeMux    
	err := http3.ListenAndServeTLS(":" + port, certFile, keyFile, nil)

  if err != nil {
    log.Fatalf("Failed to configure HTTP/3: %v", err)
  }
}
func pingHandler(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(http.StatusOK)
  w.Write([]byte(`{"message": "puk"}`))
}