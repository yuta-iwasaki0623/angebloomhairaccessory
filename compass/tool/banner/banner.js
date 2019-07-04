$(function(){
    $.ajaxSetup({
        scriptCharset : 'utf-8',
        cache         : false
    });

    var mini = false;

    var getSettings = function() {
        var type = window.location.href.slice(window.location.href.indexOf('?') + 1).split('=')[1];
        if (type === "mini") {
            mini = true;
        }
        return $.getJSON("https://data.compass-next.com/tool/banner/banner.json?1554796401");
    };

    var getServerTime = function() {
        return $.ajax({
            type: 'GET',
            url: 'time.html'
        });
    };

    var isShow = function(banner, now) {
        if (banner.duration === "all") {
            return true;
        } else if (banner.duration === "hide") {
            return false;
        } else if (banner.duration === "select_term") {
            var from = banner.from;
            var to   = banner.to;

            var from_time, to_time;
            if (from.length > 0  && to.length == 0) {
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
        } else if (banner.duration === "select_day") {
            for (var i in banner.days) {
                if (banner.days[i] == now.getDay()) {
                    return true;
                }
            }
        } else if (banner.duration === "select_month_day") {
            if (banner.month_day == now.getDate()) {
                return true;
            }
        }
        return false;
    }

    $.when(getServerTime()).done(function(data, status, xhr) {
        var now = new Date(xhr.getResponseHeader('Date'));
        $.when(getSettings()).done(function(args) {
            var data = args;

            var point = 1;
            var display_banner_count = 0;
            for (var i in data.banners) {
                var banner = data.banners[i];
                if (isShow(banner, now)) {
                    if (banner.only_point !== "checked") {
                        var $li = $('<li>');
                        var $a;
                        if (banner.url === "") {
                            $a = $('<a>').addClass("banner_url");
                        } else {
                            $a = $('<a>').attr("target", banner.open_window).attr("href", banner.url).addClass("banner_url");
                        }
                        var $img = $('<img>').attr("src", banner.image);
                        $("#display_banners ul").append($li.append($a.append($img)));
                        display_banner_count = display_banner_count + 1;
                    }

                    var banner_point = parseInt(banner.point, 10);
                    point = point + (banner_point > 0 ? banner_point - 1 : 0);
                }
            }

            if (mini) {
                var mini_height = parseInt(data.banner_height, 10) * (parseInt(data.mini_width, 10) / parseInt(data.banner_width, 10));
                $("#display_banners li").css("width", data.mini_width + "px").css("height", mini_height + "px");
                $("a.banner_url img").css("width", data.mini_width + "px").css("height", mini_height + "px");
            } else {
                $("#display_banners li").css("width", data.banner_width + "px").css("height", data.banner_height + "px");
                $("a.banner_url img").css("width", data.banner_width + "px").css("height", data.banner_height + "px");
            }

            $("#display_banners").easySlider({
                prevText: '<',
                nextText: '>',
                continuous: true,
                auto: data.auto_slide === "on" && display_banner_count > 1 ? true : false,
                pause: parseInt(data.slide_speed, 10)
            });

            $("#display_banners").css('background-color', '#ffffff');
            $("#prevBtn a, #nextBtn a").css('background-color', data.btn_color);

            if (data.use_theme === "checked" && !mini) {
                $('#header').append('<img src="' + data.theme_image_file + '?' + data.version + '">').show();
            }

            if (data.display_point === "checked") {
                var content = data.head_point + '<strong>' + point + '</strong>' + data.tail_point;
                $("#display_banners").after('<span class="banner_point">' + content + '</span>');
                $(".banner_point").css("color", data.character_font_color).css("font-size", data.character_font_size + "px");
                $(".banner_point strong").css("color", data.point_font_color).css("font-size", data.point_font_size + "px");
            }
        })
        .fail(function(e) {
          console.log('error');
          console.log(e);
        });
    });

    $('#display_banners').on('mouseover', 'li', function() {
        $(this).addClass('hover');
    }).on('mouseout', 'li', function() {
        $(this).removeClass('hover');
    });
});
