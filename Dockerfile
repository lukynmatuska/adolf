FROM node:lts

# Create app directory
WORKDIR /usr/src/app

# Copy files from repository to docker image
COPY . .

# Install app dependencies
RUN npm install

# Install PM2
RUN npm install pm2 -g

# If you are building your code for production
# RUN npm ci --only=production

# Open port 3000
# EXPOSE 3000

# Start the app
CMD ["pm2-runtime", "index.js"]