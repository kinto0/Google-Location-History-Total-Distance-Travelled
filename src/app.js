const JsonStream = require('./JsonStream');
const drop = require('drag-and-drop-files');

drop(document.body, (files) => {
    const stream = JsonStream.createReadStream(files[0], 2, 2);

    let previousLocation;
    let totalDistance = 0;

    stream.on('data', data => {
        if (previousLocation) {
            // console.log('locations', previousLocation, data);
            const distance = getDistancesBetween(previousLocation, data);

            totalDistance += distance.distance;
            previousLocation = data;
            // console.log('distance, total so far', distance.distance, totalDistance);
        }
        previousLocation = data;
        // console.log('data');
    });

    const interval = setInterval(() => {
        console.log("distance:", totalDistance);
    }, 1000);

    stream.on('end', () => {
        console.log('total distance', totalDistance);
        clearInterval(interval);
    });
});

window.onload = function() {
    document.getElementById('fileinput').addEventListener('change', readSingleFile, false);
};

//reads file from file selector
function readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var file = evt.target.files[0];

    console.log('opening stream');
    const stream = JsonStream.createReadStream(file, 2);

    console.log('stream on')
    stream.on('data', (data) => {
        console.log('stream on data', data);
    })
    // $("#loader").removeClass("inactive");
    // $("#loader").addClass("active");
    //
    // if (f) {
    //     var r = new FileReader();
    //     r.onload = function(e) {
    //         try {
    //             var contents = e.target.result.replace(/\s+/g, "").replace(/(\r\n|\n|\r)/gm, "");
    //             var parsedContents = JSON.parse(contents);
    //
    //             initScroll(getActivitiesDistance(parsedContents));
    //         } catch (SyntaxError) {
    //             $("#loader").removeClass("active");
    //             $("#loader").addClass("inactive");
    //             Materialize.toast("Error reading JSON. File either exceeds 256 MB or is not .JSON.", 10000);
    //             $("#card-text").html("<p class='flow-text'>File either exceeds 256 MB or is not a .JSON. please make sure you have selected the .JSON file and not the .zip. If you have, please try another browser (Microsoft Edge seems to work) or click <a href='https://stedolan.github.io/jq/'>here</a> to download a program that can trim your JSON down to 256 mb or less. Use the command:</p><br><p>jq -c . LocationHistory.json > LocationHistory.compact.json</p>");
    //             $("#card-title").text("Uh oh!");
    //         }
    //     }
    //     r.readAsText(f);
    // }
}

function getDistancesBetween(prevLocation, location) {
    var distance = 0;
    var walked = 0;
    var ran = 0;
    var drove = 0;
    var flew = 0;
    var biked = 0;
    var exited_vehicle = 0;
    var first_date;
    var plane_flights = 0;

    let transportType;
        // var first_date = new Date(parseFloat(parsed.locations[i].timestampMs));
        //
    const longitude = location.longitudeE7 * Math.pow(10, -7);
    const latitude = location.latitudeE7 * Math.pow(10, -7);
    const height = location.altitude;

    const prevLong = prevLocation.longitudeE7 * Math.pow(10, -7);
    const prevLat = prevLocation.latitudeE7 * Math.pow(10, -7);
    const prevHeight = prevLocation.altitude;

    const current_distance = Math.abs(getDistance(prevLat, latitude, prevLong, longitude, prevHeight, height));
    // console.log('current_distance', current_distance);

    //since phone will be in airplane mode in the air if phone has been disconnected for > 1000 km we assume they were on a plane
    if (current_distance > 1000) {
        // flew += current_distance;
        // plane_flights++;
        transportType = "flew"
    }

    //if contains activities section
    if (typeof location.activity !== 'undefined') {
        var transport = location.activity[0].activity[0].type;

        switch (transport) {
            case 'ON_FOOT':
                for (var c = 0; c < location.activity[0].activity.length; c++) {
                    if (location.activity[0].activity[c].type == 'RUNNING' && location.activity[0].activity[c].confidence > 15) {
                        // ran += current_distance;
                        transportType = 'ran';
                        break;
                    }
                    if (location.activity[0].activity[c].type == 'WALKING' && location.activity[0].activity[c].confidence > 20) {
                        // walked += current_distance;
                        transportType = 'walked';
                        break;
                    }
                }
                break;
            case 'UNKNOWN':
                for (var c = 0; c < location.activity[0].activity.length; c++) {
                    if (location.activity[0].activity[c].type == 'RUNNING' && location.activity[0].activity[c].confidence > 15) {
                        // ran += current_distance;
                        transportType = 'ran';
                        break;
                    }
                    if (location.activity[0].activity[c].type == 'WALKING' && location.activity[0].activity[c].confidence > 20) {
                        // walked += current_distance;
                        transportType = 'walked';
                        break;
                    }
                }
                break;
            case 'STILL':
                for (var c = 0; c < location.activity[0].activity.length; c++) {
                    if (location.activity[0].activity[c].type == 'RUNNING' && location.activity[0].activity[c].confidence > 15) {
                        // ran += current_distance;
                        transportType = 'ran';
                        break;
                    }
                    if (location.activity[0].activity[c].type == 'WALKING' && location.activity[0].activity[c].confidence > 20) {
                        // walked += current_distance;
                        transportType = 'walked';

                        break;
                    }
                }
                break;
            case 'WALKING':
                for (var c = 0; c < location.activity[0].activity.length; c++) {
                    if (location.activity[0].activity[c].type == 'RUNNING' && location.activity[0].activity[c].confidence > 15) {
                        // ran += current_distance;
                        transportType = 'ran';
                        break;
                    }
                    if (location.activity[0].activity[c].type == 'WALKING' && location.activity[0].activity[c].confidence > 20) {
                        // walked += current_distance;
                        transportType = 'walked';
                        break;
                    }
                }
                break;
            case 'RUNNING':
                // ran += current_distance;
                transportType = 'ran';
                break;
            case 'IN_VEHICLE':
                for (var c = 0; c < location.activity[0].activity.length; c++) {
                    if (location.activity[0].activity[c].type == 'ON_BICYCLE' && location.activity[0].activity[c].confidence > 40) {
                        // biked += current_distance;
                        transportType = 'biked';
                        break;
                    }
                }
                transportType = 'driven';
                // drove += current_distance;
                break;
            case 'ON_BICYCLE':
                // biked += current_distance;
                transportType = 'biked';
                break;
            case 'EXITING_VEHICLE':
                exited_vehicle++;
                break;
        }
    }

    totalDistance = walked + ran + drove + flew + biked;
    // console.log(totalDistance);

    return {
        transportType,
        distance: current_distance
    }

    // return {
    //     total: totalDistance,
    //     driven: drove,
    //     walked: walked,
    //     ran: ran,
    //     biked: biked,
    //     flew: flew,
    //     exit: exited_vehicle,
    //     date: first_date,
    //     flights: plane_flights
    // };
    //
    //
    // return activitiesObject;
}

//returns an unformatted array of activities with their distance in km
// function getActivitiesDistance(parsed) {
//     var distance = 0;
//     var walked = 0;
//     var ran = 0;
//     var drove = 0;
//     var flew = 0;
//     var biked = 0;
//     var exited_vehicle = 0;
//     var first_date;
//     var plane_flights = 0;
//
//     var prevLat = 0;
//     var prevLong = 0;
//     var prevHeight = 0;
//
//     for (var i = parsed.locations.length - 1; i > 0; i--) {
//         // If first location
//         if (i == parsed.locations.length - 1) {
//             prevLong = parsed.locations[i].longitudeE7 * Math.pow(10, -7);
//             prevLat = parsed.locations[i].latitudeE7 * Math.pow(10, -7);
//             prevHeight = parsed.locations[i].altitude;
//             var first_date = new Date(parseFloat(parsed.locations[i].timestampMs));
//         } else {
//             var longitude = parsed.locations[i].longitudeE7 * Math.pow(10, -7);
//             var latitude = parsed.locations[i].latitudeE7 * Math.pow(10, -7);
//             var height = parsed.locations[i].altitude;
//
//             var current_distance = Math.abs(getDistance(prevLat, latitude, prevLong, longitude, prevHeight, height));
//
//             //since phone will be in airplane mode in the air if phone has been disconnected for > 1000 miles we assume they were on a plane
//             if (current_distance > 1000) {
//                 flew += current_distance;
//                 plane_flights++;
//             }
//
//             //if contains activities section
//             if (typeof parsed.locations[i].activity !== 'undefined') {
//                 var transport = parsed.locations[i].activity[0].activity[0].type;
//
//                 switch (transport) {
//                     case 'ON_FOOT':
//                         for (var c = 0; c < parsed.locations[i].activity[0].activity.length; c++) {
//                             if (parsed.locations[i].activity[0].activity[c].type == 'RUNNING' && parsed.locations[i].activity[0].activity[c].confidence > 15) {
//                                 ran += current_distance;
//                                 break;
//                             }
//                             if (parsed.locations[i].activity[0].activity[c].type == 'WALKING' && parsed.locations[i].activity[0].activity[c].confidence > 20) {
//                                 walked += current_distance;
//                                 break;
//                             }
//                         }
//                         break;
//                     case 'UNKNOWN':
//                         for (var c = 0; c < parsed.locations[i].activity[0].activity.length; c++) {
//                             if (parsed.locations[i].activity[0].activity[c].type == 'RUNNING' && parsed.locations[i].activity[0].activity[c].confidence > 15) {
//                                 ran += current_distance;
//                                 break;
//                             }
//                             if (parsed.locations[i].activity[0].activity[c].type == 'WALKING' && parsed.locations[i].activity[0].activity[c].confidence > 20) {
//                                 walked += current_distance;
//                                 break;
//                             }
//                         }
//                         break;
//                     case 'STILL':
//                         for (var c = 0; c < parsed.locations[i].activity[0].activity.length; c++) {
//                             if (parsed.locations[i].activity[0].activity[c].type == 'RUNNING' && parsed.locations[i].activity[0].activity[c].confidence > 15) {
//                                 ran += current_distance;
//                                 break;
//                             }
//                             if (parsed.locations[i].activity[0].activity[c].type == 'WALKING' && parsed.locations[i].activity[0].activity[c].confidence > 20) {
//                                 walked += current_distance;
//                                 break;
//                             }
//                         }
//                         break;
//                     case 'WALKING':
//                         for (var c = 0; c < parsed.locations[i].activity[0].activity.length; c++) {
//                             if (parsed.locations[i].activity[0].activity[c].type == 'RUNNING' && parsed.locations[i].activity[0].activity[c].confidence > 15) {
//                                 ran += current_distance;
//                                 break;
//                             }
//                             if (parsed.locations[i].activity[0].activity[c].type == 'WALKING' && parsed.locations[i].activity[0].activity[c].confidence > 20) {
//                                 walked += current_distance;
//                                 break;
//                             }
//                         }
//                         break;
//                     case 'RUNNING':
//                         ran += current_distance;
//                         break;
//                     case 'IN_VEHICLE':
//                         for (var c = 0; c < parsed.locations[i].activity[0].activity.length; c++) {
//                             if (parsed.locations[i].activity[0].activity[c].type == 'ON_BICYCLE' && parsed.locations[i].activity[0].activity[c].confidence > 40) {
//                                 biked += current_distance;
//                                 break;
//                             }
//                         }
//                         drove += current_distance;
//                         break;
//                     case 'ON_BICYCLE':
//                         biked += current_distance;
//                         break;
//                     case 'EXITING_VEHICLE':
//                         exited_vehicle++;
//                         break;
//                 }
//             }
//             if (current_distance > 0) {
//                 prevLong = longitude;
//                 prevLat = latitude;
//                 prevHeight = height;
//             }
//
//         }
//     }
//
//     distance = walked + ran + drove + flew + biked;
//     console.log(distance);
//
//     var activitiesObject = {
//         total: distance,
//         driven: drove,
//         walked: walked,
//         ran: ran,
//         biked: biked,
//         flew: flew,
//         exit: exited_vehicle,
//         date: first_date,
//         flights: plane_flights
//     };
//
//     $("#loader").removeClass("active");
//     $("#loader").addClass("inactive");
//
//     return activitiesObject;
// }

//returns distance in km from latitude and longitude
function getDistance(lat1, lat2, long1, long2, height1, height2) {

    //sometimes height is not given so we will set both to 0 if one is 0
    if (typeof height1 == 'undefined' || typeof height2 == 'undefined') {
        height1 = height2 = 0;
    }

    //radius of the earth (meters)
    var r = 6371;
    var latitude1 = Math.radians(lat1);
    var latitude2 = Math.radians(lat2);

    var latDistance = Math.radians(lat2 - lat1);
    var lonDistance = Math.radians(long2 - long1);

    var a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2) + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // if height is available we will get height as well (pythagoras' theorum)
    var x = Math.pow(r * c, 2) + Math.pow((height2 - height1) / 1000, 2);
    var totalDistance = Math.sqrt(x);

    return totalDistance;
}

//initiates scrolling webpage for displaying distance of actions
function initScroll(actions) {
    $("#scroll-button").removeClass("scale-out");
    $(".activities").show();

    var config = {
        caption: {
            fontfamily: "Roboto"
        },
        meta: {
            caption: "Distance (miles)"
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
                // { name : 'Total Distance', value : actions.total },
                {
                    name: 'Driven',
                    value: actions.driven * 0.621371
                }, {
                    name: 'Walked',
                    value: actions.walked * 0.621371
                }, {
                    name: 'Flown',
                    value: actions.flew * 0.621371
                }, {
                    name: 'Ran',
                    value: actions.ran * 0.621371
                }, {
                    name: 'Biked',
                    value: actions.biked * 0.621371
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

    $("#totalMiles").text(formatThousands(actions.total * 0.621371, 2) + " miles");
    $("#firstDate").text(actions.date.getMonth() + "/" + actions.date.getDate() + '/' + actions.date.getFullYear());
    $("#milesDriven").text(formatThousands(actions.driven * .621371, 2));
    $("#inCar").text(formatThousands(actions.exit));
    $("#averageMiles").text(formatThousands(actions.total * .621371 / getDays(actions.date), 2));
    $("#planeMiles").text(formatThousands(actions.flew * .621371, 2));
    $("#planeTrips").text(formatThousands(actions.flights, 2));
    $("#drivenEarth").text(formatThousands(actions.driven * .621371 / 24901, 2));
    $("#walked").text(formatThousands(actions.walked * .621371, 2));
    $("#ran").text(formatThousands(actions.ran * .621371, 2));
    $("#biked").text(formatThousands(actions.biked * .621371, 2));

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
