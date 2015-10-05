#!/Users/jon.boydell/.nman/node/v4.1.0/bin/node
var fs = require('fs');
var commodity_list = require('./commodity_list');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});

var debug = true;
var serial = 0;

if (process.argv.length != 3) {

    console.log("Must specifiy the name of the input file or directory");

} else {

    process.argv.forEach(function (val, index, array) {
        if (index == 2) {
            input_path = val;
        }
    });

    var stations = [];

    process_directory(input_path, commodity_list);

    //console.log(stations);
}

function process_directory(input_path, commodity_list) {
    var files = fs.readdirSync(input_path);
    for (var f of files) {
        var file = input_path + "/" + f;
        var stats = fs.statSync(file);
        if (stats && stats.isDirectory()) {
            process_directory(file, commodity_list);
        } else if (stats && stats.isFile() && file.endsWith("out.txt")) {
            stations.push(process_single_file(file, commodity_list, serial++));
        }
    }
}

function process_single_file(filename, commodity_list, serial) {

    log_file.write("Processing ");
    log_file.write(filename);
    log_file.write("\n");

    var data = fs.readFileSync(filename, 'utf8');
    var strings = data.split('\n');

    var station_name = strings[0];

    log_file.write("Station name ");
    log_file.write(station_name);
    log_file.write("\n");


    var output = new Object();
    output.name = station_name;
    output.prices = [];

    strings.map(function(item) {

        var current_string = prepare_string(item);
        var matches = [];

        if (current_string.trim().length > 0 && current_string.split(" ").length > 1) {
            if (debug) { console.log ("Processing line '%s'", current_string); }

            var found = commodity_list.find(function(element, index, array) {
                var match = match_commodity(element, current_string, 80);
                if (match) {
                    matches.push(match);
                    return true;
                }
            }, current_string);

            if (found) {
                var price = new Object();
                price.name = found;

                var numbers_string = prepare_numbers(current_string.substring(found.length)).trim();
                console.log("numbers part:", numbers_string);
                if (!is_number(numbers_string[0])) {
                    if (debug) { console.log ("Problem here", found, numbers_string)}

                    log_file.write("First number isn't a number ");
                    log_file.write(found);
                    log_file.write(current_string);
                    log_file.write("\n");

                } else {
                    var numbers = [];
                    var price_string = "";

                    numbers = numbers_string.split(" ").filter(function (element, index, array) {
                        return element.trim().length > 0;
                    });

                    if (numbers.length == 3) {
                        price.sell = numbers[0];
                        price.buy = 0;
                    } else if (numbers.length == 4) {
                        price.sell = numbers[0];
                        price.buy = numbers[1];
                    } else {
                        if (debug) { console.log ("Problem here", found, numbers_string)}
                        log_file.write("Too many, or too few numbers extracted from the input ");
                        log_file.write(found);
                        log_file.write(current_string);
                        log_file.write("\n");
                    }

                    output.prices.push(price);
                }
                if (debug) { console.log(price); }
            } else {
                log_file.write("Couldn't find a match for ");
                log_file.write(current_string);
                log_file.write("\n");
            }
        }
    });

    try {
        var stats = fs.statSync(build_filename(station_name));
        var existing = JSON.parse(fs.readFileSync(build_filename(station_name), 'utf8'));
        console.log(existing.prices);
        console.log(output.prices);

        for (var price of output.prices) {
            existing.prices = existing.prices.filter(function (element, index, array) {
                if (element.name == commodity_name) {
                    return false;
                } else {
                    return true;
                }
            }, price.name);
            existing.prices.push(price);
        }
        console.log(existing.prices);
        fs.writeFileSync(build_filename(station_name), JSON.stringify(existing));
    } catch (err) {
        fs.writeFileSync(build_filename(station_name), JSON.stringify(output));
    }

    return station_name;
}

function build_filename(station_name) {
    var date = new Date();
    var file_name = "market/" + station_name.replace(' ', '_').replace('\'', '').toLowerCase() + ".json";
    return file_name;
}

function isNumberPart(chr) {
    var r = /[0-9,.]/g;
    var s = r.exec(chr);
    if (s) {
        return s;
    }
    return undefined;
}

function is_number(chr) {
    if (chr.length == 0) {
        return false;
    }
    var r = /[0-9]/g;
    var s = r.exec(chr);
    if (s) {
        return s;
    }
    return undefined;
}

function first_number(str) {
    return str[0].search(/[0-9]/g);
}

function last_letter(str) {
    str = str.trim();
    if (str.endsWith("CR")) {
        str = str.substring(0, str.length-2);
    }
    for (var s of str) {
        console.log(s, s.search(/[a-zA-Z ]/g));
    }
    return str.length;
}

function match_commodity(commodity_name_str, raw_data_str, confidence_factor) {
    var commodity_name = commodity_name_str.trim().toUpperCase();
    var raw_data = raw_data_str.trim().toUpperCase();
    if (commodity_name == raw_data) { return 100; }
    var matches = 0;
    for (var i = 0; i < commodity_name.length; i++) {
        if (commodity_name[i] == raw_data_str[i]) {
            matches++;
        }
    }
    var confidence = (matches / commodity_name.length) * 100;
    if (confidence > confidence_factor) {
        console.log("matching: %s %s% '%s'", commodity_name_str, confidence, raw_data_str);
        return confidence;
    }
    return undefined;
}

function prepare_string(str) {
    var retVal = str.replace('‘','')
        .replace('\'', '')
        .toUpperCase()
        .trim();

    if (retVal.endsWith("CR")) {
        return retVal.substring(0, retVal.length-2).trim();
    }
    return retVal.trim();
}

function prepare_numbers(str) {
    return str.toUpperCase()
        .replace('HIGH', '')
        .replace('LOW', '')
        .replace('MED', '')
        .replace('MEO', '')
        .replace(/O/g, '0')
        .replace(/G/g, '6')
        .replace(/B/g, '8')
        .replace(/\./g, '')
        .replace(/,/g, '')
        .replace(/-/g, '');
}

function equal_string(a, b) {
    return a.toUpperCase().trim() == b.toUpperCase().trim();
}
