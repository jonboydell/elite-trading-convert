INPUT_FILE=${1}

convert -units PixelsPerInch -resample 300 ${INPUT_FILE} resample.tif
convert -sharpen 0x3 resample.tif sharpen.tif
convert -negate sharpen.tif negate.tif
./localthresh -m 3 -r 25 -b 30 -n yes negate.tif thresholdLAT.tif
