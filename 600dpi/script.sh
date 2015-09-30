#!/bin/bash
INPUT_FILE=${1}

convert -units PixelsPerInch -resample 600 ${INPUT_FILE} resample.tif
convert -sharpen 0x3 resample.tif sharpen.tif
convert -negate sharpen.tif negate.tif
convert -threshold 65% negate.tif threshold65.tif
