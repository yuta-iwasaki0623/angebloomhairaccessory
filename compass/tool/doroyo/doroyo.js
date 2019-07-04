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
        return $.getJSON("doroyo.json");
    };

    var output = function(publicHolidays, now, json) {
        var today = new Date(now);
        var limit_time = parseInt(json.limit,10);
        var interval = parseInt(json.interval,10);
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

        var GetNextBisDay = function(targetDate) {
            //翌日を取得する
            var getTomorrow = function(date){
                var tomorrow = new Date();
                tomorrow.setTime(date.getTime() + millisecondsPerDay);
                return tomorrow;
            };

            //翌営業日(次に発送が可能な日)を取得する
            var nextDay = getTomorrow(targetDate);
            while(true) {
                if(isBisDay(nextDay)) return nextDay;
                nextDay = getTomorrow(nextDay);
            }
        };

        var check1 =  function() {
            for(var i = 0; i < interval; i++) {
                today = GetNextBisDay(today);
            }
        };

        var check2 =  function() {
            for(var j = 0; j <= interval; j++) {
                today = GetNextBisDay(today);
            }
        };

        while (true) {
            //現在時刻が注文締切時刻前で、かつ営業日の場合
            if ((today.getHours() < limit_time) && isBisDay(today)) {
                check1();
                break;
            }
            //現在時刻が注文締切時刻を過ぎていて、かつ営業日の場合
            else if (((today.getHours() >= limit_time) && isBisDay(today))) {
                check2();
                break;
            }
            //現在時刻が営業日ではない場合
            else if ((!isBisDay(today))) {
                check2();
                break;
            }
        }

        var now_year = new Date(now).getFullYear();
        var now_month = new Date(now).getMonth();
        var now_date = new Date(now).getDate();
        var send_year = today.getFullYear();
        var send_month = today.getMonth();
        var send_date = today.getDate();

        $("#month").html(send_month + 1);
        $("#day").html(send_date);
        $("#month_s").html("月");
        $("#day_s").html("日");

        //注文締切時刻の表示
        if (limit_time === 0) {
            $("#ampm").html("深夜");
            $("#time").html("0");
        }
        else if (limit_time === 12) {
            $("#ampm").html("正午");
            $("#time").html("12");
        }
        else if (limit_time > 12) {
            $("#ampm").html("PM");
            $("#time").html(limit_time - 12);
        }
        else {
            $("#ampm").html("AM");
            $("#time").html(limit_time);
        }

        $("#doroyo").css('background-image', "url(" + json.doroyo_image_file  + "?" + json.version + ")");
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
