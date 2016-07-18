var primus = new Primus('http://127.0.0.1:8887');

var logData = {};
var filter = localStorage.filter || "";

primus.on('data', function(data) {
    console.log(data);
    logData[data.id] = data;
    if (~data.url.indexOf(filter)) {
        renderItem(data);
    }
});

var count = 1;
var renderItem = function(data) {
    var template = $('#t-item').html();
    data.order = count++;
    if (data.res.statusCode == 1200) {
        data.statusCode = '代理成功';
        data.className = 'table-success';
    } else if (data.res.statusCode == 1500) {
        data.statusCode = '代理失败'
        data.className = 'table-danger';
    } else if (data.method == 'CONNECT') {
        data.statusCode = 'https';
    } else {
        data.statusCode = data.res.statusCode;
        if (/^[45][0-9]{2}$/.test(data.res.statusCode)) {
            data.className = 'table-danger';
        } else if (/^[2][0-9]{2}$/.test(data.res.statusCode)) {
            data.className = 'table-info';
        }
    }
    var html = template.replace(/{{([^}]+)}}/g, function(a, b) {
        return data[b.trim()];
    });
    $('#item').append(html);
}

$('#item').on('click', 'tr', function(e) {
    var id = $(e.currentTarget).data('id');
    renderDetail(logData[id]);
});

$('.clean-log').on('click', function() {
    $('#item').html('');
    logData = {};
});

$('.filter').on('keyup', function() {
    filter = $('.filter').val();
    localStorage.filter = filter;
}).val(filter);

var renderDetail = function(data) {
    renderJSON($('#request .header'), data.req.headers);
    renderBody($('#request .body'), data.req);

    renderJSON($('#response .header'), data.res.headers);
    renderBody($('#response .body'), data.res);

    renderJSON($('#proxy-rule pre'), data.res.proxy);
}

var isContentType = function(headers, ct) {
    if (headers && headers['content-type'] && ~headers['content-type'].indexOf(ct)) {
        return true;
    } else return false;
}

var renderBody = function($el, data) {
    if (isContentType(data.headers, 'image')) {
        renderImg($el, data);
    } else if (isContentType(data.headers, 'html') || !data.headers || isContentType(data.headers, 'xml')) {
        $el.text(data.body);
    } else {
        renderJSON($el, data.body);
    }
}

var renderJSON = function($el, json) {
    try {
        json = JSON.stringify(JSON.parse(json), null, 2);
    } catch (e) {}
    $el.html(syntaxHighlight(json));
}

var renderImg = function($el, data) {
    if (data.statusCode == 304) {
        $el.html('');
    } else {
        var type = data.headers['content-type'];
        var url = 'data:' + type + ';base64,' + data.body;
        $el.html('<img src="' + url + '">');
    }
}

function syntaxHighlight(json) {
    if (!json) return "";
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
