  function readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 
    
    var distance = 0;
    var walked = 0;
    var ran = 0;
    var biked = 0;
    var drove = 0;
    var flew = 0;
    var exited_vehicle = 0;


    var prevLat;
    var prevLong;
    var prevHeight = 0;

    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
	      var contents = e.target.result;
        var parsed = JSON.parse(contents.replace(/\s+/g,"").replace(/(\r\n|\n|\r)/gm,""));

        for (var i = 0; i < parsed.locations.length; i++) {
          if(i == 0){
            prevLong = parsed.locations[i].longitudeE7 * Math.pow(10, -7);
            prevLat = parsed.locations[i].latitudeE7 * Math.pow(10, -7);
            if (parsed.locations[i].height > -1) prevHeight = parsed.locations[i].altitude;

          }
          else{
            var longitude = parsed.locations[i].longitudeE7 * Math.pow(10, -7);
            var latitude = parsed.locations[i].latitudeE7 * Math.pow(10, -7);
            var height = 0;
            if(parsed.locations[i].altitude > -1) height = parsed.locations[i].altitude;
            
            var current_distance = Math.abs(getDistance(prevLat, latitude, prevLong, longitude, prevHeight, height));

            distance += current_distance;

            if(current_distance > 1000){
              flew += current_distance;
            }

            //if contains activities section
            if(typeof parsed.locations[i].activitys !== 'undefined') {
              var transport = parsed.locations[i].activitys[0].activities[0].type;

              switch(transport){
                case 'onFoot':
                  walked += current_distance;
                  for (var c = 0; c < parsed.locations[i].activitys[0].activities.length; c++) {
                    if(parsed.locations[i].activitys[0].activities[c].type == 'running' && parsed.locations[i].activitys[0].activities[c].confidence > 15) ran += current_distance;
                  }
                  break;
                case 'unknown':
                  walked += current_distance;
                  for (var c = 0; c < parsed.locations[i].activitys[0].activities.length; c++) {
                    if(parsed.locations[i].activitys[0].activities[c].type == 'running' && parsed.locations[i].activitys[0].activities[c].confidence > 15) ran += current_distance;
                  }
                  break;
                case 'still':
                  walked += current_distance;
                  for (var c = 0; c < parsed.locations[i].activitys[0].activities.length; c++) {
                    if(parsed.locations[i].activitys[0].activities[c].type == 'running' && parsed.locations[i].activitys[0].activities[c].confidence > 15) ran += current_distance;
                  }
                  break;
                case 'walking':
                  walked += current_distance;
                  for (var c = 0; c < parsed.locations[i].activitys[0].activities.length; c++) {
                    if(parsed.locations[i].activitys[0].activities[c].type == 'running' && parsed.locations[i].activitys[0].activities[c].confidence > 15) ran += current_distance;
                  }
                  break;
                case 'running':
                  ran += current_distance;
                  break;
                case 'inVehicle':
                  for (var c = 0; c < parsed.locations[i].activitys[0].activities.length; c++) {
                    if(parsed.locations[i].activitys[0].activities[c].type == 'onBicycle' && parsed.locations[i].activitys[0].activities[c].confidence > 40){
                      biked += current_distance;
                      break;
                    } 
                  }
                  drove += current_distance;
                  break;
                case 'onBicycle':
                  biked += current_distance;
                  break;
                case 'exitingVehicle':
                  exited_vehicle++;
                  break;
              }
            }

            prevLong = longitude;
            prevLat = latitude;
            prevHeight = height;
          }
        }
        $("#total").html("You have travelled " + formatThousands(distance, 2) + " kilometers total with your phone. That is " + formatThousands(distance*.621371, 2) + " miles.");
        $("#drove").html("You have driven " + formatThousands(drove, 2) + " km total. (" + formatThousands(drove*.621371, 2) + " miles)")
        $("#walked").html("You have walked " + formatThousands(walked, 2) + " km total. (" + formatThousands(walked*.621371, 2) + " miles)")
        $("#ran").html("You have ran " + formatThousands(ran, 2) + " km total. (" + formatThousands(ran*.621371, 2) + " miles)")
        $("#biked").html("You have biked " + formatThousands(biked, 2) + " km total. (" + formatThousands(biked*.621371, 2) + " miles)")
        $("#flew").html("You have flown " + formatThousands(flew, 2) + " km total. (" + formatThousands(flew*.621371, 2) + " miles)")
        $("#exit").html("You have parked a vehicle " + formatThousands(exited_vehicle, 2) + " times.")

      }
      r.readAsText(f);
    } else { 
      alert("Failed to load file");
    }
  }


//distance in km from latitude and longitude
function getDistance(lat1, lat2, long1, long2, height1, height2){

  // console.log(lat1 + " " + lat2);
  // console.log(long1 + " " + long2);
  
  var r = 6371;
  var latitude1 = Math.radians(lat1);
  var latitude2 = Math.radians(lat2);

  var latDistance = Math.radians(lat2-lat1);
  var lonDistance = Math.radians(long2-long1);

  var a = Math.sin(latDistance/2)*Math.sin(latDistance/2) + Math.cos(latitude1)*Math.cos(latitude2) * Math.sin(lonDistance/2) * Math.sin(lonDistance/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var distance = r*c;

//the 0 on the right should be height2-height1 but it creates a lot of error
  distance = Math.pow(distance, 2) + Math.pow((0), 2);

  return Math.sqrt(distance);
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

  window.onload = function(){
    document.getElementById('fileinput').addEventListener('change', readSingleFile, false);
  };

//adds commas to numbers; n is number dp is decimal places
function formatThousands(n, dp) {
  var s = ''+(Math.floor(n)), d = n % 1, i = s.length, r = '';
  while ( (i -= 3) > 0 ) { r = ',' + s.substr(i, 3) + r; }
  return s.substr(0, i + 3) + r + (d ? '.' + Math.round(d * Math.pow(10,dp||2)) : '');
}