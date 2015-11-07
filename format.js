var p = [],
  push = function(m) {
    return '\\' + p.push(m) + '\\';
  },
  pop = function(m, i) {
    return p[i - 1]
  },
  tabs = function(count) {
    return new Array(count + 1).join('\t');
  };

var JSONFormat = function(json) {
    p = [];
    var out = "",
      indent = 0;

    // Extract backslashes and strings
    json = json
      .replace(/\\./g, push)
      .replace(/(".*?"|'.*?')/g, push)
      .replace(/\s+/, '');

    // Indent and insert newlines
    for (var i = 0; i < json.length; i++) {
      var c = json.charAt(i);

      switch (c) {
        case '{':
        case '[':
          out += c + "\n" + tabs(++indent);
          break;
        case '}':
        case ']':
          out += "\n" + tabs(--indent) + c;
          break;
        case ',':
          out += ",\n" + tabs(indent);
          break;
        case ':':
          out += ": ";
          break;
        default:
          out += c;
          break;
      }
    }

    out = out
      .replace(/\[[\d,\s]+?\]/g, function(m) {
        return m.replace(/\s/g, '');
      })
      .replace(/\\(\d+)\\/g, pop) // strings
      .replace(/\\(\d+)\\/g, pop); // backslashes in strings

    return out;
};

module.exports = JSONFormat;


