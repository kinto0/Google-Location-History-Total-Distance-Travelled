  function readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 
    var distance = 0;
    var prevLat;
    var prevLong;
    var prevHeight = 0;

    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
	      var contents = e.target.result;
        $("#results").html("Loading...");
        $("#data").html( "File " 
              +"name: " + f.name + ", "
              +"type: " + f.type + ", "
              +"size: " + f.size + " bytes"
        );  
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
            
            distance += getDistance(prevLat, latitude, prevLong, longitude, prevHeight, height);

            prevLong = longitude;
            prevLat = latitude;
            prevHeight = height;
          }
        }
        $("#results").html("You have travelled " + formatThousands(distance, 2) + " kilometers total with your phone. That is " + formatThousands(distance*.621371, 2) + " miles.");
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