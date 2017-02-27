//模板引擎
var Template = function (tpl) {
    var me = this;
    me.tpl = tpl;
};

Template.prototype.compile = function () {
    var me = this;
    
    var escapes = {
      "'":      "'",
      '\\':     '\\',
      '\r':     'r',
      '\n':     'n',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
    };

    var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

    var escapeChar = function(match) {
      return '\\' + escapes[match];
    };

    var text = me.tpl;

    var templateSettings = {
      evaluate    : /<#([\s\S]+?)#>/g,
      interpolate : /<#=([\s\S]+?)#>/g
    };

    var matcher = /<#-([\s\S]+?)#>|<#=([\s\S]+?)#>|<#([\s\S]+?)#>|$/g

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    var render = new Function("obj", source);

    var template = function(data) {
      return render.call(this, data);
    };

    me.compiledTplFun = template;
};

Template.prototype.apply = function (context) {
    var me = this;

    if (!me.compiledTplFun) {
        me.compile();                   
    }

    return me.compiledTplFun(context);
};


//格式化数值
function formatNumber(nData, opts) {
    opts = $.extend({},
    {
        decimalSeparator: ".",
        thousandsSeparator: ",",
        decimalPlaces: 0,
        round: false,
        prefix: "",
        suffix: "",
        defaulValue: 0
    }, opts);
    if (!(typeof (nData) === 'number' && isFinite(nData))) {
        nData *= 1;
    }
    if (typeof (nData) === 'number' && isFinite(nData)) {
        var bNegative = (nData < 0);
        nData = Math.abs(nData);
        var sOutput = nData + "";
        var sDecimalSeparator = (opts.decimalSeparator) ? opts.decimalSeparator : ".";
        var nDotIndex;
        if (typeof (opts.decimalPlaces) === 'number' && isFinite(opts.decimalPlaces)) {
            // Round to the correct decimal place
            var nDecimal, nDecimalPlaces = opts.decimalPlaces;
            if (opts.round) {
                nDecimal = Math.pow(10, nDecimalPlaces);
                sOutput = Math.round(nData * nDecimal) / nDecimal + "";
            } else {
                nDecimal = Math.pow(10, (nDecimalPlaces + 3));
                sOutput = Math.floor(Math.round(nData * nDecimal) / 1000) / (nDecimal / 1000) + "";
            }
            nDotIndex = sOutput.lastIndexOf(".");
            if (nDecimalPlaces > 0) {
                // Add the decimal separator
                if (nDotIndex < 0) {
                    sOutput += sDecimalSeparator;
                    nDotIndex = sOutput.length - 1;
                }
                    // Replace the "."
                else if (sDecimalSeparator !== ".") {
                    sOutput = sOutput.replace(".", sDecimalSeparator);
                }
                // Add missing zeros
                while ((sOutput.length - 1 - nDotIndex) < nDecimalPlaces) {
                    sOutput += "0";
                }
            }
        }
        if (opts.thousandsSeparator) {
            var sThousandsSeparator = opts.thousandsSeparator;
            nDotIndex = sOutput.lastIndexOf(sDecimalSeparator);
            nDotIndex = (nDotIndex > -1) ? nDotIndex : sOutput.length;
            var sNewOutput = sOutput.substring(nDotIndex);
            var nCount = -1;
            for (var i = nDotIndex; i > 0; i--) {
                nCount++;
                if ((nCount % 3 === 0) && (i !== nDotIndex) && (!bNegative || (i > 1))) {
                    sNewOutput = sThousandsSeparator + sNewOutput;
                }
                sNewOutput = sOutput.charAt(i - 1) + sNewOutput;
            }
            sOutput = sNewOutput;
        }
        // Prepend prefix
        sOutput = (opts.prefix) ? opts.prefix + sOutput : sOutput;
        // Append suffix
        sOutput = (opts.suffix) ? sOutput + opts.suffix : sOutput;
        return (bNegative ? '-' : '') + sOutput;
    } else {
        return opts.defaulValue;
    }
}

//格式化金额
function formatCurrency(num, opts, length) {
    if (typeof (length) != "number") length = 2;
    opts = $.extend({},
    {
        decimalSeparator: ".",
        thousandsSeparator: ",",
        decimalPlaces: length,
        round: false,
        prefix: "",
        suffix: "",
        defaulValue: 0
    }, opts);
    return formatNumber(num, opts);
}