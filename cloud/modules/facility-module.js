var moment = require("moment");

var Facility = Parse.Object.extend("Facility");
var DataGovPlace = Parse.Object.extend("DataGovPlace");
//  update a parse Facility object with new gov data or create a new one if it doesn't exist
//===================================================================================================

exports.updateFacilityWithGovData = function(dataGovPlace) {

    var query = new Parse.Query("Facility").equalTo('placeID', dataGovPlace.get("provider_id"))
    return query.first({useMasterKey: true}).then(function(facility) {

        if(facility){
            // Old facility => update facility wait time
            console.log("old facility")
            facility.set("govWaitTime", dataGovPlace.get("score"));
            return facility.save()
        }else{
            console.log("new facility")
            var newFacility = createFacilityWithGovData(dataGovPlace)
            return newFacility.save()
        }
        return

    }, function(error) {
        return Parse.Promise.error(error);
    }); 
}

//  Create a parse Facility object with gov data
//===================================================================================================

function createFacilityWithGovData(dataGovPlace){

    var facility = new Facility();

    // facility.set("name", dataGovPlace.get("hospital_name"));
    // facility.set("city", dataGovPlace.get("city"));
    // facility.set("state", dataGovPlace.get("state_short"));
    facility.set("address", dataGovPlace.get("address"));
    facility.set("govPlaceID", dataGovPlace.get("provider_id"));
    // facility.set("location", dataGovPlace.get("location"));
    // facility.set("zip", dataGovPlace.get("zip_code"));
    facility.set("govWaitTime", dataGovPlace.get("score"));

    var DataGovPlace = Parse.Object.extend("DataGovPlace");
    var dataGovPointer = new DataGovPlace();
    dataGovPointer.id = dataGovPlace.id
    facility.set("dataGovPlace", dataGovPointer);

    return facility
}


//  Helper function for the dev that removes duplicate facilities based on the time it was created
//===================================================================================================

Parse.Cloud.define("RemoveFacilities", function(request, response) {

      var query = new Parse.Query(Facility);
      var activeSince = moment().subtract(10,"days").toDate();
      query.greaterThan('createdAt', activeSince)
      query.limit(1000)
      query.find({ useMasterKey: true }).then(function(facilities) {
        console.log("Facility count: " + facilities.length)
        var promises = []
            for (var index in facilities){   
                var facility = facilities[index]
                promises.push(facility.destroy());
            }
        return Parse.Promise.when(promises)

      }).then(function(facilities) {

        console.log("Success RemoveFacilities")
        response.success("facilities")

      }, function(error) {
            // handle error
            console.log(error);
            response.error(error)
      });

});

Parse.Cloud.define("bindFacilityWithGooglePlace", function(request, response) {

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
      
      var currentFacility = {}

      var Facility = Parse.Object.extend("Facility");
      var query = new Parse.Query(Facility);
      query.equalTo('placeID', place_item.place_id)
      
      query.first({ useMasterKey: true }).then(function(facility) {
        if(facility){

        }
        currentFacility = facility
        return facility

      }).then(function(facility) {

        console.log("Success bindFacilityWithGovDataAndGooglePlace")
        response.success(facility)

      }, function(error) {
            // handle error
            console.log(error);
            response.error(error)
      });
});


// Check if jobId is set, and enforce uniqueness based on the jobId column.
// Parse.Cloud.beforeSave("Facility", function(request, response) {

//   if (!request.object.get("placeID")) {
//     response.error('A Facility must have a jobId.');
//   } else {
//     var query = new Parse.Query(Facility);
//     query.equalTo("placeID", request.object.get("placeID"));
//     query.first({
//       success: function(facility) {
//         if (facility) {
//           updateFacilityWithGovData(facility)
//           response.error("A Facility with this placeID already exists.");
//         } else {
//           response.success();
//         }
//       },
//       error: function(error) {
//         response.error("Could not validate uniqueness for this Facility object.");
//       }
//     });
//   }
// });

function updateFacilityWithGovData(facility){

    var query = new Parse.Query(DataGovPlace).equalTo('zip_code',  facility.get("zip"))

    return query.first({useMasterKey: true}).then(function(dataGovPlace) {

        if(dataGovPlace){

            facility.set("dataGovPlace",dataGovPlace)
            return facility.save()
        }

    }).then(function(facility) {

        return facility

      }, function(error) {
        console.log("Failed updateFacilityWithGovData")
        return Parse.Promise.error(error);
    }); 
}

Parse.Cloud.define("updateFacilityWithGovData", function(request, response) {

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
      
      var currentFacility = {}

      var Facility = Parse.Object.extend("Facility");
      var query = new Parse.Query(Facility);
      query.equalTo('placeID', place_item.place_id)
      
      query.first({ useMasterKey: true }).then(function(facility) {
        if(facility){

        }
        currentFacility = facility
        return facility

      }).then(function(facility) {

        console.log("Success bindFacilityWithGovDataAndGooglePlace")
        response.success(facility)

      }, function(error) {
            // handle error
            console.log(error);
            response.error(error)
      });

});

