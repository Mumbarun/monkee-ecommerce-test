function getDay (date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getTomorrow () {
    return addDays(getDay(new Date()), 1)
}

function getToday () {
    return getDay(new Date())
}

async function awaitTomorrow () {
    const now = new Date()
    const tomorrow = getTomorrow()
    const time = tomorrow.getTime() - now.getTime()

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

function addDays (date, days) {
    var res = new Date(date)
    res.setDate(res.getDate() + days)
    return res
}

function addHours (date, hours) {
    var res = new Date(date)
    res.setHours(res.getHours() + hours)
    return res
}

function addMinutes (date, minutes) {
    var res = new Date(date)
    res.setMinutes(res.getMinutes() + minutes)
    return res
}

function addSeconds (date, seconds) {
    var res = new Date(date)
    res.setSeconds(res.getSeconds() + seconds)
    return res
}

module.exports = { getDay, getTomorrow, getToday, awaitTomorrow, addDays, addHours, addMinutes, addSeconds }