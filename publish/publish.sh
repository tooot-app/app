#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Arguments incorrect"
    exit 1
fi

expo publish --release-channel=$1