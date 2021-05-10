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

function analyticsService(req,resp){
    const client = new MQTT.Client();
    const db = ClearBladeAsync.Database();

    const end = new Date();
    const start = new Date();
    start.setMinutes(end.getMinutes() - 30);
    const query = "SELECT * FROM process_stats WHERE time<='" 
    + end.toISOString() + "' AND time >='" + start.toISOString() + "'";

	db.query(query).then(
        function(data) {
            // Show max and min running times, and the process name.
            var maxRunningTimeSeconds = new Date(data[0].runningtime).getTime();
            var minRunningTimeSeconds = new Date(data[0].runningtime).getTime();
            var maxRunningProcess;
            var minRunningProcess;
            var maxMemoryPercentageUsed = data[0].memorypercent;
            var maxMemoryPercentageProcess;
            var minMemoryPercentageUsed = Number(data[0].memorypercent);
            var minMemoryPercentageProcess;
            var sumOfProcessRunTimes = 0;

            data.forEach(function (element) {
                const processName = element.processname;
                const memoryPercent = Number(element.memorypercent);
                const runningTimeInSeconds = new Date(element.runningtime).getTime();
                sumOfProcessRunTimes += runningTimeInSeconds;
                
                if (runningTimeInSeconds > maxRunningTimeSeconds) {
                    maxRunningTimeSeconds = runningTimeInSeconds;
                    maxRunningProcess = processName;
                }
                if (runningTimeInSeconds < minRunningTimeSeconds) {
                    minRunningTimeSeconds = runningTimeInSeconds;
                    minRunningProcess = processName;
                }
                if (memoryPercent > maxMemoryPercentageUsed) {
                    maxMemoryPercentageUsed = memoryPercent;
                    maxMemoryPercentageProcess = processName;
                }
                if (memoryPercent < minMemoryPercentageUsed) {
                    minMemoryPercentageUsed = memoryPercent;
                    minMemoryPercentageProcess = processName;
                }
            });

            const meanAllProcessRunTime = sumOfProcessRunTimes / data.length;
            const processStats = {
                meanAllProcessRunTime,
                maxRunningTimeSeconds,
                minRunningTimeSeconds,
                maxMemoryPercentageUsed,
                maxMemoryPercentageProcess,
                minMemoryPercentageUsed,
                minMemoryPercentageProcess
            };

            client.publish("analytics", JSON.stringify(processStats))
                .then(function () { resp.success("success") });
    });
}

