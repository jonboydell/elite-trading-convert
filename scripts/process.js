#!/Users/jon.boydell/.nman/node/v4.1.0/bin/node
var fs = require('fs');
var commodity_list = require('./commodity_list');

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        input_path = val;
    }
});

var serial = 0;
var stations = [];

process_directory(input_path, commodity_list);

console.log(stations);

function process_directory(input_path, commodity_list) {
    var files = fs.readdirSync(input_path);
    for (var f of files) {
        var file = input_path + "/" + f;
        var stats = fs.statSync(file);
        if (stats && stats.isDirectory()) {
            process_directory(file, commodity_list);
        } else if (stats && stats.isFile() && file.endsWith("out.txt")) {
            stations.push(process_single_file(file, commodity_list));
        }
    }
}

function process_single_file(filename, commodity_list, serial) {
    var data = fs.readFileSync(filename, 'utf8');

    var output = new Object();
    var strings = data.split('\n');

    var station_name = strings[0];
    console.log(station_name);
    output.name = station_name;
    output.prices = [];

    strings.map(function(item) {

        var itemx = prepString(item);
        var o = firstNumber(itemx);
        var commodity_name = itemx.substring(0, o).trim();

        if (commodity_name.length > 0) {

            var found = commodity_list.find(function(element, index, array) {
                if (element.trim().toLowerCase() == commodity_name.trim().toLowerCase()) {
                    return true;
                }
                return false;
            }, commodity_name);

            if (!found) {
                found = commodity_list.find(function(element, index, array) {
                    var matches = 0;
                    for (var i = 0; i < commodity_name.length; i++) {
                        if (element[i] == commodity_name[i]) {
                            matches++;
                        }
                    }
                    if ((matches / commodity_name.length) * 100 > 70) {
                        console.log((matches / commodity_name.length) * 100);
                        return true;
                    }
                    return false;
                }, commodity_name);
            }

            if (found) {
                var price = new Object();
                price.name = found;

                console.log("matched", found, commodity_name);
                if (o > -1 && commodity_name.length > 0) {

                    var numbers = itemx.substring(firstNumber(itemx)).toUpperCase();
                    numbers = numbers.replace(/O/g, '0');
                    numbers = numbers.replace(/\./g, '');
                    numbers = numbers.replace(/,/g, '');
                    numbers = numbers.replace(/-/g, '');

                    var t = [];
                    var p = '';
                    for (var x of numbers) {
                        if (isNumber(x)) {
                            p = p + x;
                        } else {
                            if (p.length > 0) {
                                t.push(p);
                            }
                            p = '';
                        }
                    }
                    if (t.length == 3) {
                        price.sell = t[0];
                        price.buy = 0;
                    } else if (t.length == 4) {
                        price.sell = t[0];
                        price.buy = t[1];
                    }
                    output.prices.push(price);
                }
            } else {
                console.log("can't find match for ", commodity_name);
            }
        }
    });

    try {
        var stats = fs.statSync(build_filename(station_name));
        var existing = JSON.parse(fs.readFileSync(build_filename(station_name), 'utf8'));
        console.log(existing.prices);
        console.log(output.prices);

        for (var o of output.prices) {
            var commodity_name = o.name;
            existing.prices = existing.prices.filter(function (element, index, array) {
                if (element.name == commodity_name) {
                    return false;
                } else {
                    return true;
                }
            }, commodity_name);
            existing.prices.push(o);
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

//function build_filename(station_name, serial) {
//    var date = new Date();
//    var file_name = "market/" + serial + "_" + station_name.replace(' ', '_').replace('\'', '').toLowerCase() + ".json";
//    return file_name;
//}

function isNumberPart(chr) {
    var r = /[0-9,.]/g;
    var s = r.exec(chr);
    if (s) {
        return s;
    }
    return undefined;
}

function isNumber(chr) {
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

function firstNumber(str) {
    return str.search(/[0-9]/g);
}

function prepString(str) {
    var s = str.replace('‘','').toUpperCase();
    str = str.replace('\'', '');
    str = str.replace('HIGH', '');
    str = str.replace('LOW', '');
    str = str.replace('MED', '');
    return str;
}
