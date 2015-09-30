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

must_exist() {
    if [ ! -d "${1}" ]; then
        log "processor: fatal: directory ${1} must exist";
        exit 1;
    fi
}

should_exist() {
    if [ ! -d "${1}" ]; then
        log "processor: warning: directory ${1} doesn't exist, creating it";
        mkdir "${1}";
    fi
}

script_directory=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
input_directory="${1}"
processing_directory="${2}"

log_file=batch_convert.log
if [ -e ${log_file} ]; then
    rm ${log_file};
fi
touch ${log_file}

pwd=`pwd`

must_exist "${input_directory}"
should_exist "${processing_directory}"

log "processor: watching directory ${input_directory}";

while true; do
    find . | grep "${input_directory}" | grep bmp | while read f
    do
        if [ -e "${f}" ]; then
            date_time=`date +"%Y%m%d-%H%M"`;

            filename=$(basename "${f}");
            file="${filename%%.*}";
            #echo "f:${pwd}/${f}";
            #echo "filename:${filename}";
            #echo "file:${file}";
            fq_filename="${pwd}/${f}";
            #echo "fq_filename:${fq_filename}";
            #echo "processing_directory:${processing_directory}";

            working_directory="${processing_directory}/${date_time}${file}";
            should_exist "${working_directory}"

            log "processor: moving file ${f} to ${working_directory}"
            mv "${f}" "${working_directory}"

            log "processor: starting conversion for ${f}"
            "${script_directory}/convert.sh" "${working_directory}/${filename}" "${working_directory}" ${log_file} &
        fi
    done

done
