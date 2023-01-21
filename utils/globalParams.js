const getCreateHostParams = (
    auth,
    hostname = "Test-TBD-5",
    groupId = "2",
    port = "10050"
) => {
    try {
        const params = {
            authToken: auth,
            port: port,
            hostName: hostname,
            groups: [{
                groupid: groupId,
            }, ],
        };
        return params;
    } catch (err) {
        return err;
    }
};

const getDeleteHostParams = (auth, hostname = "Test-TBD-4", hostId = "2") => {
    try {
        const params = {
            authToken: auth,
            hostName: hostname,
            params: [hostId],
        };
        return params;
    } catch (err) {
        return err;
    }
};

const getProblemsParams = (auth, hostIds = "10084") => {
    try {
        const params = {
            params: {
                hostids: hostIds,
                output: ["eventid", "name", "severity"],
            },
            authToken: auth,
        };
        return params;
    } catch (err) {
        return err;
    }
};

const getCreateTemplateParams = (
    auth,
    hostname = "Linux template",
    groupId = "2",
    port = "10050",
    templatename = "testTemplate",
    templateid = "11115"
) => {
    try {
        const params = {
            authToken: auth,
            port: port,
            hostName: hostname,
            name: templatename,
            // templateName: templatename,
            groups: [{
                groupid: groupId,
            }, ],
            templates: [{
                templateid: templateid,
            }, ],
        };
        return params;
    } catch (err) {
        return err;
    }
};
const getItemsParams = (auth, hostIds = "10541") => {
    try {
        const params = {
            params: {
                hostids: hostIds,
                output: ["itemid", "name"],
                with_triggers: true,
                search: {
                    key_: "system.cpu",
                },
                sortfield: "name",
            },
            authToken: auth,
        };
        return params;
    } catch (err) {
        return err;
    }
};

const getTrendParams = (auth, itemid = "44475") => {
    try {
        const params = {
            params: {
                itemids: itemid,
                output: [
                    "itemid",
                    "clock",
                    "num",
                    "value_min",
                    "value_avg",
                    "value_max",
                ],
                limit: "1",
            },
            authToken: auth,
        };
        return params;
    } catch (err) {
        return err;
    }
};

module.exports = {
    getCreateHostParams,
    getDeleteHostParams,
    getProblemsParams,
    getCreateTemplateParams,
    getItemsParams,
    getTrendParams,
};