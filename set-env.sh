#!/bin/bash

export DOCKER_HOST_IP=$(ipconfig getifaddr en0)

echo DOCKER_HOST_IP is "$DOCKER_HOST_IP"