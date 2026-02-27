#!/bin/bash
# VM Startup Script for Restreamer

# Set a writable directory for gcloud config to avoid permission errors in /root
export CLOUDSDK_CONFIG="/tmp/gcloud_config"
mkdir -p $CLOUDSDK_CONFIG

# Helper: Get Metadata
get_metadata() {
  curl -s -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/$1"
}

# 1. Get Zone and Name dynamically
ZONE=$(get_metadata "zone" | awk -F/ '{print $NF}')
NAME=$(get_metadata "name")

# 2. Update metadata for Dashboard Tracking
echo "Updating start-time metadata..."
gcloud compute instances add-metadata "$NAME" \
  --zone="$ZONE" \
  --metadata restreamer-start-time="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 3. Install Docker if missing
if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
  apt-get update && apt-get install -y docker.io
  mkdir -p ~/.docker/cli-plugins/
  curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
  chmod +x ~/.docker/cli-plugins/docker-compose
fi

# 4. Auto-Shutdown Safety Switch
shutdown -h +360 "Server will shutdown in 6 hours for cost saving."

mkdir -p /home/admin/restreamer

# 5. Write Docker Compose Config
cat <<EOF > /home/admin/restreamer/docker-compose.yml
version: '3.8'
services:
  restreamer:
    image: datarhei/restreamer:latest
    container_name: restreamer
    restart: always
    privileged: true
    ports:
      - "80:80"       # Web HTTP
      - "443:443"     # Web HTTPS
      - "1935:1935"   # RTMP
      - "1936:1936"   # RTMPS
    environment:
      - RS_TIMEZONE=Africa/Accra
      - RS_HTTPS=1
      - RS_HTTPS_DOMAINS=stream.osucoc.org
    volumes:
      - /home/admin/restreamer/config:/core/config
      - /home/admin/restreamer/data:/core/data
EOF

# Ensure Docker starts on boot
systemctl enable docker
systemctl start docker

# 6. Start/Update Container
cd /home/admin/restreamer
docker compose up -d --force-recreate --remove-orphans
