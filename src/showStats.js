
//initiates scrolling webpage for displaying distance of travels
function showStats(travels) {
    $("#loader").addClass("hide");

    $("#scroll-button").removeClass("scale-out");
    $("#scroll-button").removeClass("hide");
    $(".activities").show();

    var config = {
        caption: {
            fontfamily: "Roboto"
        },
        meta: {
            caption: "Distance (km)"
        },
        graph: {
            bgcolor: "none"
        },
        frame: {
            bgcolor: "none"
        },
        axis: {
            showtext: true
        },
        label: {
            showlabel: true
        },
        pie: {
            fontfamily: "roboto",
            fontvariant: "normal"
        }

    }

    var graphdef = {
        categories: ['Distance '],
        dataset: {
            'Distance ': [
                // { name : 'Total Distance', value : travels.total },
                {
                    name: 'Driven',
                    value: travels.driven
                }, {
                    name: 'Walked',
                    value: travels.walked
                }, {
                    name: 'Flown',
                    value: travels.flew
                }, {
                    name: 'Ran',
                    value: travels.ran
                }, {
                    name: 'Biked',
                    value: travels.biked
                }
            ]
        }
    };
    //change this eventually
    // var chart = uv.chart('Pie', graphdef, config);

    var options_scrollfire = [
        {
            selector: '#scrollfire1',
            offset: 200,
            callback: function() {
                $("#scrollfire1").removeClass("scale-out");
            }
        }, {
            selector: '#scrollfire2',
            offset: 200,
            callback: function() {
                $("#scrollfire2").removeClass("scale-out");
            }
        }, {
            selector: '#scrollfire3',
            offset: 200,
            callback: function() {
                $("#scrollfire3").removeClass("scale-out");
            }
        }, {
            selector: '#scrollfire4',
            offset: 200,
            callback: function() {
                $("#scrollfire4").removeClass("scale-out");
            }
        }, {
            selector: '#scrollfire5',
            offset: 200,
            callback: function() {
                $("#scrollfire5").removeClass("scale-out");
            }
        }, {
            selector: '#scrollfire6',
            offset: 200,
            callback: function() {
                $("#scrollfire6").removeClass("scale-out");
            }
        }, {
            selector: '#scrollfire7',
            offset: 200,
            callback: function() {
                $("#scrollfire7").removeClass("scale-out");
            }
        }, {
            selector: '#scrollfire8',
            offset: 200,
            callback: function() {
                $("#scrollfire8").removeClass("scale-out");
            }
        }
    ];
    console.log('scrollfile')
    Materialize.scrollFire(options_scrollfire);

    var options_enhancedScroll = [
        // {selector: '#flying', offset: 200, downScrollCallback: function() {
        //    $("#scroll-guy").addClass("fa-car");
        //    $("#scroll-guy").removeClass("fa-space-shuttle")
        //    $("#scroll-guy").removeClass("fa-rotate-90")
        // }, upScrollCallback : function(){
        //    $("#scroll-guy").addClass("fa-space-shuttle");
        //    $("#scroll-guy").addClass("fa-rotate-90");
        //    $("#scroll-guy").removeClass("fa-car")
        // } },
        {
            selector: '#driven',
            offset: 300,
            downScrollCallback: function() {
                $("#scroll-guy").removeClass("fa-space-shuttle");
                $("#scroll-guy").removeClass("fa-rotate-90");
                $("#scroll-guy").addClass("fa-car")
            },
            upScrollCallback: function() {
                $("#scroll-guy").addClass("fa-space-shuttle");
                $("#scroll-guy").addClass("fa-rotate-90");
                $("#scroll-guy").removeClass("fa-car");
            }
        }, {
            selector: '#onFoot',
            offset: 300,
            downScrollCallback: function() {
                $("#scroll-guy").removeClass("fa-car");
                $("#scroll-guy").addClass("fa-male");
            },
            upScrollCallback: function() {
                $("#scroll-guy").removeClass("fa-male");
                $("#scroll-guy").addClass("fa-car");
            }
        }
    ];
    Materialize.scrollFireEnhanced(options_enhancedScroll);

    $("#totalKm").text(formatThousands(travels.total, 2) + " km");
    $("#firstDate").text(travels.startDate.getDate() + '/' + travels.startDate.getMonth() + "/" + travels.startDate.getFullYear());
    $("#kmDriven").text(formatThousands(travels.driven, 2));
    $("#inCar").text(formatThousands(travels.exit));
    $("#averageKm").text(formatThousands(travels.total / getDays(travels.startDate), 2));
    $("#planeKm").text(formatThousands(travels.flew, 2));
    $("#planeTrips").text(formatThousands(travels.flights, 2));
    $("#drivenEarth").text(formatThousands(travels.driven / 24901, 2));
    $("#walked").text(formatThousands(travels.walked, 2));
    $("#ran").text(formatThousands(travels.ran, 2));
    $("#biked").text(formatThousands(travels.biked, 2));

    //smooth scrolling init
    $(function() {
        $('a[href*="#"]:not([href="#"])').click(function() {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length
                    ? target
                    : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html, body').animate({
                        scrollTop: target.offset().top
                    }, 1000);
                    return false;
                }
            }
        });
    });
    $("#bridge").css({
        left: -(2560 - $(window).width()) / 2
    });
    $(window).on('resize', function() {
        $("#bridge").css({
            left: -(2560 - $(window).width()) / 2
        });
    })
}

//gets number of days since argument
function getDays(date) {
    var one_day = 1000 * 60 * 60 * 24;

    var date1_ms = date.getTime();
    var date2_ms = new Date().getTime();

    var difference = Math.round((date2_ms - date1_ms) / one_day);
    return difference;
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

//adds commas to numbers; n is number dp is decimal places
function formatThousands(n, dp) {
    var s = '' + (
        Math.floor(n)),
        d = n % 1,
        i = s.length,
        r = '';
    while ((i -= 3) > 0) {
        r = ',' + s.substr(i, 3) + r;
    }
    return s.substr(0, i + 3) + r + (
        d
        ? '.' + Math.round(d * Math.pow(10, dp || 2))
        : '');
}

module.exports = showStats;
