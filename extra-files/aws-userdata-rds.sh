#!/bin/bash

# Enable logs
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# Install Git
echo "Installing Git"
yum update -y
yum install git -y

# Install NodeJS
echo "Installing NodeJS"
touch .bashrc
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. /.nvm/nvm.sh
nvm install --lts

# Clone website code
echo "Cloning website"
mkdir -p /cc-assignment2
cd /cc-assignment2
git clone https://github.com/abhi10-07/cloud-computing2.git .
cd dynamic-website-with-database

# Install dependencies
echo "Installing dependencies"
npm install

# Forward port 80 traffic to port 3000
echo "Forwarding 80 -> 3000"
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000

# Install & use pm2 to run Node app in background
echo "Installing & starting pm2"
# Note: You might want to use AWS Secrets Manager instead of using environment variables
export DB_HOST=db_link
export DB_USER=db_user
export DB_PASSWORD=db_passowrd
export DB_NAME=db_name
npm install pm2@latest -g
# pm2 start server.js