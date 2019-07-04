$(function() {
    $("#powered_by").empty().append('システム提供<br>「compass for 楽天市場」');

    $('body.tool').contextMenu('menu', {
        menuStyle: {
            width: '200px',
            backgroundColor: '#FFF'
        },
        itemHoverStyle: {
            backgroundColor: '#FF890A'
        },
        bindings: {
            'powered_by': function() {
                return false;
            }
        }
    });
});
