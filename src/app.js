const JsonStream = require('./JsonStream');
const drop = require('drag-and-drop-files');

const showStats = require('./showStats');

drop(document.body, (files) => {
    $("#loader").removeClass("hide");

    makeStats(files[0]);
});

window.onload = function() {
    document.getElementById('fileinput').addEventListener('change', (evt) => {
        $("#loader").removeClass("hide");

        makeStats(evt.target.files[0]);
    }, false);
};

function makeStats(file) {
    let previousLocation;
    let totalDistance = 0;

    const travels = {
        total: 0,
        driven: 0,
        walked: 0,
        ran: 0,
        biked: 0,
        flew: 0,
        startDate: 0,
        exit: 0,
        flights: 0,
        undefined: 0
    };

    const locationStream = JsonStream.createReadStream(file, 2);

    locationStream.on('data', currentLocation => {
        if (previousLocation) {
            const journey = getJourneyBetween(previousLocation, currentLocation);

            travels[journey.transportType] += journey.distance;

            if (journey.transportType === 'exited_vehicle') {
                travels.exit++;
                journey.transportType = 'driven';
            }

            if (journey.transportType === 'flew') {
                travels.flights++;
            }

            totalDistance += journey.distance;
            previousLocation = currentLocation;
        }
        previousLocation = currentLocation;
    });

    locationStream.on('progress', progress => {
        $('#progressBar').css('width', progress.percentage + '%');
        $('#progressPercentage').text(`Percentage processed: ${progress.percentage}%`);
        $('#progressDistance').text(`Distance travelled: ${Math.round(totalDistance * 100) / 100}km`);
    });

    locationStream.on('end', () => {
        travels.startDate = new Date(parseFloat(previousLocation.timestampMs));
        travels.total = totalDistance;
        console.log('travels', travels);

        showStats(travels);
    });
}

function getJourneyBetween(prevLocation, location) {
    let transportType;

    const longitude = location.longitudeE7 * Math.pow(10, -7);
    const latitude = location.latitudeE7 * Math.pow(10, -7);
    const height = location.altitude;

    const prevLong = prevLocation.longitudeE7 * Math.pow(10, -7);
    const prevLat = prevLocation.latitudeE7 * Math.pow(10, -7);
    const prevHeight = prevLocation.altitude;

    const distance = Math.abs(getDistance(prevLat, latitude, prevLong, longitude, prevHeight, height));

    // Since phone will be in airplane mode in the air if phone has been disconnected for > 1000 km we assume they were on a plane
    if (distance > 1000) {
        transportType = "flew"
    }

    // If entry contains activities section
    if (typeof location.activity !== 'undefined') {
        var transport = location.activity[0].activity[0].type;

        switch (transport) {
            case 'ON_FOOT':
                for (var c = 0; c < location.activity[0].activity.length; c++) {
                    if (location.activity[0].activity[c].type == 'RUNNING' && location.activity[0].activity[c].confidence > 15) {
                        transportType = 'ran';
                        break;
                    }
                    if (location.activity[0].activity[c].type == 'WALKING' && location.activity[0].activity[c].confidence > 20) {
                        transportType = 'walked';
                        break;
                    }
                }
                break;
            case 'UNKNOWN':
                for (var c = 0; c < location.activity[0].activity.length; c++) {
                    if (location.activity[0].activity[c].type == 'RUNNING' && location.activity[0].activity[c].confidence > 15) {
                        transportType = 'ran';
                        break;
                    }
                    if (location.activity[0].activity[c].type == 'WALKING' && location.activity[0].activity[c].confidence > 20) {
                        transportType = 'walked';
                        break;
                    }
                }
                break;
            case 'STILL':
                for (var c = 0; c < location.activity[0].activity.length; c++) {
                    if (location.activity[0].activity[c].type == 'RUNNING' && location.activity[0].activity[c].confidence > 15) {
                        transportType = 'ran';
                        break;
                    }
                    if (location.activity[0].activity[c].type == 'WALKING' && location.activity[0].activity[c].confidence > 20) {
                        transportType = 'walked';
                        break;
                    }
                }
                break;
            case 'WALKING':
                for (var c = 0; c < location.activity[0].activity.length; c++) {
                    if (location.activity[0].activity[c].type == 'RUNNING' && location.activity[0].activity[c].confidence > 15) {
                        transportType = 'ran';
                        break;
                    }
                    if (location.activity[0].activity[c].type == 'WALKING' && location.activity[0].activity[c].confidence > 20) {
                        transportType = 'walked';
                        break;
                    }
                }
                break;
            case 'RUNNING':
                transportType = 'ran';
                break;
            case 'IN_VEHICLE':
                for (var c = 0; c < location.activity[0].activity.length; c++) {
                    if (location.activity[0].activity[c].type == 'ON_BICYCLE' && location.activity[0].activity[c].confidence > 40) {
                        transportType = 'biked';
                        break;
                    }
                }
                transportType = 'driven';
                break;
            case 'ON_BICYCLE':
                transportType = 'biked';
                break;
            case 'EXITING_VEHICLE':
                transportType = 'exited_vehicle';
                break;
        }
    }

    return {transportType, distance}
}

// Returns distance in km from latitude and longitude
function getDistance(lat1, lat2, long1, long2, height1, height2) {
    // Sometimes height is not given so we will set both to 0 if one is 0
    if (typeof height1 == 'undefined' || typeof height2 == 'undefined') {
        height1 = height2 = 0;
    }

    // Radius of the earth (meters)
    var r = 6371;
    var latitude1 = Math.radians(lat1);
    var latitude2 = Math.radians(lat2);

    var latDistance = Math.radians(lat2 - lat1);
    var lonDistance = Math.radians(long2 - long1);

    var a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2) + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // If height is available we will get height as well (pythagoras' theorum)
    var x = Math.pow(r * c, 2) + Math.pow((height2 - height1) / 1000, 2);
    var totalDistance = Math.sqrt(x);

    return totalDistance;
}
