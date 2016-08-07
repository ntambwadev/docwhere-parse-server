var CronJob = require('cron').CronJob;
var cron = require('node-cron');

//  Schedule a cron job that runs every 30 minutes
//=======================================================================================

var job = new CronJob({
  cronTime: '*/30 * * * *',
  onTick: function() {

    /*
     * Runs every 30 minutes
     */
     runGovDataUpdate();

  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
job.start();


//  Updates all the gov data on parse and waiting time on facility objects
//=======================================================================================

function runGovDataUpdate(){

    Parse.initialize("oMVo1jEWRESQK5KOytehjyHsyIrVMP6DPt2IEhDv");
    Parse.serverURL = 'https://docwhereiosapp.herokuapp.com/parse';
    // Parse.serverURL = 'http://localhost:1337/parse'
    Parse.Cloud.run('updateGovDataOnParse',{}).then(function(result) {
        
        console.log("Succes updateGovDataOnParse")
        
    }, function(error) {
        console.log("Failed updateGovDataOnParse with error : " + error.message)
    });

}

//  Test Call
//=======================================================================================

function runTestCallToCloudCode(){

      Parse.initialize("oMVo1jEWRESQK5KOytehjyHsyIrVMP6DPt2IEhDv");
      Parse.serverURL = 'https://docwhereiosapp.herokuapp.com/parse';
      Parse.Cloud.run('hello',{}).then(function(result) {
        
        console.log("Succes hello")
        
    }, function(error) {
        console.log("Failed hello with error : " + error.message)
    });

}