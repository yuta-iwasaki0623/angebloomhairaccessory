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
        return $.getJSON("calendar.json");
    };

    var output = function(holidays, today, settings) {
        $('#datepicker').datepicker({
            numberOfMonths: [2,1],
            firstDay: 0,
            minDate: new Date(today.getFullYear(), today.getMonth(), 1),
            maxDate: new Date(today.getFullYear(), today.getMonth() + 2, 0),
            hideIfNoPrevNext: true,
            beforeShowDay: function(date) {
                if(date.getDay() == 0) {
                    return [true,"sunday"];
                } else if(date.getDay() == 1){
                    return [true,"monday"];
                } else if(date.getDay() == 2){
                    return [true,"tuesday"];
                } else if(date.getDay() == 3){
                    return [true,"wednesday"];
                } else if(date.getDay() == 4){
                    return [true,"thursday"];
                } else if(date.getDay() == 5){
                    return [true,"friday"];
                } else if(date.getDay() == 6){
                    return [true,"saturday"];
                } else {
                    return [true];
                }
            }
        });
        $('#datepicker *').off('click').on('click', function (event) {
          event.stopPropagation();
        });

        if (settings.publicHoliday === "true") {
            for (var i in holidays) {
                var p = holidays[i].split("-");
                $("td[data-year='" + parseInt(p[0],10) + "'][data-month='" + (parseInt(p[1],10)-1) + "'] a[data-day='" + parseInt(p[2],10) + "']").addClass('holiday');
            }
        }

        for (var j in settings.regularHoliday) {
            var r = settings.regularHoliday[j].split(":");
            $("." + r[1] +  " .ui-state-default").addClass('holiday');
        }

        for (var k in settings.temporaryHoliday) {
            var t = settings.temporaryHoliday[k].split("-");
            $("td[data-year='" + parseInt(t[0],10) + "'][data-month='" + (parseInt(t[1],10)-1) + "'] a[data-day='" + parseInt(t[2],10) + "']").addClass('holiday');
        }

        $('.ui-widget-header').css('color', settings.title_color);
        $('.ui-widget-header').css('background', settings.title_back_color);
        $('.ui-widget-header').css('background-color', settings.title_back_color);

        $('a.ui-state-default').css('border', '0px');
        $('a.ui-state-default').css('color', settings.businessDay_color);
        $('a.ui-state-default').css('background', settings.businessDay_back_color);
        $('a.ui-state-default').css('background-color', settings.businessDay_back_color);
        $('a.ui-state-default').css('font-weight', 'normal');

        $('a.ui-state-default.holiday').css('color', settings.holiday_color);
        $('a.ui-state-default.holiday').css('background', settings.holiday_back_color);
        $('a.ui-state-default.holiday').css('background-color', settings.holiday_back_color);
        $('a.ui-state-default.holiday').css('font-weight', 'normal');

        $('#datepicker').css('font-size', settings.calendar_font_size + "px");

        $('.ui-datepicker-group').css('float', 'none');

        $("#text").empty().append(settings.calendar_text);

    }


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
