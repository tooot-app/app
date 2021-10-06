#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Arguments incorrect"
    exit 1
fi

expo publish --quiet --target bare --release-channel=$1