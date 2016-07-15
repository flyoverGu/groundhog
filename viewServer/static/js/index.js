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
        data.statusCode = '代理成功'
    } else if (data.res.statusCode == 1500) {
        data.statusCode = '代理失败'
    } else {
        data.statusCode = data.res.statusCode;
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
    var proxyStr = JSON.stringify(data.proxy);
    var headerStr = JSON.stringify(data.headers);
    $('.proxy-view').text(proxyStr);
    $('.header-view').text(headerStr);
    if (data.headers && data.headers['content-type'] && ~data.headers['content-type'].indexOf('image')) {
        renderImg(data);
    } else {
        var bodyStr = JSON.stringify(data.body);
        $('.body-view').text(bodyStr);
    }
}

var renderImg = function(data) {
    var type = data.headers['content-type'];
    var url = 'data:' + type + ';base64,' + data.body;
    $('.body-view').html('<img src="' + url + '">');
}
