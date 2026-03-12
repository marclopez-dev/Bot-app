#!/usr/bin/env bash

apt-get update
apt-get install -y ffmpeg

npm install
pip install -r requirements.txt