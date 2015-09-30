if [ -z "${1}" ]; then
    echo "must specify an input directory";
    exit 1;
fi

if [ -z "${2}" ]; then
    echo "must specify a processing directory";
    exit 1;
fi

log () {
    date_time=`date +"%Y%m%d-%H%M"`;
    message="${date_time}:${1}";
    if [ -e ${log_file} ]; then
        echo ${message} >> ${log_file};
    else
        echo ${message};
    fi
}

input_directory="${1}"
processing_directory="${2}"

log_file=batch_convert.log
if [ -e ${log_file} ]; then
    rm ${log_file};
fi
touch ${log_file}

pwd=`pwd`

if [ ! -d "${input_directory}" ]; then
    log "processor: fatal: directory ${input_directory} must exist";
    exit 1;
fi

if [ ! -d "${processing_directory}" ]; then
    log "processor: processing directory ${processing_directory} doesn't exist, creating it";
    mkdir ${processing_directory};
fi

log "processor: watching directory ${input_directory}";

while true; do
    find . | grep "${input_directory}" | grep bmp | while read f
    do
        if [ -e "${f}" ]; then
            filename=$(basename "${f}");
            file="${filename%%.*}";
            #echo "f:${pwd}/${f}";
            #echo "filename:${filename}";
            #echo "file:${file}";
            fq_filename="${pwd}/${f}";
            #echo "fq_filename:${fq_filename}";
            #echo "processing_directory:${processing_directory}";
            date_time=`date +"%Y%m%d-%H%M"`;

            working_directory="${processing_directory}/${date_time}${file}";

            if [ ! -d "${working_directory}" ]; then
                log "processor: working directory ${working_directory} doesn't exist, creating it";
                mkdir ${working_directory};
            fi

            log "processor: moving file ${f} to ${working_directory}"
            mv "${f}" "${working_directory}"
            log "processor: starting conversion for ${f}"
            ./convert/scripts/convert.sh "${working_directory}/${filename}" "${working_directory}" ${log_file} &
        fi
    done

done
