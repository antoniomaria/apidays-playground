Generate self signed certificate

mkcert "*.app.lan" "*.app.test" "*.app.invalid" "*.app.example"
  281

Ensure that your hosts file has entry which resolves to 127.0.0.1

ping -c 1 hello.app.lan
PING hello.app.lan (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.105 ms

--- hello.app.lan ping statistics ---
1 packets transmitted, 1 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 0.105/0.105/0.105/nan ms


go run server.go -address=0.0.0.0 -port=4446


No need to do it again: 
  go mod init graphql-gateway  
  go run github.com/99designs/gqlgen init
  edit genereated schema.graphqls
  run again:
  go run github.com/99designs/gqlgen 
  go get github.com/quic-go/quic-go/http3



