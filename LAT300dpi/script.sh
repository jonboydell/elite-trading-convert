input_file=${1}
output_dir=${2}

if [ -d ${output_dir} ]; then

    if [ -e ${input_file} ]; then
        convert -units PixelsPerInch -resample 300 "${input_file}" "${output_dir}/resample.tif"
        convert -sharpen 0x3 "${output_dir}/resample.tif" "${output_dir}/sharpen.tif"
        convert -negate "${output_dir}/sharpen.tif" "${output_dir}/negate.tif"
    else
        echo "input file ${input_file} doesn't exist";
        exit(1);
    fi

else
    echo "output directory ${output_dir} doesn't exist";
    exit(1);
fi
