#!/bin/bash
INPUT_FILE=${1}
OUTPUT_FILE=${2}
COUNTER=10

while [  $COUNTER -lt 100 ]; do
    `convert -threshold $COUNTER% ${INPUT_FILE} ${OUTPUT_FILE}${COUNTER}`
    let COUNTER=COUNTER+10
done
