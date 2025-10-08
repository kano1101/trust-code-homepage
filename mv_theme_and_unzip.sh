#!/bin/bash

sudo rm -rf /volume1/docker/trust-code/wordpress/themes/readdy-theme
sudo cp -r /home/readdy-theme /volume1/docker/trust-code/wordpress/themes/
sudo chown -R 33:33 /volume1/docker/trust-code/wordpress/themes/readdy-theme
cd /volume1/docker/trust-code
sudo docker compose restart wordpress
