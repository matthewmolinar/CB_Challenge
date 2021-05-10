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
    const arrayProcesses = JSON.parse(req.params.body);
    for (var prop in arrayProcesses) {
        if (Object.prototype.hasOwnProperty.call(arrayProcesses, prop)) {
            const collectionsItem = arrayProcesses[prop];
            // Adding time from platform since there is a mismatch betweeen device and platform
            collectionsItem.time = new Date().toISOString();
            const col = ClearBladeAsync.Collection('process_stats');
            col.create(collectionsItem).then(function() { resp.success('Success') });
        }
    }
}
