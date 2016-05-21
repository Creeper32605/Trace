/* Copyright 2016 © Jonatan Nordentoft // MIT License
Requires jDataView.js 
Modified for Trace
*/

define([ 'jDataView.js' ], function(jDataView) {
/**
 * Count bytes in a string's UTF-8 representation.
 * http://codereview.stackexchange.com/a/37552
 *
 * @param   string
 * @return  int
 */
function getByteLen(normal_val) {
    // Force string type
    normal_val = String(normal_val);

    var byteLen = 0;
    for (var i = 0; i < normal_val.length; i++) {
        var c = normal_val.charCodeAt(i);
        byteLen += c < (1 <<  7) ? 1 :
                   c < (1 << 11) ? 2 :
                   c < (1 << 16) ? 3 :
                   c < (1 << 21) ? 4 :
                   c < (1 << 26) ? 5 :
                   c < (1 << 31) ? 6 : Number.NaN;
    }
    return byteLen;
}


/*
    Types:
    lstr    string with length specifier
    str     string of given length
    uint    unsigned integer
    int     signed integer
    lbytes  raw bytes with length specifier
    bytes   raw bytes of given length
    float   float
*/

var BinaryTools = {
    builder: function(recipe, data) {
        var totalLength = 0;

        for (var i in recipe) {
            var el = recipe[i];
            var length = el.length;
            var type = el.type;

            var value = data[i];

            totalLength += length;
            if (type === 'lstr')
                totalLength += getByteLen(value);
            else if (type === 'lbytes')
                totalLength += data.byteLength;
        }


        var dv = new jDataView(new ArrayBuffer(totalLength));

        for (var i in recipe) {
            var el = recipe[i];
            var length = el.length;
            var type = el.type;

            var value = data[i];

            switch (type) {
                case "lstr":
                    dv["writeUint" + (length * 8)](getByteLen(value));
                    dv.writeString(value, el.encoding);
                    break;
                case "str":
                    if (value == null)
                        value = "";
                    if (value.length < length)
                        value += "\0".repeat(length - value.length);
                    dv.writeString(value, el.encoding);
                    break;
                case "uint":
                    dv["writeUint" + (length * 8)](value);
                    break;
                case "int":
                    dv["writeInt" + (length * 8)](value);
                    break;
                case "lbytes":
                    dv["writeUint" + (length * 8)](value.byteLength);
                    dv.writeBytes(value);
                    break;
                case "bytes":
                    dv.writeBytes(value); // TODO: Pad
                    break;
                case "float":
                    dv["writeFloat" + (length * 8)](value);
                    break;
            }
        }

        return dv;
    },
    reader: function(recipe, binary, offset) {
        var pos = offset || 0;
        var data = {};

        for(var i in recipe) {
            var el = recipe[i];
            var length = el.length;
            var type = el.type;
            var name = el.name;

            switch (type) {
                case "lstr":
                    var stringLength = binary["getUint" + (length * 8)](pos);
                    data[name] = binary.getString(stringLength, pos + length, el.encoding);
                    pos += stringLength;
                    break;
                case "str":
                    data[name] = binary.getString(length, pos, el.encoding);
                    break;
                case "uint":
                    data[name] = binary["getUint" + (length * 8)](pos);
                    break;
                case "int":
                    data[name] = binary["getInt" + (length * 8)](pos);
                    break;
                case "lbytes":
                    var byteLength = binary["getUint" + (length * 8)](pos);
                    data[name] = binary.getBytes(byteLength, pos + length);
                    pos += byteLength;
                    break;
                case "bytes":
                    data[name] = binary.getBytes(length, pos);
                    break;
                case "float":
                    data[name] = binary["getFloat" + (length * 8)](pos);
                    break;
                case "remaining":
                    data[name] = binary.getString(binary.byteLength - pos, pos);
                    length = binary.byteLength - pos;
                    break;
            }

            pos += length;
        }

        data._length = pos - (offset || 0);

        return data;
    },
    hexToArray: function(hex) {
        var arr = new Uint8Array(Math.ceil(hex.length / 2));

        var i = 0;
        var j = 0;

        // Check if malformed hex string
        if (hex.length & 1) {
            i++;
            arr[j++] = parseInt(hex[0], 16);
        }

        for (; i < hex.length; i += 2) {
            arr[j++] = parseInt(hex[i] + hex[i + 1], 16);
        }

        return arr;
    },
    arrayToHex: function(arr) {
        var hex = '';

        for (var i = 0; i < arr.length; i++) {
            var bit = arr[i].toString(16)
            if (bit.length == 1)
                bit = "0" + bit;

            hex += bit;
        }

        return hex;
    }
};

return BinaryTools;

});