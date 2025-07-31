# Expresso ICE Server

This directory contains the ICE (Interactive Connectivity Establishment) server configuration for the Expresso project. The server uses coturn, a popular TURN/STUN server implementation.

## What is an ICE Server?

An ICE server provides two main services:

- **STUN (Session Traversal Utilities for NAT)**: Helps discover public IP addresses and NAT traversal
- **TURN (Traversal Using Relays around NAT)**: Provides relay services when direct peer-to-peer connection fails

## Configuration

### Ports

- **4004**: TURN/UDP (Main external port)
- **4005**: TURN/TCP
- **4006**: TURN/TLS
- **4007**: STUN/UDP
- **4008**: STUN/TCP

### Users

The server is configured with 12 users for authentication:

- `expresso_user:expresso_password`
- `expresso_user2:expresso_password2`
- ... (up to expresso_user12)

## Setup Instructions

### 1. Update Configuration

Before starting the server, you need to update the following in `.env`:

```env
TURN_EXTERNAL_IP=YOUR_EC2_ELASTIC_IP_HERE  # Replace with your server's public IP
```

### 2. Start the Server

```bash
cd iceserver
docker-compose up -d
```

### 3. Verify the Server

```bash
# Check if the container is running
docker ps | grep coturn

# Check logs
docker-compose logs coturn

# Test connectivity
netstat -tuln | grep 4004
```

## Usage in Your Application

### Frontend Configuration

Update your frontend ICE server configuration in the video call components:

```typescript
// In VideoCallV2/lib/VideocallConnector.ts and VideoCallV3/lib/VideocallConnector.ts
iceServers: [
  {
    urls: `stun:${process.env.NEXT_PUBLIC_ICE_SERVER_DOMAIN}`, // STUN server
  },
  {
    urls: `turn:${process.env.NEXT_PUBLIC_ICE_SERVER_DOMAIN}?transport=udp`, // TURN UDP
    credential: process.env.NEXT_PUBLIC_ICE_SERVER_PASSWORD,
    username: process.env.NEXT_PUBLIC_ICE_SERVER_USERNAME,
  },
  {
    urls: `turn:${process.env.NEXT_PUBLIC_ICE_SERVER_DOMAIN}?transport=tcp`, // TURN TCP
    credential: process.env.NEXT_PUBLIC_ICE_SERVER_PASSWORD,
    username: process.env.NEXT_PUBLIC_ICE_SERVER_USERNAME,
  },
];
```

### Server Configuration

Update your server configuration in `server/config.ts`:

```typescript
iceServers: [
  { urls: `stun:${process.env.ICE_SERVER_DOMAIN}` },
  {
    urls: `turn:${process.env.ICE_SERVER_DOMAIN}`,
    credential: process.env.ICE_SERVER_PASSWORD,
    username: process.env.ICE_SERVER_USERNAME
  },
],
```

## Security Considerations

1. **Change Default Passwords**: Update the default passwords in the configuration
2. **Use HTTPS**: Consider enabling TLS for production use
3. **Firewall Rules**: Ensure ports 4004-4008 are open on your server
4. **Rate Limiting**: The server includes basic rate limiting and quotas

## Troubleshooting

### Common Issues

1. **Server not accessible**: Check firewall rules and ensure ports are open
2. **Authentication failed**: Verify username/password in your application configuration
3. **Connection timeouts**: Check if the external IP is correctly set

### Logs

```bash
# View real-time logs
docker-compose logs -f coturn

# Check server status
docker exec expresso_coturn netstat -tuln
```

## Production Deployment

For production deployment:

1. **Enable TLS**: Uncomment and configure SSL certificates
2. **Use Strong Passwords**: Change all default passwords
3. **Monitor Resources**: Set up monitoring for bandwidth and connection limits
4. **Backup Configuration**: Keep backups of your configuration files

## Docker Commands

```bash
# Start the server
docker-compose up -d

# Stop the server
docker-compose down

# Restart the server
docker-compose restart

# View logs
docker-compose logs coturn

# Access the container
docker exec -it expresso_coturn sh
```
