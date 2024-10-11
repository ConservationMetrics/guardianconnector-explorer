# Use the official Node.js image from DockerHub
FROM node:18.0.0

# Set the working directory
RUN mkdir -p /app
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json  /app/

# Install dependencies
RUN npm install

# Copy the application files into the container
COPY . /app

# Build the application
RUN npm run build

# Expose and set port 8080
EXPOSE 8080
ENV NITRO_PORT=8080

# Run the application
ENTRYPOINT ["node", ".output/server/index.mjs"]