// this file is mostly copied from https://github.com/jmarceli/jest-selenium-browserstack-example/blob/master/test/automate.test.js

import webdriver from 'selenium-webdriver'
// it will download and use BrowserStackLocal binary file behind the scene
// you may check ~/.browserstack dir
import browserstack from 'browserstack-local'

const local = new browserstack.Local()
const until = webdriver.until
const By = webdriver.By

// see: https://www.browserstack.com/automate/capabilities
const capabilities = {
  project: 'trimet-mod-otp',
  browserName: 'IE',
  os: 'Windows',
  'browserstack.local': true,
  // 'browserstack.debug': true,
  'browserstack.user': process.env.BROWSERSTACK_USER,
  'browserstack.key': process.env.BROWSERSTACK_KEY
}

// see: https://www.browserstack.com/local-testing#modifiers
const BrowserStackLocalArgs = {
  key: capabilities['browserstack.key'],
  // verbose: true,
  onlyAutomate: true,
  folder: __dirname
}

const start = async () =>
  new Promise((resolve, reject) => {
    local.start(BrowserStackLocalArgs, error => {
      if (error) {
        reject(error)
      }
      resolve()
    })
  })

const stop = async () =>
  new Promise((resolve, reject) => {
    local.stop(function (error) {
      if (error) {
        reject(error)
      }

      resolve()
    })
  })

// const getElementById = async (driver, id, timeout = 5000) => {
//   const el = await driver.wait(until.elementLocated(By.id(id)), timeout)
//   return driver.wait(until.elementIsVisible(el), timeout)
// }

const getElementByClassName = async (driver, className, timeout = 120000) => {
  const el = await driver.wait(until.elementLocated(By.className(className)), timeout)
  return driver.wait(until.elementIsVisible(el), timeout)
}

describe('webdriver', () => {
  let driver

  beforeAll(async () => {
    try {
      // BrowserStackLocal has to be ready before webdriver initialization
      await start()
      driver = new webdriver.Builder()
        .usingServer('http://hub-cloud.browserstack.com/wd/hub')
        .withCapabilities(capabilities)
        .build()

      await driver.get(
        `http://${
          capabilities['browserstack.user']
        }.browserstack.com/test.html`
      )
    } catch (error) {
      console.error('connetion error', error)
    }
    // IMPORTANT! Selenium and Browserstack needs more time than regular Jest
  }, 10000)

  afterAll(async () => {
    try {
      await driver.quit() // ~ 11 s !
      await stop() // ~ 3 s
    } catch (error) {
      console.error('disconnection error', error)
    }
    // IMPORTANT! Selenium and Browserstack needs a lot of time!
  }, 20000)

  test(
    'test',
    async () => {
      // may help with debugging
      // const src = await driver.getPageSource()
      // console.log(src)
      //
      console.log('connecting to localhost')
      await driver.get('http://localhost:8080')
      console.log('connected to localhost')
      const div = await getElementByClassName(driver, 'otp')
      console.log('found div')
      console.log(div)
    },
    120000
  )
})
