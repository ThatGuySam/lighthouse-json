
const mql = require('@microlink/mql')
// const ReportGenerator = require("lighthouse/lighthouse-core/report/report-generator")

// console.log('ReportGenerator', ReportGenerator)


// Inspiration: https://github.com/vercel/integrations/blob/0e40ad16ff31bbf75d171ee332ac7898946ae0e7/lighthouse/api/lighthouse/index.js
async function auditUrl ( urlString ) {

    const { status, data } = await mql(urlString, {
        meta: false,
        retry: 3,
        filter: "insights",
        insights: {
            technologies: false,
            lighthouse: {
                maxWaitForload: 10000
            }
        }
    })


    const audits = []

    for (const [key, value] of Object.entries(data.insights.lighthouse.audits)) {
        // If audit doesn't have a numeric value then skip it
        if (!value.hasOwnProperty('numericValue')) continue


        audits.push({
            // name: key,
            ...value
        })

    }

    return audits
}


export default async function (req, res) {

    const urls = [
        'https://www.google.com/',
        'https://fastergoogle.com/'
    ]

    const urlScores = await Promise.all(urls.map(async ( urlString ) => {

        const audits = await auditUrl( urlString )

        return {
            url: urlString,
            timestamp: Date.now(),
            audits
        }
    }))

    // Set Cors Headers to allow all origins so data can be requested by a browser
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

    res.json(urlScores)
}