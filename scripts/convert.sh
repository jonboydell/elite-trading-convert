input_file=${1}
output_dir=${2}
log_file=${3}
remove_intermediates=false

script_directory=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

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
        log "worker: crop ${input_file}";
        convert -crop 3811x2864+200+383 "${output_dir}/threshold65.tif" "${output_dir}/crop.tif"
        #log "worker: crop resample ${input_file}";
        #convert -units PixelsPerInch -resample 450 "${output_dir}/crop.tif" "${output_dir}/resample.crop.tif"
        #convert "${output_dir}/crop.tif" -gravity center -background white -extent 5000x5000 "${output_dir}/canvas.tif"

        log "worker: tesseract ${input_file}";
        if [ "${remove_intermediates}" = true ]; then
            tesseract "${output_dir}/crop.tif" --user-words "${script_directory}/eng.user-words" -l eng "${output_dir}/out";
        else
            tesseract "${output_dir}/crop.tif" --user-words "${script_directory}/eng.user-words" -l eng -c tessedit_dump_pageseg_images=true -psm 4 "${output_dir}/out";
        fi
        log "worker: complete ${input_file}";

        if [ "${remove_intermediates}" = true ]; then
            rm "${output_dir}/resample.tif"
            rm "${output_dir}/sharpen.tif"
            rm "${output_dir}/negate.tif"
            rm "${output_dir}/threshold65.tif"
            rm "${output_dir}/crop.tif"
        fi
    else
        log "worker: input file ${input_file} doesn't exist";
        exit 1;
    fi
else
    log "worker: output directory ${output_dir} doesn't exist";
    exit 1;
fi
