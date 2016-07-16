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

$('#item').on('click', '.look-req', function(e) {
    var id = $(e.target).data('id');
    renderDetail(logData[id].req);
}).on('click', '.look-res', function(e) {
    var id = $(e.target).data('id');
    renderDetail(logData[id].res);
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
    $('.proxy-view').html(syntaxHighlight(data.proxy));
    $('.header-view').html(syntaxHighlight(data.headers));
    if (data.headers && data.headers['content-type'] && ~data.headers['content-type'].indexOf('image')) {
        renderImg(data);
    } else if (data.headers && data.headers['content-type'] && ~data.headers['content-type'].indexOf('html')) {
        var bodyStr = JSON.stringify(data.body);
        $('.body-view').text(bodyStr);
    } else {
        var bodyStr = JSON.stringify(data.body);
        $('.body-view').html(syntaxHighlight(bodyStr));
    }
}

var renderImg = function(data) {
    var type = data.headers['content-type'];
    var url = 'data:' + type + ';base64,' + data.body;
    $('.body-view').html('<img src="' + url + '">');
}

function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    if (!json) return '';
    json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
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
