const axios = require("axios");
const { getAuth, getGroupIdByName } = require("../utils/utils");
const { addStat } = require("../utils/stats");

const createGroup = async function ({ params }) {
    try {
        const auth = await getAuth();
        const groupName = params.group_name.toLowerCase();
        if (!groupName) {
            return {
                status: false,
                message: "Unable to create a group. You must provide a group name"
            }
        }
        const payload = {
            jsonrpc: "2.0",
            method: "hostgroup.create",
            params: {
                name: groupName
            },
            auth: auth,
            id: 1
        }

        await axios.post(
            `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
            payload
        );

        return {
            status: true,
            message: "New group named: " + groupName + " has been created successfully"
        }
    }
    catch (err) {
        addStat("requestError");
        console.log(err);
        return {
            status: false,
            message: "Unable to create a group. An unknown error has occurred"
        }
    }
}

const deleteGroup = async function ({ params }) {
    console.log("deleteGroup()")
    console.log({ params});
    addStat("requestError");
    try {

        const auth = await getAuth();
        const list = [params.group_name];
        const namesList = list.map(group => group.toLowerCase());
        const groupId = await getGroupIdByName({auth, namesList});

        if (!groupId) {
            return {
                status: false,
                message: "Unable to delete a group. Group with name: " + namesList + " does not exist"
            }
        }
        const payload = {
            jsonrpc: "2.0",
            method: "hostgroup.delete",
            params: [
                groupId[0].groupid
            ],
            auth: auth,
            id: 1
        }

        const res = await axios.post(
            `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
            payload
        );

        console.log({ deleteGroupResponse: res.data });

        return {
            status: true,
            message: "Group named " + namesList + "with ID: " + groupId[0].groupid + " has been deleted successfully"
        }
    }
    catch (err) {
        console.log(err);
        return {
            status: false,
            message: "Unable to delete a group. An unknown error has occurred"
        }
    }
}

exports.groupController = {
    createGroup,
    deleteGroup
}