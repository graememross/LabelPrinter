#!/bin/bash -xv

# To connect the raspberry pi to a wifi network
# simply create a file called wifi.init on a usb stick
# the file should contain two lines
## SSID=<network ssid>
## PASSWORD=<netowrk password>
# plug the stick into the raspberry pi, then 
# switch it on
# The pi will set up the wifi network and then reboot
# If it cannot connect to the network (wrong information)
# then the pi will continually reboot until the info on the usb
# stick is corrected

CARRIER=`ip addr show wlan0|grep -o NO-CARRIER`

if [ "$CARRIER" == 'NO-CARRIER' ];
then
    mkdir -p /media/usb
    chown -R pi:pi /media/usb
    mount /dev/sda1 /media/usb -o uid=pi,gid=pi
    if [[ -e /media/usb/wifi.init ]]; 
    then
       source /media/usb/wifi.init
       cat > /etc/wpa_supplicant/wpa_supplicant.conf << EOF
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
	ssid="$SSID"
  psk="$PASSWORD"
}
EOF
# Instead of rebooting here we could just restart networking
# must think about that !
       reboot
    fi
fi
