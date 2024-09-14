FROM node:14.17.0-alpine AS build
WORKDIR /app

# Install dependencies

COPY package.json yarn.lock ./
RUN yarn install

# Install expo-cli

RUN yarn global add expo-cli

# Copy the project files

COPY . .

# Install Android SDK

FROM openjdk:8-jdk-alpine AS android-sdk
RUN mkdir -p /sdk && \n wget -q https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip -O /sdk/tools.zip && \n unzip /sdk/tools.zip -d /sdk && \n rm /sdk/tools.zip

# Install Gradle

FROM gradle:6.3-jdk8-alpine AS build-android
COPY --from=android-sdk /sdk /sdk
ENV ANDROID_HOME=/sdk
ENV PATH=$PATH:/sdk/tools:/sdk/tools/bin:/sdk/platform-tools

# Build the Android project

WORKDIR /app/android
COPY android .
RUN gradle build

# Install dependencies for iOS

FROM ruby:2.7.1-alpine AS build-ios
RUN apk add --no-cache bash git openssh make curl
RUN gem install cocoapods

# Copy dependencies

WORKDIR /app/ios
COPY ios .

# Install Pods

RUN pod install

# Final stage

FROM node:14.17.0-alpine AS runtime

# Copy Node.js dependencies and Expo project

WORKDIR /app
COPY --from=build /app .

# Set environment variables

ENV NODE_ENV production

# Expose port

EXPOSE 19000

CMD ["yarn", "start"]
