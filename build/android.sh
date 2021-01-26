#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Arguments incorrect. Use 'xxx'"
    exit 1
fi

JAVA_HOME=`/usr/libexec/java_home -v 1.8.0` \
EXPO_USERNAME='xmflsct' \
EXPO_PASSWORD=',8d_AJ1HmYJo8lbve&QoB40t3ImGdF)Dd' \
EXPO_ANDROID_KEYSTORE_PASSWORD="9c54265087704801ba5d3d88809110a1" \
EXPO_ANDROID_KEY_PASSWORD="748bb2e11529497dad7831c409175b94" \
turtle build:android \
  --release-channel $1 \
  --type app-bundle \
  --keystore-path ./tooot.jks \
  --keystore-alias "QHhtZmxzY3QvdG9vb3Q=" \
  --build-dir ./builds