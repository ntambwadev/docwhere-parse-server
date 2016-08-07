
var facilityModule = require('../modules/facility-module.js');
// var govDataMesuresIds = ["EDV","ED_1b","ED_2b","OP_18b","OP_20","OP_21","OP_22","OP_23"]
var govDataMesuresIds = ["EDV"]
//  Query OP_20 emergency places data from data.gov api
//==========================================================================

Parse.Cloud.define("queryGovDataPlacesInfo", function(request, response) {

    var url = "https://data.medicare.gov/resource/yv7e-xc69?measure_id=OP_20" 
    Parse.Cloud.httpRequest({
        url: url}).then(function(httpResponse) {

            response.success(httpResponse.data);

        }, function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
            response.error('Request failed with response code ' + httpResponse.status);
        });

});

//  Query emergency places data from data.gov api other than OP_20
//==========================================================================
// Parse.Cloud.define("queryGovDataPlacesInfoDetails", function(request, response) {

//     var url = "https://data.medicare.gov/resource/yv7e-xc69?measure_id=OP_18b" 
//     Parse.Cloud.httpRequest({
//         url: url}).then(function(httpResponse) {
//             console.log("success getting result" + httpResponse.status)
//             response.success(httpResponse.data);

//         }, function(httpResponse) {
//             console.error('Request failed with response code ' + httpResponse.status);
//             response.error('Request failed with response code ' + httpResponse.status);
//         });

// });

function queryGovDataPlacesInfoDetails(mesure){

    var url = "https://data.medicare.gov/resource/yv7e-xc69?measure_id=" + mesure
    return Parse.Cloud.httpRequest({ url: url}).then(function(httpResponse) {

        console.log("success getting result with code: " + httpResponse.status)
        return httpResponse.data

    }, function(httpResponse) {

        console.error('Request failed with response code ' + httpResponse.status);
        return Parse.Promise.error('Request failed with response code ' + httpResponse.status);
    }); 
}

function updatingDataForAllMesures(){

    var i = 0
    var promises = []

    for (var index in govDataMesuresIds){   
        console.log(i++)
        var mesure = govDataMesuresIds[index]
        promises.push(updateGovDataOnParseForMesure(mesure));
    }

    return Parse.Promise.when(promises)

    // .then(function(result) {
    //     // console.log("success Updating all data" + result)
    //     return result

    // }, function(error) {
    //     return Parse.Promise.error(error);
    // }); 

    // return updateGovDataOnParseForMesure(govDataMesuresIds[0]).then(function(dataGovPlaces) {

    //     console.log("Mesure : " + govDataMesuresIds[0] + " updated")
    //     return updateGovDataOnParseForMesure(govDataMesuresIds[1])

    // }).then(function(dataGovPlaces) {

    //     console.log("Mesure : " + govDataMesuresIds[1] + " updated")
    //     return updateGovDataOnParseForMesure(govDataMesuresIds[2])
        
    // }).then(function(dataGovPlaces) {

    //     console.log("Mesure : " + govDataMesuresIds[2] + " updated")
    //     return updateGovDataOnParseForMesure(govDataMesuresIds[3])
        
    // }).then(function(dataGovPlaces) {

    //     console.log("Mesure : " + govDataMesuresIds[3] + " updated")
    //     return updateGovDataOnParseForMesure(govDataMesuresIds[4])
        
    // }).then(function(dataGovPlaces) {

    //     console.log("Mesure : " + govDataMesuresIds[4] + " updated")
    //     return updateGovDataOnParseForMesure(govDataMesuresIds[5])
        
    // }).then(function(dataGovPlaces) {

    //     console.log("Mesure : " + govDataMesuresIds[5] + " updated")
    //     return updateGovDataOnParseForMesure(govDataMesuresIds[6])
        
    // }).then(function(dataGovPlaces) {

    //     console.log("Mesure : " + govDataMesuresIds[6] + " updated")
    //     return updateGovDataOnParseForMesure(govDataMesuresIds[7])
        
    // }).then(function (dataGovPlaces) {

    //         console.log("Mesure : " + govDataMesuresIds[7] + " updated")
    //         return dataGovPlaces

    //   }, function(error) {
    //         // handle error
    //         console.log(error);
    //         return Parse.Promise.error(error);
    // });

}

function updateGovDataOnParseForMesure(mesure){

    console.log("Mesure : " + mesure + " is updating")
    return queryGovDataPlacesInfoDetails(mesure).then(function(emergencyPlacesArray) {
        console.log("Got gov data")

        var promises = []
        var parse_objects = []
        for (var index in emergencyPlacesArray){   

            var place_item = emergencyPlacesArray[index]
            promises.push(updateDataGovPlaceOnParse(place_item));
        }
        return Parse.Promise.when(promises)

    }).then(function(dataGovPlaces) {

        // var facilities = []
        // var facilityPromises = []
        // console.log("dataGovPlaces count: " + dataGovPlaces.length)
        // for (var index in dataGovPlaces){  

        //     var dataGovPlace = dataGovPlaces[index]
        //     facilityPromises.push(facilityModule.updateFacilityWithGovData(dataGovPlace)); 
        // }

        return dataGovPlaces
        
      }).then(function (dataGovPlaces) {

            return dataGovPlaces

      }, function(error) {
            // handle error
            console.log(error);
            return Parse.Promise.error(error);
    });

}

//  Update each parse facility on parse with updated gov data or create new facilities
//=======================================================================================

Parse.Cloud.define("updateGovDataOnParseForAllMesures", function(request, response) {

     updatingDataForAllMesures().then(function(result) {

        console.log("success Updating all data" + result) 
        response.success(result)

      }, function(error) {
            // handle error
            console.log(error);
            response.error(error)
      });
})


Parse.Cloud.define("updateGovDataOnParse", function(request, response) {

      Parse.Cloud.run('queryGovDataPlacesInfo', {}).then(function(emergencyPlacesArray) {

            //Update the gov data places with the new data received from the api
            var promises = []
            var parse_objects = []
            for (var index in emergencyPlacesArray){   

                var place_item = emergencyPlacesArray[index]
                promises.push(updateDataGovPlaceOnParse(place_item));
            }
            return Parse.Promise.when(promises)

      }).then(function(dataGovPlaces) {

        //Update facilities with the update gov places
        // var facilities = []
        // var facilityPromises = []
        // console.log("dataGovPlaces count: " + dataGovPlaces.length)
        // for (var index in dataGovPlaces){  

        //     var dataGovPlace = dataGovPlaces[index]
        //     facilityPromises.push(facilityModule.updateFacilityWithGovData(dataGovPlace)); 
        // }
        // return Parse.Promise.when(facilityPromises)

        //Return the govPlaces instead : - We don't create facilities with the gov data directly. Facilities should be created using google places
        return dataGovPlaces
        
      }).then(function (dataGovPlaces) {

            response.success(dataGovPlaces)

      }, function(error) {
            // handle error
            console.log(error);
            console.log("Failed updateGovDataOnParse")
            response.error()
      });
})

//  Update a gov data in Parse or create a new one if the place wasn't on parse
//=======================================================================================

function updateDataGovPlaceOnParse(place_item){

    var query = new Parse.Query("DataGovPlace").equalTo('provider_id',  place_item.provider_id)

    return query.find({useMasterKey: true}).then(function(dataGovPlaces) {

        if(dataGovPlaces[0]){

            var dataGovPlace = dataGovPlaces[0]
        	//Gov data already exists => Update the required attributes
            // var mesure = place_item.measure_name
            // var updatedMesure = mesure.replace(/\s/g, "_") + "_score"
            var score = place_item.score
            // console.log(updatedMesure)
            // console.log(updatedMesure + ": " + place_item.score)
            if(place_item.score === "Not Available"){
                score = "Unavailable"
            }
            // dataGovPlace.set(updatedMesure,score );
            dataGovPlace.set(place_item.measure_id, score);
        	// dataGovPlace.set("score", place_item.score);
			// dataGovPlace.set("measure_id", place_item.measure_id);
			// dataGovPlace.set("measure_start_date", place_item.measure_start_date);
			// dataGovPlace.set("measure_end_date", place_item.measure_end_date);

            return dataGovPlace.save()

        }else{
            console.log("newDataGovPlace")
        	//New gov data
            var newDataGovPlace =  createDataGovPlace(place_item)
            return newDataGovPlace.save()
        }

    }).then(function(dataGovPlace) {

        return dataGovPlace

      }, function(error) {
        console.log("Failed updateDataGovPlaceOnParse")
        return Parse.Promise.error(error);
    }); 
}

//  Create a Gov Data Parse object with place item from gov data
//=======================================================================================

function createDataGovPlace(place_item){

    var place_item_addr = place_item.human_address_json
    var human_address_json = place_item.location.human_address
    var human_address_object = JSON.parse(human_address_json)
    var address = human_address_object.address
    var state_short = human_address_object.state
    var zip_code = human_address_object.zip

    var provider_id = place_item.provider_id
    var condition = place_item.condition
    var score = place_item.score
    var hospital_name = place_item.hospital_name
    if (place_item.location.latitude && place_item.location.longitude) {

        var latitude =  parseFloat(place_item.location.latitude)
        var longitude =  parseFloat(place_item.location.longitude)
        var result_string = "longitude:" + longitude + " :  latitude: " + latitude 
        // console.log(result_string)
        var location = new Parse.GeoPoint({latitude: latitude, longitude: longitude})
    }
    
    var city = place_item.city
    var measure_id = place_item.measure_id
    var county_name = place_item.county_name
    var sample = place_item.sample
    var measure_end_date = place_item.measure_end_date
    var measure_start_date = place_item.measure_start_date
    var phone_numer = place_item.phone_number.phone_number

	var DataGovPlace = Parse.Object.extend("DataGovPlace");
	var dataGovPlace = new DataGovPlace();
    dataGovPlace.set("hospital_name", hospital_name);
    dataGovPlace.set("provider_id", provider_id);
    dataGovPlace.set("condition", condition);
    dataGovPlace.set("location", location);
    dataGovPlace.set("city", city);
    dataGovPlace.set("score", score);
    var mesure = place_item.measure_name
    var updatedMesure = mesure.replace(/\s/g, "_") + "_score"
    var placeScore = place_item.score
    if(placeScore === "Not Available"){
        placeScore = "Unavailable"
    }
    // dataGovPlace.set(updatedMesure,placeScore );
    // dataGovPlace.set(updatedMesure, place_item.score);

    dataGovPlace.set(measure_id, place_item.score);
    // dataGovPlace.set("measure_id", measure_id);
    dataGovPlace.set("measure_start_date", measure_start_date);
    dataGovPlace.set("measure_end_date", measure_end_date);
    dataGovPlace.set("county_name", county_name);
    dataGovPlace.set("phone_numer", phone_numer);
    dataGovPlace.set("state_short", state_short);
    dataGovPlace.set("zip_code", zip_code);
    dataGovPlace.set("human_address_json", human_address_json);
    dataGovPlace.set("address", address);

    if(location){
        dataGovPlace.set("location", location);
    }

    return dataGovPlace

}