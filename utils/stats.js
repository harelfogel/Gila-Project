const fs = require('fs')
const FILE_PATH = 'stats.json'

const addStat = (action) => {
    try {
        const stats = readStats()
        if (stats[action] && stats[action] > 1000000) {
            stats[action] = 1
        }
        else {
            stats[action] = stats[action] ? stats[action] + 1 : 1
        }
        dumpStats(stats)
    
    } catch (err) {
        console.error(err);
    }
}

// read json object from file
const readStats = () => {
    let result = {}
    try {
        if (fs.existsSync(FILE_PATH)) {
            result = JSON.parse(fs.readFileSync(FILE_PATH));
        }
        
    } catch (err) {
        console.error(err)
    }
    return result
}

// dump json object to file
const dumpStats = (stats) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(stats), { flag: 'w+' })
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    readStats,
    dumpStats,
    addStat
  };