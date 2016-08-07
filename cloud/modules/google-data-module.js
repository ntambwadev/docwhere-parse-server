
var google = require('googleapis');

//  Create a google place parse object with google data coming from the ios native app
//===================================================================================================

var googlePlaces = []
var request_url_google_api = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=emergency+room+urgent+care&key=AIzaSyAvgfUnUQzI7b3DeIT7hRLus28guaormrU" 


Parse.Cloud.define("addGooglePlaceToParseFromNative", function(request, response) {

    console.log("addGooglePlaceToParse params place_id: " + request.params.place_id)

      var place_item = {

        place_id:request.params.place_id,
        name:request.params.name,
        city:request.params.city,
        state:request.params.state,
        address:request.params.address,
        google_id:request.params.google_id,
        location:request.params.location,
        zip:request.params.zip
      }
      var currentGooglePlace = {}

      var query = new Parse.Query("GooglePlace");
      query.equalTo('place_id', place_item.place_id)

      query.first({ useMasterKey: true }).then(function(googlePlace) {

        if(googlePlace){
            console.log("old found addGooglePlaceToParseFromNative")
            return googlePlace.save()
        }else{
            console.log("Create new addGooglePlaceToParseFromNative")
            var googlePlaceObject = createGooglePlaceFromNative(place_item)
            return googlePlaceObject.save()
        }

      }).then(function(googlePlace) {

        if(googlePlace){
            currentGooglePlace = googlePlace
            var Facility = Parse.Object.extend("Facility");
            var query = new Parse.Query(Facility);
            query.equalTo('placeID', googlePlace.get("place_id"))
            return query.first()
        }

      }).then(function(facility) {

        if(facility){
            facility.set("googlePlace", currentGooglePlace);
            return facility.save()
        }

      }).then(function(facility) {
        console.log("Success addGooglePlaceToParseFromNative")
        response.success(currentGooglePlace)

      }, function(error) {
            // handle error
            console.log(error);
            response.error(error)
      });

});

//  call to query google place hospital data
//===================================================================================================

Parse.Cloud.define("queryGooglePlaceHospitals", function(request, response) {


    var request_url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=emergency+room+urgent+care&key=AIzaSyAvgfUnUQzI7b3DeIT7hRLus28guaormrU" 
    Parse.Cloud.httpRequest({
        url: request_url_google_api}).then(function(httpResponse) {

            console.log(httpResponse)
            googlePlaces.concat(httpResponse.data.results)
            if(httpResponse.data.next_page_token){
                // response.success(httpResponse.data.next_page_token);
                request_url_google_api = request_url_google_api + "&pagetoken=" + httpResponse.data.next_page_token
                // Parse.Cloud.run('queryGooglePlaceHospitals', {})
                response.success(httpResponse.data);
                
            
            }else{
                response.success(googlePlaces);
            }

        }, function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.error('Request failed with response code ' + httpResponse.status);
        });
        
});


var queryGooglePlaceER = function(request_url) {

  return Parse.Cloud.httpRequest({
    url: request_url
  });
}

Parse.Cloud.define('queryGooglePlaceERInUS', function(request, response) {

  Parse.Promise.as().then(function() {

    return queryGooglePlaceER(request_url_google_api);

  }).then(function(userData) {

    return updateSpotifyUser(accessToken, userData,tokenExpirationDate)
    // return userData
// 
  }).then(function(user) {

    response.success(user);
  }, function(error) {
    response.error(error);
  });
});

//  Save google place emergency places on parse
//===================================================================================================

Parse.Cloud.define("saveGooglePlacesToParse", function(request, response) {

      Parse.Cloud.run('queryGooglePlaceHospitals', {} ).then(function(emergency_places_array) {

            var promises = []
            var parse_objects = []
            for (var index in emergency_places_array){   
                // console.log("google place")
                var place_item = emergency_places_array[index]
                var googlePlaceObject = createGooglePlace(place_item)
                
                promises.push(googlePlaceObject.save());
                // promises.push(Parse.Cloud.run('addGooglePlaceToParse', { useMasterKey: true }, {place_item:place_item}));
                // parse_objects.push(googlePlaceObject)
            }
            return Parse.Promise.when(promises)
            // return Parse.Object.saveAll(parse_objects) 

      }).then(function (google_places) {

            response.success(google_places)

      }, function(error) {
            // handle error
            console.log(error);
            response.error()
      });

});


//  Add a google place object to parse and create a new facility associated with it if needed
//===================================================================================================

Parse.Cloud.define("addGooglePlaceToParse", function(request, response) {

    console.log("addGooglePlaceToParse")
      var place_item = request.params.place_item

      var query = new Parse.Query("GooglePlace");
      query.equalTo('google_id', place_item.google_id)
      query.equalTo('place_id', place_item.place_id)
      
      query.first({ useMasterKey: true }).then(function(google_place) {

        if(google_place){

            return google_place

        }else{

            var googlePlaceObject = createGooglePlace(place_item)
            return googlePlaceObject.save()
        }

      }).then(function(googlePlaceObject) {
        var facility = createFacilityFromGooglePlace(googlePlaceObject)
        console.log("Success updating tracks")
        response.success(googlePlaceObject)

      }, function(error) {
            // handle error
            console.log(error);
            response.error(error)
      });

});


//  Create a google place parse object
//===================================================================================================

function createGooglePlace(place_item){

    var place_item_addr = place_item.formatted_address
    if(place_item_addr){

        var result = place_item_addr.match(/[^,]+,[^,]+/g);
        var state_zip_code_country = result[1]
        console.log(place_item_addr)
        var split_array = state_zip_code_country.split(' ');
        var state_short = split_array[1]
        var zip_code = parseInt(split_array[2].split(',')[0]);
    }

    var google_id = place_item.id
    var place_id = place_item.place_id
    var formatted_address = place_item.formatted_address
    var hospital_name = place_item.name
    if(place_item.location){

        var latitude =  place_item.location.lat
        var longitude =  place_item.location.lng
        var location = new Parse.GeoPoint({latitude: latitude, longitude: longitude})
    }

    var GooglePlace = Parse.Object.extend("GooglePlace");
    var googlePlaceObject = new GooglePlace();
    if(place_item_addr){

        googlePlaceObject.set("formatted_address", place_item.formatted_address);
        googlePlaceObject.set("state_short", state_short);
        googlePlaceObject.set("zip_code", zip_code);

    }
    if (location){
        googlePlaceObject.set("location", location);
    }
    
    googlePlaceObject.set("hospital_name", hospital_name);
    googlePlaceObject.set("google_id", google_id);
    googlePlaceObject.set("place_id", place_id);

    return googlePlaceObject
}

//  Create a google place parse object with data coming from ios native app
//===================================================================================================

function createGooglePlaceFromNative(place_item){

    var GooglePlace = Parse.Object.extend("GooglePlace");
    var googlePlaceObject = new GooglePlace();

    googlePlaceObject.set("hospital_name", place_item.name);
    googlePlaceObject.set("name", place_item.name);
    googlePlaceObject.set("city", place_item.city);
    googlePlaceObject.set("state", place_item.state);
    googlePlaceObject.set("formatted_address", place_item.address);
    googlePlaceObject.set("address", place_item.address);
    googlePlaceObject.set("google_id", place_item.google_id);
    googlePlaceObject.set("place_id", place_item.place_id);
    googlePlaceObject.set("location", place_item.location);
    // googlePlaceObject.set("zip_code", place_item.zip);
    googlePlaceObject.set("zip_code", place_item.zip);

    return googlePlaceObject
}

//  Create a Facility parse object with google place data
//===================================================================================================

function createFacilityFromGooglePlace(googlePlace){

    var Facility = Parse.Object.extend("Facility");
    var facility = new Facility();

    facility.set("name", googlePlace.get("name"));
    facility.set("city", googlePlace.get("city"));
    facility.set("state", googlePlace.get("state"));
    facility.set("address", googlePlace.get("address"));
    facility.set("placeID", googlePlace.get("placeID"));
    facility.set("location", googlePlace.get("location"));
    facility.set("zip", googlePlace.get("zip"));
    facility.set("googlePlace", googlePlace);

    return facility
}