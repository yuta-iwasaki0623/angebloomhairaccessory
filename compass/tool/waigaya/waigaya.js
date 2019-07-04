$(function(){
    $.ajaxSetup({
        scriptCharset:'utf-8',
        cache: false
    });

    var week  = new Array( " (日) ", " (月) ", " (火) ", " (水) ", " (木) ", " (金) ", " (土) " );
    var json  = {};
    var items = [];
    var total = 0;
    var now   = new Date();
    var $waigaya = $('#waigaya');
    var $time = $('#time');

    var getSettings = function() {
        return $.getJSON($('#json_name').val());
    };

    var clock = function() {
        return function() {
            var now = new Date();
            var date = now.getFullYear() +  "/" + ("0"+(now.getMonth() + 1)).slice(-2) + "/" + ("0"+now.getDate()).slice(-2) + week[now.getDay()];
            var time = ("0"+now.getHours()).slice(-2) + ":" + ("0"+now.getMinutes()).slice(-2) + ":" + ("0"+now.getSeconds()).slice(-2);
            var content = date + time;
            $time.empty().append(content);
        };
    };

    var auto_scroll = function() {
        return function() {
            var index = Math.floor(Math.random()*total);
            var new_item = $(items[index]).css({
                height  : 0,
                opacity : 0
            });

            new_item.find('img, span').css({
                opacity : 0
            });

            $waigaya.prepend(new_item);

            new_item.animate({
                height : json.item_height
            }, 1000,
            function(){
                $(this).animate({'opacity' : 1}, 900).dequeue();
                $(this).find('span').animate({'opacity' : 1}, 900).dequeue();
                $(this).find('img').animate({'opacity' : 1}, 300).dequeue();
            });

            $waigaya.find('div:gt(30)').remove();
        };
    };

    var isShow = function(item, item_class) {
        var from = item.match(/data-from=\'([0-9\/ :]*?)\'/)[1];
        var to   = item.match(/data-to=\'([0-9\/ :]*?)\'/)[1];

        var from_time, to_time;
        if (from.length == 0 && to.length == 0) {
            return true;
        } else if (from.length > 0  && to.length == 0) {
            from_time = new Date(from);
            if (now - from_time > 0) {
                return true;
            } else {
                return false;
            }
        } else if (from.length == 0 && to.length > 0) {
            to_time = new Date(to);
            if (to_time - now > 0) {
                return true;
            } else {
                return false;
            }
        } else if (from.length > 0 && to.length > 0) {
            from_time = new Date(from);
            to_time   = new Date(to);
            if (now - from_time > 0 && to_time - now > 0) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    };

    var show = function(data) {
        var limit = parseInt(json.limit, 10);

        for (var i in data.items) {
            var item = data.items[i];
            if (item === null) {
                continue;
            }
            var item_class = item.match(/^<div class='([a-z_]+)/)[1];
            if (isShow(item, item_class)) {
                $waigaya.append(item);
                items.push(item);
            }
        }

        $waigaya.animate({
            opacity: 1
        }, 1000);

        total = items.length;
        setInterval(auto_scroll(), 3500);

    };

    $.when(getSettings()).done(function(data){
        json = data;
        $waigaya.before('<div id="waigaya_header" ><img src="' + json.header + '?' + json.version + '" ></div>');
        $waigaya.css('opacity', '0').css('color', json.font_color).css('width', json.width + 'px');
        $time.css('color', json.clock_color);
        setInterval(clock(), 1000);

        $.getJSON(json.json_path, function(data) {
            show(data);
        });
    });

    $waigaya.on('mouseover', 'div', function(){
        if (!$(this).hasClass('nolink') && parseInt($(this).css('opacity'), 10) === 1) {
            $(this).css('opacity', '').addClass('hover');
            $(this).find('.label').attr("src", "label_" + json.type + ".gif?" + json.version).css("left", json.label_position).show();
        }
    }).on('mouseout', 'div', function(){
        if (!$(this).hasClass('nolink')) {
            $(this).css('cursor','').removeClass('hover');
            $(this).find('.label').hide();
        }
    });
});
