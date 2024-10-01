const jsdom = require("jsdom");
const express = require('express')

let code = {
    'tp': '臺北市',
    'ntpc': '新北市',
    'kl': '基隆市',
    'tyc': '桃園市',
    'hc': '新竹市',
    'hcc': '新竹縣',
    'mlc': '苗栗縣',
    'tc': '臺中市',
    'ntct': '南投縣',
    'ylc': '雲林縣',
    'cyc': '嘉義縣',
    'cy': '嘉義市',
    'tn': '臺南市',
    'kh': '高雄市',
    'ptc': '屏東縣',
    'hlc': '花蓮縣',
    'ttct': '臺東縣',
    'phc': '澎湖縣',
    'km': '金門縣',
    'matsu': '連江縣',
    'ilc': '宜蘭縣',
    'chc': '彰化縣'
}

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
            cityName: CityName[i].textContent,
            status: Status[i].textContent.replace(/  /g, '\n').slice(0, -1)
        })
    }

    res.json(data)
})

app.get('/status/:city', async (req, res) => {
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

    const header_YMD = document.getElementsByClassName('Header_YMD')

    let data = []
    for (let i = 0; i < CityName.length; i++) {
        data.push({
            cityName: CityName[i].textContent,
            status: Status[i].textContent.replace(/  /g, '\n').slice(0, -1)
        })
    }

    let dataReturn = data.filter((data) => data.cityName === code[req.params.city])[0]

    res.send(`<html><head><title>${dataReturn.cityName} ${header_YMD.item(0).textContent.replace(/\n/g, '').replace(/            /g, ' ')}</title><meta property="og:type" content="website"><meta property="og:url" content=""><meta property="og:title" content="${dataReturn.cityName} ${header_YMD.item(0).textContent.replace(/\n/g, '').replace(/            /g, ' ')}"><meta property="og:description" content="${dataReturn.status}\n\n資料來源: https://www.dgpa.gov.tw/typh/daily/nds.html"></head><body><h1>${dataReturn.cityName} ${header_YMD.item(0).textContent}</h1><p>${dataReturn.status.replace(/\n/g, '<br>')}<br><br>資料來源: https://www.dgpa.gov.tw/typh/daily/nds.html</p></body></html>`)
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})

module.exports = app