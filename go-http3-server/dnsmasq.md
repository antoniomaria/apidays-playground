brew install dnsmasq

 /opt/homebrew/etc/dnsmasq.conf


o start dnsmasq now and restart at startup:
  sudo brew services start dnsmasq


  Configuring local DNS 

  
  Let’s configure dnsmasq to reroute all requests for *.test to localhost. To do this in macOS, we can add files inside /etc/resolver to configure a nameserver for the .test domain:

  sudo mkdir -p /etc/resolver
echo "nameserver 127.0.0.1" | sudo tee /etc/resolver/test > /dev/null
sudo bash -c 'echo "nameserver 127.0.0.1" > /etc/resolver/test'

sudo bash -c 'echo "nameserver 127.0.0.1" > /etc/resolver/lan'

https://gist.github.com/ogrrd/5831371

--------
Create a DNS record

Next, we’ll configure dnsmasq to answer with 127.0.0.1 for any DNS requests ending with .test which includes subdomains. Open the file $HOMEBREW_PREFIX/etc/dnsmasq.conf in an editor of your choice using sudo. I’m using vim so I’ll be entering the following command in my terminal:
echo 'address=/.test/127.0.0.1' >> $(brew --prefix)/etc/dnsmasq.conf

With that, we’ve told both macOS and dnsmasq to point to 127.0.0.1 for all requests to *.test. Only thing left is to configure dnsmasq to run in the background and on boot:

sudo brew services start dnsmasq


ping -c 1 nginx.random.${LOCAL_CUSTOM_TLD}

ping -c 1 another-sub-domain.lan
PING another-sub-domain.lan (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.154 ms

--- another-sub-domain.lan ping statistics ---
1 packets transmitted, 1 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 0.154/0.154/0.154/0.000 ms


Remember to NOT delete your old DNS servers from MacOS network preferences. Add 127.0.0.1 to the list and move it to the top. When you hit the + button it deletes the DNS entries by default from the list, so note them down, and add them back in, but add 127.0.0.1 to the top.