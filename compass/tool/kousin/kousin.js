$(function(){
    $.ajaxSetup({
        scriptCharset:'utf-8',
        cache: false
    });

    var getPublicHoliday = function(holidayUrl) {
        var url = holidayUrl;
        var options = {
            dataType: 'json',
            callback: 'callback'
        };
        return $.ajax(url, options);
    };

    var getServerTime = function() {
        return $.ajax({
            type: 'GET',
            url: 'time.html'
        });
    };

    var getSettings = function() {
        return $.getJSON("kousin.json");
    };

    var output = function(publicHolidays, now, json) {
        var today = new Date(now);
        var limit_time = 6; //時刻がAM6時以降かつ営業日(isBisDay)であれば更新日を今日にする
        var millisecondsPerDay = 1000 * 60 * 60 * 24;

        var isRegularHoliday = function(targetDate) {
            for (var i in json.regularHoliday) {
                if (targetDate.getDay() == json.regularHoliday[i].split(":")[0]) {
                    return true;
                }
            }
            return false;
        };

        var isPublicHoliday = function(targetDate) {
            var year1 = targetDate.getFullYear();
            var month1 = targetDate.getMonth();
            var date1 = targetDate.getDate();
            if(json.publicHoliday === "true") {
                for (var i in publicHolidays) {
                    var p = publicHolidays[i].split("-");
                    var a = new Date(parseInt(p[0],10), parseInt(p[1],10)-1, parseInt(p[2],10));
                    var year2 = a.getFullYear();
                    var month2 = a.getMonth();
                    var date2 = a.getDate();
                    if ((year1 === year2) && (month1 === month2) && (date1 === date2)) {
                        return true;
                    }
                }
            }
            return false;
        };

        var isTemporaryHoliday = function(targetDate) {
            var year1 = targetDate.getFullYear();
            var month1 = targetDate.getMonth();
            var date1 = targetDate.getDate();
            for (var i in json.temporaryHoliday) {
                var p = json.temporaryHoliday[i].split("-");
                var a = new Date(parseInt(p[0],10), parseInt(p[1],10)-1, parseInt(p[2],10));
                var year2 = a.getFullYear();
                var month2 = a.getMonth();
                var date2 = a.getDate();
                if ((year1 === year2) && (month1 === month2) && (date1 === date2)) {
                    return true;
                }
            }
            return false;
        };

        var isBisDay = function(targetDate) {
            //定休日のチェック
            if (isRegularHoliday(targetDate)) {
                return false;
            }

            //祝日のチェック
            if (isPublicHoliday(targetDate)) {
                return false;
            }

            //臨時休業日のチェック
            if (isTemporaryHoliday(targetDate)) {
                return false;
            }

            return true;
        };

        var GetPrevBisDay = function(targetDate) {
            //前日を取得する
            var getYesterday = function(date){
                var yesterday = new Date();
                yesterday.setTime(date.getTime() - millisecondsPerDay);
                return yesterday;
            };

            //前営業日を取得する
            var prevDay = getYesterday(targetDate);
            while(true) {
                if(isBisDay(prevDay)) return prevDay;
                prevDay = getYesterday(prevDay);
            }
        };

        //現在時刻が営業日で、更新時間を過ぎていない場合
        if ((today.getHours() < limit_time) && isBisDay(today)) {
            today = GetPrevBisDay(today);
        }
        //現在時刻が営業日ではない場合
        else if ((!isBisDay(today))) {
            today = GetPrevBisDay(today);
        }

        var kousin_month = today.getMonth();
        var kousin_date = today.getDate();

        $("#month").html(kousin_month + 1).css({
            'color':json.limit_color,
            'font-weight':json.limit_font_weight
        });
        $("#day").html(kousin_date).css({
            'color':json.limit_color,
            'font-weight':json.limit_font_weight
        });
        $("#month_s").html("月").css({
            'color':json.limit_char_color,
            'font-weight':json.limit_font_weight
        });
        $("#day_s").html("日").css({
            'color':json.limit_char_color,
            'font-weight':json.limit_font_weight
        });
        $("#time_s").html("更新").css({
            'color':json.limit_char_color,
            'font-weight':json.limit_font_weight
        });

        $("#inner").css('margin-left', json.limit_position_x + "px");
        $("#inner").css('margin-top', json.limit_position_y + "px");

        $("body").css('background-image', "url(" + json.kousin_image_file  + "?" + json.version + ")");

    };

    $.when(getServerTime()).done(function(data, status, xhr) {
        var now = new Date(xhr.getResponseHeader('Date'));
        $.when(getSettings()).done(function(data) {
            var json = data;
            $.when(getPublicHoliday(json.holidayUrl)).done(function(data) {
                var publicHolidays = data;
                output(publicHolidays, now, json);
            })
            .fail(function(data) {
              console.log('fail1...');
              console.log(data);
            });
        })
        .fail(function(data) {
          console.log('fail2...');
          console.log(data);
        });
    })
    .fail(function(data) {
      console.log('fail3...');
      console.log(data);
    });
});
