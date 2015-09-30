input_file=${1}
output_dir=${2}
log_file=${3}

log () {
    date_time=`date +"%Y%m%d-%H%M"`;
    message="${date_time}:${1}";
    if [ -e ${log_file} ]; then
        echo ${message} >> ${log_file};
    else
        echo ${message};
    fi
}

if [ -d ${output_dir} ]; then
    if [ -e ${input_file} ]; then
        log "worker: resampling ${input_file}";
        convert -units PixelsPerInch -resample 300 "${input_file}" "${output_dir}/resample.tif"
        log "worker: sharpening ${input_file}";
        convert -sharpen 0x3 "${output_dir}/resample.tif" "${output_dir}/sharpen.tif"
        log "worker: negating ${input_file}";
        convert -negate "${output_dir}/sharpen.tif" "${output_dir}/negate.tif"
        log "worker: threshold ${input_file}";
        convert -threshold 65% "${output_dir}/negate.tif" "${output_dir}/threshold65.tif"
        log "worker: complete ${input_file}";
    else
        log "worker: input file ${input_file} doesn't exist";
        exit 1;
    fi
else
    log "worker: output directory ${output_dir} doesn't exist";
    exit 1;
fi