# Go GraphQL Gateway with HTTP/3 (QUIC) Support

This project is a **GraphQL gateway server written in Go** using [gqlgen](https://github.com/99designs/gqlgen), supporting both HTTP/2 and HTTP/3 (QUIC) protocols.  
It demonstrates a simple seat reservation API with real-time updates and is configured for local development with self-signed certificates.

## Features

- GraphQL API for seat status and updates
- Real-time seat status subscription (WebSocket/GraphQL Subscriptions)
- HTTP/2 and HTTP/3 (QUIC) support via [quic-go](https://github.com/quic-go/quic-go)
- Playground UI for interactive GraphQL queries via [graphiql](https://github.com/graphql/graphiql)

## Prerequisites

- Go 1.20+ installed
- [mkcert](https://github.com/FiloSottile/mkcert) (for generating local trusted certificates)


## Setup

### 1. Clone the repository

```sh
git clone https://github.com/antoniomaria/apidays-playground
cd go-graphql-gateway
```

### 2. Generate a self-signed certificate

```sh
mkcert "*.app.lan" "*.app.test" "*.app.invalid" "*.app.example"
```

This will generate certificate and key files (e.g., `_wildcard.app.lan+3.pem` and `_wildcard.app.lan+3-key.pem`).

### 3. Update your `/etc/hosts`

Add an entry to resolve your test domain to localhost:

```
127.0.0.1 graphql-gateway.app.lan
```

Test with:

```sh
ping -c 1 graphql-gateway.app.lan
```


## Running the Server

```sh
go run server.go -address=0.0.0.0 -port=4444 -cert=_wildcard.app.lan+3.pem -key=_wildcard.app.lan+3-key.pem
```

- The server will be available at: [https://graphql-gateway.app.lan:4444/](https://graphql-gateway.app.lan:4446/)
- Open the URL in your browser and accept the certificate warning if prompted.


## GraphQL Example

**Ping Query:**
```graphql
query {
  ping
}
```

**Seat Status Query:**
```graphql
query {
  seatStatus(rowNumber: 1, seatLetter: "A") {
    rowNumber
    seatLetter
    occupied
  }
}
```

## Development Notes

To regenerate GraphQL code after editing the [schema](./graph/schema.graphqls):

```sh
go run github.com/99designs/gqlgen generate
```

## Troubleshooting: Forcing HTTP/3 in Browsers

Browsers don't always use HTTP/3 by default, especially on localhost or custom domains. If you want to ensure your browser uses HTTP/3 to connect to your server, try the following:

### Chrome/Chromium

You can force Chrome to use HTTP/3 by passing the parameter:

```sh
chrome --origin-to-force-quic-on=graphql-gateway.app.lan:4444
```

### Firefox

1. Open `about:config` in the Firefox address bar.
2. Ensure that `network.http.http3.force-use-alt-svc-mapping-for-testing` is set to true
3. Search for `network.http.http3.alt-svc-mapping-for-testing`.
4. Add the following value (replace with your domain and port if needed):

   ```
   graphql-gateway.app.lan;h3=":4444";h3-29=":4444"
   ```

5. **Set `network.http.http3.disable_when_third_party_roots_found` to `false`**  
   This allows HTTP/3 even when using self-signed or third-party certificates.

6. Restart Firefox.

#### Firefox Troubleshooting Note

**Note:** The Firefox troubleshooting steps above have been tested using Firefox 139.0 on macOS 10.15). Behavior may vary in other versions.

### Using curl to Test HTTP/3

You can also test your server's HTTP/3 support using `curl` (requires a version built with HTTP/3 support):

```sh
curl --http3 -vk https://graphql-gateway.app.lan:4444/
```

- The `-k` flag allows curl to connect to servers with self-signed certificates.
- The `-v` flag enables verbose output, so you can see if HTTP/3 is negotiated.
- If your system `curl` does not support `--http3`, install a recent version via [Homebrew](https://brew.sh/) or build from source.

#### Using a Custom CA with curl

If you want curl to trust your mkcert-generated CA instead of using `-k`, use the `--cacert` parameter.  
First, find your mkcert CA root path:

```sh
mkcert -CAROOT
```

Then use the CA file in your curl command:

```sh
curl --http3 -v --cacert /path/to/mkcert/rootCA.pem https://graphql-gateway.app.lan:4444/
```

Replace `/path/to/mkcert/rootCA.pem` with the actual path printed by `mkcert -CAROOT` (the file is usually named `rootCA.pem` in that directory).






