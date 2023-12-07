async function sleep (ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

function loadingAnimation (msg, interval = 100) {
    var P = ['\\', '|', '/', '-']
    var x = 0
    return setInterval(function() {
        process.stdout.write('\r> ' + msg + ' ' + P[x++])
        x &= 3
    }, interval)
}

function stopAnimation (anim) {
    console.log('')
    return clearInterval(anim)
}

function getRandom (max = 1, min = 0, round = false) {
    const ran = Math.random() * (max - min) + min

    if (round) return Math.round(ran)

    if (max === 1 && min === 0) return ran

    return Math.round(ran)
}

function getRandomPerc (input, perc) {
    const max = input + ((input / 100) * perc)
    const min = input - ((input / 100) * perc)

    const res = getRandom(max, min)

    return res
}

module.exports = { sleep, loadingAnimation, stopAnimation, getRandom, getRandomPerc }