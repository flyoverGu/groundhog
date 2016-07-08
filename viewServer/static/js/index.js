var primus = new Primus('http://127.0.0.1:8887');

var logData = {};

primus.on('data', function(data) {
    console.log(data);
    logData[data.id] = data;
    renderItem(data);
});

var count = 1;
var renderItem = function(data) {
    var template = $('#t-item').html();
    data.order = count++;
    data.statusCode = data.res.statusCode;
    var html = template.replace(/{{([^}]+)}}/g, function(a, b) {
        return data[b.trim()];
    });
    $('#item').append(html);
}

