#!/bin/bash
set -e

# Update system
yum update -y

# Install required packages
yum install -y bind-utils jq

# Install nginx
amazon-linux-extras install nginx1 -y

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm
rm ./amazon-cloudwatch-agent.rpm

# Create script to resolve SRV records and get actual IPs
cat > /usr/local/bin/update-upstream-ips.sh <<'RESOLVE_SCRIPT'
#!/bin/bash
set -e

# Query ECS to get task IPs for backend
CLUSTER="${ecs_cluster_name}"

# Get backend task IPs
aws ecs list-tasks --cluster $CLUSTER --service-name checkup-backend-${environment} --region ${aws_region} --query 'taskArns[]' --output text | \
while read TASK_ARN; do
  aws ecs describe-tasks --cluster $CLUSTER --tasks $TASK_ARN --region ${aws_region} --query 'tasks[0].containers[?name==`backend`].networkInterfaces[0].privateIpv4Address' --output text
done | head -n1 > /tmp/backend_ip.txt || echo "" > /tmp/backend_ip.txt

# Get frontend task IPs
aws ecs list-tasks --cluster $CLUSTER --service-name checkup-frontend-${environment} --region ${aws_region} --query 'taskArns[]' --output text | \
while read TASK_ARN; do
  aws ecs describe-tasks --cluster $CLUSTER --tasks $TASK_ARN --region ${aws_region} --query 'tasks[0].containers[?name==`frontend`].networkInterfaces[0].privateIpv4Address' --output text
done | head -n1 > /tmp/frontend_ip.txt || echo "" > /tmp/frontend_ip.txt

# Update nginx upstream config
BACKEND_IP=$(cat /tmp/backend_ip.txt)
FRONTEND_IP=$(cat /tmp/frontend_ip.txt)

if [ -n "$BACKEND_IP" ] && [ -n "$FRONTEND_IP" ]; then
  cat > /etc/nginx/conf.d/upstreams.conf <<UPSTREAM
upstream backend_pool {
    server $BACKEND_IP:3344 max_fails=3 fail_timeout=30s;
}

upstream frontend_pool {
    server $FRONTEND_IP:8080 max_fails=3 fail_timeout=30s;
}
UPSTREAM
  nginx -t && systemctl reload nginx
fi
RESOLVE_SCRIPT

chmod +x /usr/local/bin/update-upstream-ips.sh

# Run the script initially (will fail first time, that's ok)
/usr/local/bin/update-upstream-ips.sh || true

# Set up cron to update IPs every minute
echo "* * * * * root /usr/local/bin/update-upstream-ips.sh" > /etc/cron.d/update-upstream-ips

# Configure nginx with initial upstream placeholders
cat > /etc/nginx/conf.d/upstreams.conf <<'UPSTREAM'
upstream backend_pool {
    server 127.0.0.1:9999 down;  # Placeholder, will be updated by cron
}

upstream frontend_pool {
    server 127.0.0.1:9998 down;  # Placeholder, will be updated by cron
}
UPSTREAM

cat > /etc/nginx/conf.d/app.conf <<EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=general_limit:10m rate=50r/s;

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name %{ if domain_name != "" }${domain_name}%{ else }_%{ endif };
    # server_name $${domain_name:-_};
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log /var/log/nginx/access.log combined;
    error_log /var/log/nginx/error.log warn;
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Backend API
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://backend_pool;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # Auth endpoints (no caching)
    location /auth {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://backend_pool;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_no_cache 1;
        proxy_cache_bypass 1;
    }
    
    # Application endpoints
    location /applications {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://backend_pool;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Frontend (Vue SPA)
    location / {
        limit_req zone=general_limit burst=100 nodelay;
        
        proxy_pass http://frontend_pool;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Cache static assets
        proxy_cache_valid 200 1h;
        proxy_cache_bypass \$http_pragma \$http_authorization;
        add_header X-Cache-Status \$upstream_cache_status;
    }
}
EOF

# Configure CloudWatch agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json <<'EOF'
{
  "metrics": {
    "namespace": "Nginx",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          {
            "name": "cpu_usage_idle",
            "rename": "CPU_USAGE_IDLE",
            "unit": "Percent"
          },
          {
            "name": "cpu_usage_iowait",
            "rename": "CPU_USAGE_IOWAIT",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60,
        "totalcpu": false
      },
      "disk": {
        "measurement": [
          {
            "name": "used_percent",
            "rename": "DISK_USED",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "mem": {
        "measurement": [
          {
            "name": "mem_used_percent",
            "rename": "MEM_USED",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/aws/ec2/nginx/access",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/aws/ec2/nginx/error",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json

# Enable and start nginx
systemctl enable nginx
systemctl start nginx

# Configure automatic security updates
yum install -y yum-cron
sed -i 's/apply_updates = no/apply_updates = yes/' /etc/yum/yum-cron.conf
systemctl enable yum-cron
systemctl start yum-cron

echo "nginx reverse proxy setup complete"
