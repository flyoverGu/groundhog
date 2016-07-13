$.getJSON('http://127.0.0.1:8887/getRule', null, function(data) {
    console.log(data);
    $('#rootPath').val(data.root);
    $('#mockPath').val(data.mock.path);
    $('#ruleStr').val(data.rule.string);
});

$('.btn').on('click', function() {
    var data = {
        root: $('#rootPath').val(),
        rule: {
            string: $('#ruleStr').val(),
            status: true
        },
        mock: {
            path: $('#mockPath').val(),
            status: true
        }
    }
    $.ajax({
        contentType: 'application/json; charset=UTF-8',
        url: 'http://127.0.0.1:8887/setRule',
        data: JSON.stringify(data),
        type: 'POST',
        success: function() {
            $('.set-success').show();
        }
    })
    return false;
});
