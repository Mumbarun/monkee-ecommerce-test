const puppeteer = require('puppeteer')

// --- Disattiva i log ---
console.log = () => {}
// --- Disattiva i log ---

const devices = require('../db/devices.json')

const delayTimes = {
    fillInput: {
        on: false,
        max: 250,
        min: 15
    }
}

const { getRandom, sleep } = require('./functions')

async function start (lang, desktop = true) {
    const props = {
        args: [
            '--no-sandbox'

            // Stealth
            // '--enable-features=NetworkService',
            // '--cookie-authorization-policy=no-throw',
            // '--disable-features=IsolateOrigins,site-per-process',
            // '--disable-web-security',
            // '--disable-site-isolation-trials',
            // '--disable-extensions',
            // '--lang="it-IT'
        ],
        headless: 'old',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: false
        // executablePath: '/usr/bin/chromium-browser'
    }

    if (lang) props.args.push('--lang=' + lang)

    const browser = await puppeteer.launch(props)

    const { page, device } = await newPage(browser, desktop)

    // Navigator
    // await page.evaluateOnNewDocument(() => {
    //     // console.log('navigator', navigator.__proto__)
    //     delete navigator.__proto__.plugins
    //     navigator.__proto__.plugins = []

    //     delete navigator.__proto__.mimeTypes
    //     navigator.__proto__.mimeTypes = []

    //     // navigator.__proto__.languages.push(region.lang, region.name)

    //     // delete navigator.__proto__.language
    //     navigator.__proto__.language = region.lang
    // })

    console.log('> Scheda aperta con successo')

    return { browser, page, device }
}

async function newPage (browser, desktop = true) {
    const page = await browser.newPage()

    const device = await emulate(page, desktop)

    return { page, device }
}

async function end (page, browser) {
    if (Array.isArray(page)) {
        for (let i = 0; i < page.length; i++) {
            const pag = page[i]
            await deleteCookies(pag)
        }
    }
    else await deleteCookies(page)

    await browser.close()

    console.log('> Browser chiuso con successo')
    console.log('\n-------------------------------------------------\n')

    return
}

async function deleteCookies (page) {
    const client = await page.target().createCDPSession()
    await client.send('Network.clearBrowserCookies')

    const cookies = await page.cookies()
    if (cookies === undefined || cookies === null) {
        console.log("> Problema con l'eliminazione dei cookies")
        return false
    }

    console.log('> Cookies eliminati con successo')
    return true
}

async function emulate (page, desktop, region) {
    const { viewport, isMobile, throttling, network, userAgent, name, headers } = randomDevice(region, desktop)

    const device = {
        viewport,
        userAgent,
        name
    }

    await page.emulate(device)

    if (region) {
        if (Array.isArray(region.timeZone)) await page.emulateTimezone(region.timeZone[Math.floor(Math.random()*region.timeZone.length)])
        else await page.emulateTimezone(region.timeZone)
    }

    await page.emulateCPUThrottling(throttling)

    // if (network) {
    //     const { PredefinedNetworkConditions } = puppeteer
    //     const fast3G = PredefinedNetworkConditions[network]
    //     await page.emulateNetworkConditions(fast3G)
    //     console.log('> Emulazione di connessione di rete 3G (veloce)')
    // }

    // TODO => Risettare headers attrs []
    await setHeader(page, headers)

    if (region) console.log('> Emulazione device: "' + name + '" nella regione "' + region.name + '" riuscita')
    else console.log('> Emulazione device: "' + name + '"')

    return device
}

async function setHeader (page, headers) {
    try {
        if (headers) {
            await page.setExtraHTTPHeaders(headers)

            console.log('> Header HTTP impostati con successo')

            return headers
        } else return false
    } catch (err) {
        console.log("> Errore nell'impostazione degli header HTTP =>", err)
        return false
    }
}

async function authenticate (page, user, pass, server, log = false) {
    try {
        await page.authenticate({
            username: user,
            password: pass
        })
        console.log('> Autenticazione effettuata con successo al server', server)
    } catch (err) {
        if (log) console.error("> Errore durante l'autenticazione nel server " + server + " =>", err)
    } finally {
        return
    }
}

function randomDevice (region, desktop) {
    const getDevice = () => {
        if (typeof desktop) {
            return devices.find(dev => dev.name === desktop.name)
        } else if (typeof desktop === 'boolean') {
            return devices.find(dev => dev.isMobile === !desktop)
        } else {
            const randomness = Array.from(devices, dev => dev.randomness)

            const weightedArray = devices.reduce((acc, currentValue, index) => {
                return acc.concat(Array(randomness[index]).fill(currentValue))
            }, [])

            const randomIndex = Math.floor(getRandom() * weightedArray.length)
            return weightedArray[randomIndex]
        }
    }

    const el = getDevice()

    const isLandscape = el.display.width >= el.display.height

    let headers = {}

    for (const props in el.headers) {
        const element = el.headers[props]
        if (Array.isArray(element)) headers[props] = element[Math.floor(getRandom()*element.length)];
        else headers[props] = element
    }

    if (region) {
        const { lang } = region

        if (lang) headers['Accept-Language'] = lang + ( lang === 'en-GB' ? ';q=0.9' : ';q=0.9,en-US;q=0.8,en:q=0.7')
    }

    return {
        viewport: {
            ...el.display,
            isMobile: el.isMobile,
            hasTouch: el.hasTouch,
            isLandscape
        },
        headers,
        isMobile: el.isMobile,
        hasTouch: el.hasTouch,
        isLandscape,
        throttling: el.throttling,
        network: el.network,
        userAgent: el.userAgent,
        name: el.name,
        randomness: el.randomness,
        brand: el.brand,
        model: el.model,
        version: el.version,
    }
}

// async function checkTor (page) {
//     if (await goTo(page, 'https://check.torproject.org/')) {
//         const isTor = await page.$eval('body', el => el.innerHTML.includes('Congratulations. This browser is configured to use Tor'))

//         if (isTor) {
//             const element = await page.$('text/Your IP address appears to be')
//             const IpElement = await element.$('strong')
//             const IP = await page.evaluate(el => el.textContent, IpElement)
//             console.log("> Connesso alla rete Tor con l'indirizzo IP:", IP)
//         } else {
//             console.log('> Connessione alla rete Tor non riuscita')
//         }

//         return isTor
//     } else {
//         return false
//     }
// }

// async function newTorIp () {
//     return new Promise((resolve) => {
//         tr.newTorSession((err) => {
//             if (err) {
//                 console.log('> Errore nel cambio di indirizzo ip\n>', err)
//                 resolve()
//             } else {
//                 console.log('\n> ----------------------------------')
//                 console.log('> Cambio IP effettuato =>', new Date())
//                 console.log('> ----------------------------------\n')
//                 resolve()
//             }
//         })
//     })
// }

async function goTo (page, path, wait = true) {
    // const loading = loadingAnimation('Caricamento pagina: "' + path + '"')
    console.log('> Caricamento pagina: "' + path + '"')

    try {
        if (wait) await page.goto(path, { waitUntil: typeof wait === 'string' ? wait : "networkidle2", timeout: 0 })
        else await page.goto(path)
        // stopAnimation(loading)
        console.log('> Pagina caricata\n')
        return true
    } catch (err) {
        console.log('> Errore nel caricamento pagina: => ' + err)
        return false
    }
}

async function clickTo (page, el, isMobile = false, absolute = false) {
    const element = typeof el === 'string' ? await page.$(el) : el

    const click = async (x, y, width, height) => {
        const xRes = getRandom((x + width) - ((x + width) / 100) * 2, x - (x / 100) * 2)
        const yRes = getRandom((y + height) - ((y + height) / 100) * 2, y - (y / 100) * 2)

        if (isMobile) {
            console.log('> Click con il Touchscreen\n')
            if (absolute) await element.click()
            else await page.touchscreen.tap(xRes, yRes)
        }
        else {
            console.log('> Click con il mouse\n')
            await page.mouse.move(xRes, yRes)
            if (absolute) await element.click()
            else {
                await page.mouse.down()
                await page.mouse.up()
            }
        }

        // await sleep(getRandom(400, 200))

        return {
            x: xRes,
            y: yRes
        }
    }

    if (el === 'random') {
        const { width, height } = await page.viewport()

        return click(0, 0, width, height)
    } else if (element !== null) {
        console.log('> Elemento "' + el + '" trovato')
        await scroll(page, element, false, isMobile, 500)

        const { x, y, width, height } = await element.boundingBox()

        return click(x, y, width, height)
        // await element.click()
    } else {
        console.log('> Elemento "' + el + '" non presente nella pagina\n> Click fallito\n')
        return false
    }
}

async function fillInput (page, el, str, enterKeyPressed = true, isMobile = false) {
    if (!await clickTo(page, el, isMobile, false)) return false

    // await page.keyboard.type(str)
    if (str) {
        const arr = str.split('')

        for (let i = 0; i < arr.length; i++) {
            // const element = arr[i].toUpperCase()
            const element = arr[i]

            if (delayTimes.fillInput.on) await page.keyboard.press(element, { delay: getRandom(delayTimes.fillInput.max, delayTimes.fillInput.min) })
            else await page.keyboard.press(element)
        }

        if (delayTimes.fillInput.on) await sleep(getRandom(delayTimes.fillInput.max, delayTimes.fillInput.min))

        if (enterKeyPressed) await page.keyboard.press('Enter')

        console.log('> Testo inserito con successo')
        return str
    }
    else {
        console.log('> Nessun testo da scrivere')
        return false
    }
}

async function scroll (page, el = 250, long = false, isMobile = true, stepsLength = 350) {
    const display = await page.viewport()

    const scrl = async (y) => {
        if (isMobile) {
            const xRender = () => {
                const side = getRandom() > 0.5
                const resS = (side ? getRandom(display.width * 0.5, display.width * 0.25) : getRandom(display.width * 0.75, display.width * 0.5)) + getRandom(150, 0)
                // const resS = display.width / 2
                const resE = side ? getRandom(resS, resS - (display.width / 10)) : getRandom(resS + (display.width / 10), resS)

                return {
                    xS: Math.round(resS),
                    xE: Math.round(resE)
                }
            }
            const { xS, xE } = xRender()

            const yRender = () => {
                // const res = display.height - (display.height / 5)
                const res = display.height / 2
                return {
                    yS: Math.round(res)
                }
            }

            const { yS } = yRender()

            await page.touchscreen.touchStart(xS, yS)
            await page.touchscreen.touchMove(xE, yS - y)
            if (!long) await sleep(getRandom(500, 250))
            await page.touchscreen.touchEnd()
        } else {
            await mouseMove(page, display.width / 2, display.height / 2)
            await page.mouse.wheel({deltaY: y})
        }

        await sleep(getRandom(100, 50))
    }

    if (typeof el === 'number') {
        await scrl(el)

        return el
    } else {
        const element = typeof el === 'string' ? await page.$(el) : el

        const { y, height } = await element.boundingBox()

        const isPossible = height < (display.height - 50)

        if (isPossible) {
            for (let i = 0; i < Math.trunc(y / stepsLength); i++) {
                await scrl(stepsLength)
            }

            await scrl(y - (Math.trunc(y / stepsLength) * stepsLength))

            console.log('> Scroll con il' + isMobile ? 'TouchScreen' : 'Mouse')

            return y
        }
    }

    await sleep(getRandom(400, 200))
}

async function mouseMove (page, xIn, yIn) {
    const display = page.viewport()

    const x = xIn ? xIn : getRandom(display.width, 0)
    const y = yIn ? yIn : getRandom(display.height, 0)

    // for (let i = 0; i < 25; i++) {
    // }
    await page.mouse.move(x, y, { steps: getRandom(25, 5) })
    return { x, y }
}

async function waitForSelector (page, el = 'page') {
    console.log("> In attesa dell'" + 'elemento "' + el + '"')

    try {
        const res = await page.waitForSelector(el)

        return res
    } catch (err) {
        console.log("> Errore durante l' attesa dell'" + 'elemento "' + el + '" =>', err)

        return false
    }
}

async function waitForNavigation (page, waitUntil = 'networkidle2', timeout) {
    console.log('> In attesa della pagina')

    try {
        const res = await page.waitForNavigation({ waitUntil, timeout })

        return res
    } catch (err) {
        // console.log("> Errore durante l' attesa della pagina =>", err)

        // throw new Error("> Errore durante l' attesa della pagina =>", err)
        throw new Error(err)
    }
}

module.exports = { start, newPage, end, deleteCookies, emulate, setHeader, authenticate, randomDevice, goTo, clickTo, fillInput, scroll, mouseMove, waitForSelector, waitForNavigation }
