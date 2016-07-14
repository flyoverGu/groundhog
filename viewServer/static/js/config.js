$.getJSON('http://127.0.0.1:8887/getRule', null, function(data) {
    console.log(data);
    renderHtml(data);
});

var ID = '';
try {
    ID = location.search.match(/\?id=(\S*)/)[1];
} catch (e) {}

$('form').on('click', '.set-rule', function() {
    var data = {
        name: $('#name').val(),
        status: $('.status').prop('checked'),
        root: $('#rootPath').val(),
        rule: {
            string: $('#ruleStr').val(),
        },
        mock: {
            path: $('#mockPath').val(),
        }
    }
    if (ID) {
        data.id = ID;
    }
    $.ajax({
        contentType: 'application/json; charset=UTF-8',
        url: 'http://127.0.0.1:8887/setRule',
        data: JSON.stringify(data),
        type: 'POST',
        success: function() {
            $('.set-success').show();
            location.reload();
        }
    })
    return false;
}).on('click', '.del-rule', function() {
    $.getJSON('http://127.0.0.1:8887/delRule', {
        id: ID
    }, function() {
        location.href = '/config.html';
    });
});

var renderHtml = function(data) {
    var list = [];
    for (var id in data) {
        list.push(data[id]);
    }

    // render list 
    if (list.length) {
        var html = list.map(function(item) {
            if (item.id == ID) item.className = "active";
            if (item.status) item.statusText = "已启动";
            else item.statusText = "未启动";
            return tpl('rule-item', item);
        }).join('');
        $('.rule-list').prepend(html);
    }

    // render detail
    var rd = data[ID] || {
        mock: {},
        rule: {}
    };
    var html = tpl('rule-detail', {
        root: rd.root || '',
        name: rd.name || '',
        mock: rd.mock.path || '',
        ruleStr: rd.rule.string || '',
        btnText: rd.id ? '更新' : '新建',
        checked: rd.id ? (rd.status ? 'checked' : '') : 'checked'
    });
    $('form').html(html);

}

var tpl = function(id, data) {
    var template = $('#' + id + '').html();
    var html = template.replace(/{{([^}]+)}}/g, function(a, b) {
        return data[b.trim()];
    });
    return html;
}
