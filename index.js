const express = require('express');
const app = express()
const router = express.Router();
const path = require('path')
const cors = require('cors')
const fs = require('fs')
const bodyParser = require('body-parser')

require('console-stamp')(console, ['yyyy/mm/dd HH:MM:ss.l']);

const Port = 3000

let isDisableKeepAlive = false

app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(express.static('uploads'))

app.use('/api/member', require('./routes/member'))
app.use('/api/ranking', require('./routes/ranking'))
app.use('/api/rolemodel', require('./routes/rolemodel'))
app.use('/api/crawling', require('./routes/crawling'))
app.use('/api/food', require('./routes/food'))
app.use('/api/kcal', require('./routes/kcal'))


app.use((req, res, next)=>{
    if(isDisableKeepAlive){
        res.set(`Connection`, `close`)
    }
    next()
})

app.use(router.get('/', (req, res)=>{
    console.log("hi")
    return res.json({success:true})
}))



process.on(`SIGINT`, async ()=>{
    isDisableKeepAlive = true
    console.log(`try closing server`)
    await app.close(()=>{
        console.log(`server closed`)
        process.exit(0)
    })
})


app.listen(Port, ()=>{
    process.send(`ready`)
    console.log(`Server Listening on ${Port}`)
})