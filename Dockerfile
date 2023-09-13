# Use the official Node.js image from DockerHub
FROM node:18.0.0

RUN apt-get update && apt-get install -y iputils-ping

# Set the working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json or yarn.lock into the container
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the application files into the container
COPY . .

# Build the application
RUN yarn run build

RUN touch .env

# Expose port 8080
EXPOSE 8080

# Set app serving to permissive / assigned
ENV NUXT_HOST=0.0.0.0
# Set app port
ENV NUXT_PORT=8080

# Run the application
CMD ["yarn", "start"]
