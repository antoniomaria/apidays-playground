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