# Go HTTP/3 Demo Server

This project is a demonstration server written in Go that supports both **HTTP/2** and **HTTP/3 (QUIC)** using the [`quic-go`](https://github.com/quic-go/quic-go) library. It serves static endpoints over TLS, advertises HTTP/3 support, and is suitable for testing browser and client support for modern web protocols.

## Features

- **HTTP/2 and HTTP/3 support** on the same port (with proper ALPN negotiation)
- Serves a simple greeting at `/`
- Serves a small PNG image at `/demo/tile`
- Serves an HTML page displaying 100 PNG tiles at `/demo/tiles`
- Custom TLS certificate support

## Prerequisites

- **Go 1.21+** (for HTTP/3 support)
- **OpenSSL** (for generating self-signed certificates, if needed)
- Modern browser (for HTTP/3 testing)

## Getting Started

### 1. Clone the Repository

```sh
git clone <repository-url>
cd go-http3-server

network.http.http3.disable_when_third_party_roots_found
https://www.reddit.com/r/nginx/comments/18ah617/unable_to_get_http3_working_with_browsers/


https://github.com/mozilla/neqo/blob/main/README.md
    Run neqo-server via cargo run --bin neqo-server -- 'localhost:12345' --db ./test-fixture/db.
    On Firefox, set about:config preferences:

    network.http.http3.alt-svc-mapping-for-testing to localhost;h3=":12345"
    network.http.http3.disable_when_third_party_roots_found to false
