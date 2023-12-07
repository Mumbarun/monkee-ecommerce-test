// const puppeteer = require('puppeteer')

const { start, newPage, end, deleteCookies, emulate, setHeader, authenticate, randomDevice, goTo, clickTo, fillInput, scroll, mouseMove, waitForSelector, waitForNavigation } = require('./controller/browser')
const { getRandom, sleep } = require('./controller/functions')

const userCredentials = {
    name: 'simon3fusco@gmail.com',
    pass: '1234'
}

describe('Avviamento App', () => {
    beforeAll(async () => {
        // browser = await puppeteer.launch(props)
        // page = await browser.newPage()
        const { browser, page, device } = await start()

        this.browser = browser
        this.pages.main = page
        this.device = device
    })

    // afterAll(async () => {
    //     await end(this.pages, this.browser)
    // })

    test("Login come amministratore", async () => {
        // await this.page.goto('http://localhost:8081')
        await goTo(this.pages.main, 'http://localhost:8081')
        await fillInput(this.pages.main, 'input#input-30', userCredentials.name, false)
        await sleep(250)
        await fillInput(this.pages.main, 'input#input-33', userCredentials.pass, false)

        await clickTo(this.pages.main, 'button.v-btn', false, true)
    }, 30000)

    // test("Crea un'altra pagina", async () => {
    //     const pag = await this.browser.newPage()

    //     await goTo(pag, 'http://localhost:8081')
    // })
})

describe('Prodotti', () => {
    test('Caricamento pagina', async () => {
        const { page } = await newPage(this.browser)
        this.pages.prod = page
    })
})

// describe('Signin test', () => {
//     it('test', () => {
//         const userCredentials = {
//             name: 'simon3fusco@gmail.com',
//             pass: '1234'
//         }

//         const mountedSignin = mount(Signin)

//         console.log('mountedSignin', mountedSignin)

//         const emailInput = mountedSignin.find('input#input-30')
//         console.log('emailInput', emailInput)
//         emailInput.element.value = userCredentials.name

//         const passInput = mountedSignin.find('input#input-33')
//         passInput.element.value = userCredentials.pass
//     })
// })
