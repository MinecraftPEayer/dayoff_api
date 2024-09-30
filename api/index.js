const jsdom = require("jsdom");
const express = require('express')

const app = express()

app.get("/", (req, res) => res.send("<style>html { width: 100%; height: 100%; } body { background-color: rgb(43, 43, 43); font-family: sans-serif; }</style><a href=\"/api/typhoon\" style=\"color: white\">https://typhoon-api.vercel.app/api/typhoon</a>"));

app.get('/api/typhoon', async (req, res) => {
    let resp = await fetch('https://www.dgpa.gov.tw/typh/daily/nds.html', {
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }
    })

    let html = await resp.text()

    let dom = new jsdom.JSDOM(html)
    let document = dom.window.document
    
    const CityName = document.querySelectorAll('[headers="city_Name"]');
    const Status = document.querySelectorAll('[headers="StopWorkSchool_Info"]');

    let data = []
    for (let i = 0; i < CityName.length; i++) {
        data.push({
            CityName: CityName[i].textContent,
            Status: Status[i].textContent.replace(/  /g, '\n').slice(0, -1)
        })
    }

    res.json(data)
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})

module.exports = app