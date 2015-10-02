#!/Users/jon.boydell/.nman/node/v4.1.0/bin/node
var fs = require('fs');
var filename = '/Users/jon.boydell/Pictures/Frontier Developments/processing/20151001-1201Screenshot_0032/out.txt';

var goods = ['BERTRANDITE', 'INDITE', 'COLTAN'];

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

fs.readFile(filename, 'utf8', function(err, data) {
    var strings = data.split('\n');

    var station_name = strings[0];
    console.log(station_name);

    strings.map(function(item) {
        //some of this lot should be removed from

        var itemx = item.replace('‘','');
        itemx = itemx.replace('\'', '');
        itemx = itemx.replace('HIGH', '');
        itemx = itemx.replace('LOW', '');
        itemx = itemx.replace('MED', '');
        itemx = itemx.replace('CR', '');

        console.log("removed odd chars:" + itemx);

        var o = firstNumber(itemx);

        if (o > -1) {
            var numbers = itemx.substring(firstNumber(itemx)).toUpperCase();
            numbers = numbers.replace(/0/g, '0');
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
            console.log(t);
        }
    });
});
