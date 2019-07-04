$(function(){
    $.ajaxSetup({
        scriptCharset:'utf-8',
        cache: false
    });

    var id = window.location.href.slice(window.location.href.indexOf('?') + 1).split('=')[1];

    var getSettings = function() {
        return $.getJSON("data/item" + id + ".json");
    };

    var createItem = function(json, i) {
        var item = $('<div class="item">');

        if (json.use_icon) {
            var rank = '<span class="rank">' + (parseInt(i,10) + 1) + '</span>' + '<span class="rank_unit">位</span>'

            item.append('<p class="item_icon"><img class="rank_image" src="icon' + id + '.gif?' + json.version + '" />' + rank + '</p>');
        }
        img = '<img src="' + json.items[i].image.replace(/\?_ex=\d+x\d+/, '?_ex=' + json.item_image_size + 'x' + json.item_image_size) + '"/>';
        item.append('<div class="item_image" style="width:' + json.item_image_size + 'px;height:' + json.item_image_size + 'px;overflow:hidden;">' + img + '</div>');

        if (json.use_item_name) {
            item.append('<p class="item_name">' + json.items[i].name + '</p>');
        }

        if (json.use_item_price) {
            item.append('<p class="item_price">' + json.items[i].price + '</p>');
        }

        if (json.items[i].url !== "") {
            item.attr("onClick", "window.open('" + json.items[i].url + "', '" + json.open_window + "')").addClass("link");
        }
        return item;
    };

    var setLayout = function(json) {
        $('.item').css('width', json.item_image_size + "px");
        $('.item_image').css('width', json.item_image_size + "px");
        $('.rank').css('color', json.ranking_color).css('font-size', json.ranking_font_size + "px");
        $('.rank_unit').css('color', json.ranking_color).css('font-size', parseInt(json.ranking_font_size, 10) - 4 + "px");
        $('.rank_image').css('width', parseInt(json.item_image_size, 10) / 5 + "px").css('height', parseInt(json.item_image_size, 10) / 5 + "px");
        $('.item_name').css('color', json.item_name_color).css('width', json.item_image_size + "px").css('font-size', json.item_name_font_size + "px");
        $('.item_price').css('color', json.item_price_color).css('width', json.item_image_size + "px").css('font-size', json.item_price_font_size + "px");
    };

    var createItems = function(json) {
        $('#show_item').empty();
        for (var i in json.items) {
            var item = createItem(json, i);
            $('#show_item').append(item);
        }
        setLayout(json);
    };

    var createTileItems = function(json) {
        var item_count = Math.floor(parseInt(json.width, 10) / parseInt(json.item_image_size, 10));
        $('#show_item').empty();
        for (var i in json.items) {
            if ( (parseInt(i, 10) + 1) % item_count === 0) {
                $('#show_item').append(createItem(json, i));
                $('#show_item').append($('<div class="clearfix"></div>'));
            } else {
                $('#show_item').append(createItem(json, i));
            }
        }
        setLayout(json);
    };

    $.when(getSettings()).done(function(json) {
        if (json.items == null) {
            $("#show_item").hide();
            return;
        }

        var margin = (parseInt(json.width, 10) - parseInt(json.item_image_size, 10)) / 2;

        if (json.use_theme) {
            var $img = $('<img src="' + json.theme_image_file + '?' + json.version + '" width="' + json.width + 'px' + '" >');
            if (json.theme_link_url) {
                $img.attr("onClick","window.open('" + json.theme_link_url + "', '" + json.theme_link_open_window + "')").attr("id", "theme_link_on");
            }
            $('#show_item').before($img);
        }

        if (json.use_update_date) {
            $('#show_item').before('<p id="update_date" align = "right">' + '更新日：' + json.update_date + '</p>');
            $('#update_date').css('color', json.update_date_color).css('font-size', json.update_date_font_size + "px");
        }

        if (json.slide_mode === "variable" || json.slide_mode === "scroll" || json.slide_mode === "crossfade") {
            createItems(json);

            if (json.direction === "up" ||  json.direction === "down") {
                $('#show_item div').css('float', 'none');
                $('#show_item div').css('margin-left', margin + "px").css('margin-right', margin + "px");

                if (json.use_arrow) {
                    $("#show_item").carouFredSel({
                        direction : json.direction,
                        width : parseInt(json.width, 10),
                        height : parseInt(json.height, 10),
                        align : false,
                        items : json.items.length - 1,
                        scroll : {
                            items        : 1,
                            fx           : json.slide_mode === "variable" ? "scroll" : json.slide_mode,
                            easing       : "linear",
                            duration     : parseInt(json.slide_speed, 10),
                            pauseOnHover : "immediate"
                        },
                        prev : "#prev_updown_button",
                        next : "#next_updown_button"
                    });

                    $('#prev_updown_button > img, #next_updown_button > img').css('width', json.arrow_size + "px").css('height', json.arrow_size + "px");
                    $('#prev_updown_button, #next_updown_button').show();
                    $('a.prev_updown, a.next_updown').css('left', (parseInt(json.width, 10) - parseInt(json.arrow_size, 10)) / 2 + "px");
                } else {
                    $("#show_item").carouFredSel({
                        direction : json.direction,
                        width : parseInt(json.width, 10),
                        height : parseInt(json.height, 10),
                        align : false,
                        items : json.items.length - 1,
                        scroll : {
                            items        : 1,
                            fx           : json.slide_mode === "variable" ? "scroll" : json.slide_mode,
                            easing       : "linear",
                            duration     : parseInt(json.slide_speed, 10),
                            pauseOnHover : "immediate"
                        }
                    });
                }
            }
            else {
                $('#show_item div').css('float', 'left');

                if (json.use_arrow) {
                    $("#show_item").carouFredSel({
                        direction : json.direction,
                        width : parseInt(json.width, 10),
                        height : parseInt(json.height, 10),
                        scroll : {
                            items        : 1,
                            fx           : json.slide_mode === "variable" ? "scroll" : json.slide_mode,
                            easing       : "linear",
                            duration     : parseInt(json.slide_speed, 10),
                            pauseOnHover : "immediate"
                        },
                        prev : "#prev_button",
                        next : "#next_button"
                    });

                    $('#prev_button > img, #next_button > img').css('width', json.arrow_size + "px").css('height', json.arrow_size + "px");
                    $('#prev_button, #next_button').show();
                    $('a.prev, a.next').css('top', (parseInt(json.height, 10) - parseInt(json.arrow_size, 10)) / 2 + "px");
                } else {
                    $("#show_item").carouFredSel({
                        direction : json.direction,
                        width : parseInt(json.width, 10),
                        height : parseInt(json.height, 10),
                        scroll : {
                            items        : 1,
                            fx           : json.slide_mode === "variable" ? "scroll" : json.slide_mode,
                            easing       : "linear",
                            duration     : parseInt(json.slide_speed, 10),
                            pauseOnHover : "immediate"
                        }
                    });
                }
            }
        } else if (json.slide_mode === "fixed-updown" || json.slide_mode === "fixed-side") {
            createItems(json);

            if (json.slide_mode === "fixed-updown") {
                $('#show_item div').css('float', 'none');
                $('#show_item div').css('margin-left', margin + "px").css('margin-right', margin + "px");
            }
            else {
                $('#show_item div').css('float', 'left');
            }

            $("#show_item").carouFredSel({
                width : parseInt(json.width, 10),
                height : parseInt(json.height, 10),
                auto : {
                    play : false
                }
            });
        } else if (json.slide_mode === "fixed-tile") {
            createTileItems(json);
            $('#show_item div').css('float', 'left');
        }
        setHoverEvent();
    });

    var setHoverEvent = function () {
        $('#show_item > div.link, #theme_link_on').on('mouseover', function(){
            $(this).addClass('hover');
        }).on('mouseout', function(){
            $(this).removeClass('hover');
        });
    };
});
