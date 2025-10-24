#!/bin/bash

# Start MockPass for CorpPass development simulation
# MockPass will run on http://localhost:5156

echo "Starting MockPass for CorpPass simulation..."
echo "MockPass will be available at http://localhost:5156"
echo ""
echo "CorpPass endpoints:"
echo "  - Authorization: http://localhost:5156/corppass/v2/authorize"
echo "  - Token:         http://localhost:5156/corppass/v2/token"
echo "  - JWKS:          http://localhost:5156/corppass/v2/.well-known/keys"
echo "  - Discovery:     http://localhost:5156/corppass/v2/.well-known/openid-configuration"
echo ""

# Set PORT explicitly to avoid conflicts with backend
PORT=5156 npx mockpass \
  --port 5156 \
  --corppass \
  --show-login-page \
  --verbose
