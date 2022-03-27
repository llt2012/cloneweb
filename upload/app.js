require("dotenv").config()

require("./config/database").connect()
const User = require("./model/user")
const express = require("express")
const auth = require("./middleware/auth")
const cors = require("cors")
const app = express()
const session = require("express-session")
const bcrypt = require("bcryptjs")
const mime = require('mime');
const fileSystem = require("os")
const jwt = require("jsonwebtoken")
const path = require("path")
const axios = require('axios');
var fs = require('fs');
var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var pathChrome = require('chromedriver').path;
const { Builder, Capabilities } = require('selenium-webdriver');
var caps = Capabilities.chrome();
caps.set('goog:loggingPrefs', { 'performance': 'ALL' })
//const prefs = new webdriver.logging.Preferences();
var request = require('request');
const { resolve } = require("path")
// @ts-check
const playwright = require('playwright');



app.use(express.json())
app.use(session({
    name: process.env.SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESS_SECRET,
    cookie: {
        maxAge: process.env.SESS_LIFETIME,
        sameSite: true,
    }
}))

app.get("/", (req, res) => {

    if (req.query.id != null) {
        //test1(req.query.id, req.headers);
        // if(req.headers["user-agent"].includes("Mobile"))
        // {
        //     test1(req.query.id, req.headers,res)
        // }else{
        //     test(req.query.id, req.headers).then(data => {
        //         res.status(200).json({ "link": data[0]})
        //     })
        // }
        getData(req.query.id, req.headers,res)
    } else
        res.render("stream")

})

async function getData(link, headers,res) {
    try{

    const browser = await playwright.webkit.launch();
    const context = await browser.newContext({ userAgent: headers["user-agent"],extraHTTPHeaders:{"accept-language":headers["accept-language"]}});
    const page = await context.newPage();

    // Log and continue all network requests
    page.route('**', (route, request) => {
        if(request.url().includes("master.m3u8"))
        {
            res.status(200).json({"link":request.url()})
        }
        route.continue();
    });

    const {data} = await axios.get(link);
    var regexConst = new RegExp(/https:\/\/streamsb\b(.*?).html+/g);
    let a = regexConst.exec(data)[0]
    await page.goto(a)
    await browser.close()
    }catch(error){
        res.status(200).json({"error":"Error"})
    }

}



function test(link, headers) {
    return new Promise(resolve => {
        var service = new chrome.ServiceBuilder(pathChrome).build();
        chrome.setDefaultService(service);
        result = ""
        //var options = new chrome.Options();
        //options.setLoggingPrefs(prefs)

        var driver = new webdriver.Builder()
            .forBrowser("chrome")
            //.setChromeOptions(new chrome.Options().setMobileEmulation({deviceName: 'iPhone X'}))
            // en-CA,en-US;q=0.9,en;q=0.8
            .setChromeOptions(new chrome.Options().addArguments("--user-agent=" + headers["user-agent"]))
            .withCapabilities(caps)
            .build();
        var regexConst = new RegExp(/https:\/\/streamsb\b(.*?).html+/g);
        request(link, function (error, response, body) {
            re = regexConst.exec(body)[0]
            driver.get(re).then(function () {
                driver.manage().logs().get("performance")
                    .then(function (entries) {
                        fs.writeFileSync("test.txt", JSON.stringify(entries))
                        fs.readFile('test.txt', function (err, data) {
                            if (err) {
                                throw err;
                            }
                            result = data.toString().match(/https:\/\/delivery(.*?)"}+/g)
                            if (result == null) {
                                result = data.toString().match(/https:\/\/www(\d)+?(.*?)\/master.m3u8+/g)
                            }
                            sub = data.toString().match(/accept-language(.*?)\",+/g)
                            // resolve([result[0].split("\\\"}")[0], sub[0].split(":")[1]])
                            resolve([result[0].split("\\\"}")[0]])

                            //result[0].split("\\\"}")[0]
                        });
                    })
            }).finally(() => {
                setTimeout(() => {
                    driver.quit()
                }, 1000)
            })
        });
    })
}

module.exports = app