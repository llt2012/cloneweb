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
var json = JSON.parse(fs.readFileSync(__dirname + '/list.json', 'utf8'));
var downloadlinkjson = JSON.parse(fs.readFileSync(__dirname + '/downloadlink.json', 'utf8'));
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

app.post("/api/register", async (req, res) => {
    try {
        const { username, password: plainTextPassword, role } = req.body
        if (!(username && plainTextPassword))
            res.status(400).send("All input required")
        const oldUser = await User.findOne({ username })

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        password = await bcrypt.hash(plainTextPassword, 10);

        const user = await User.create({
            username,
            password,
            role
        })

        const token = jwt.sign({ user_id: user._id, username, role: user.role }, process.env.TOKEN_KEY,
            {
                expiresIn: "2h"
            })
        user.token = token
        res.status(201).json(user)
    } catch (error) {
        console.log(error)
    }
})


app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body
        if (!(username || password))
            res.status(400).json({ error: "All filed required" })
        // Validate if user exist in our database
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id, username, role: user.role },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            // save user token
            user.token = token;
            req.session.token = user.token
            res.status(200).json(user)
        }
        res.statusCode = 404;
        res.end('Cannot ' + req.method + ' ' + req.url);


    } catch (err) {
        console.log(err)
    }
})

app.get("/welcome", auth(["admin"]), (req, res) => {
    console.log(req.user)
    res.render("welcome", { user: req.user })
})

app.get("/course/:id?", (req, res) => {
    // Object.keys(json).forEach(function(key) {
    //     console.log(Object.keys(json[key]))
    //     if(req.params.id == key)
    //         res.status(200).json({data:json[key]})
    // });
    Object.keys(json).forEach(function (key) {
        if (req.params.id == json[key].name)
            res.status(200).json({ data: json[key].url, link: json[key].link })
    })
})

app.get("/download/:id?", (req, res) => {
    // Object.keys(json).forEach(function(key) {
    //     console.log(Object.keys(json[key]))
    //     if(req.params.id == key)
    //         res.status(200).json({data:json[key]})
    // });
    try {
        file = __dirname;
        Object.keys(downloadlinkjson).forEach(function (key) {
            if (req.params.id == downloadlinkjson[key].name) {
                file = file + downloadlinkjson[key].link
            }
        })

        console.log(file)
        filename = path.basename(file);
        mimetype = mime.lookup(file);

        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);

        filestream = fs.createReadStream(file);
        filestream.pipe(res);
    } catch (error) {
        console.log(error)
    }

})

app.get("/live", (req, res) => {

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
app.get("/", (req, res) => {
    if (!req.session.token) {
        res.render("login")
    } else {
        res.status(200).redirect("/live")
    }
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