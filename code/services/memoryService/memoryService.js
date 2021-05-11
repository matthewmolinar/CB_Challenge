/**
 * Type: Micro Service
 * Description: A short-lived service which is expected to complete within a fixed period of time.
 * @param {CbServer.BasicReq} req
 * @param {string} req.systemKey
 * @param {string} req.systemSecret
 * @param {string} req.userEmail
 * @param {string} req.userid
 * @param {string} req.userToken
 * @param {boolean} req.isLogging
 * @param {[id: string]} req.params
 * @param {CbServer.Resp} resp
 */

 function memoryService(req,resp){
    const client = new MQTT.Client();
    // current time in seconds since unix epoch.
    const currentTime = new Date().getTime() / 1000;
    const arrayProcesses = JSON.parse(req.params.body);
    const col = ClearBladeAsync.Collection('process_stats_2');
    const promiseArray = [];

    for (var prop in arrayProcesses) {
        if (Object.prototype.hasOwnProperty.call(arrayProcesses, prop)) {
            const collectionsItem = arrayProcesses[prop];
            var createTime = collectionsItem.create_time;
            var runningTime = currentTime - createTime;
            collectionsItem.runningTime = runningTime;
            // Adding time from platform since there is a mismatch betweeen device and platform
            collectionsItem.time = new Date().toISOString();
            // Since I'm using a different method in the python SDK, it records barely running
            // processes as null. Keeping these impacts the analytics.
            if (collectionsItem.memory_percent && collectionsItem.runningTime) {
                promiseArray.push(col.create(collectionsItem));
            }
        }
    }
    Promise.all(promiseArray).then(function() { resp.success('Success') });
}