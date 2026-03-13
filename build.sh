#!/bin/bash

# Instalar dependencias de Node.js
npm install

# Instalar ffmpeg (sí se puede)
apt-get update
apt-get install -y ffmpeg

# Instalar yt-dlp para el usuario
python3 -m pip install --upgrade yt-dlp --user
