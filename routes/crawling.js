const axios = require('axios')
const express = require('express')
const router = express.Router()
const connection = require('../config/sqlConfig')

const getHtml = async(start, end) =>{

    try {
        var data =await axios.get("http://openapi.foodsafetykorea.go.kr/api/3bc9646e555440908ce7/I2790/json/"+start+"/"+end);
        return data.data.I2790.row;
    }catch(err){
        console.error(err);
    }
}

router.get('/saveFoodInfo',(req, res)=>{
    console.log("/saveFoodInfo start")
    var start = 5200;
    var end = 6199;
        
    let timerId = setInterval(()=>{
            if(end >53000)
                clearInterval(timerId);
            console.log("settimeout");
            getHtml(start, end).then((data)=>{
                data.map((datum)=>{
                    connection.query(`insert into food(name, kcal, carbs, protein, fat, sugar, natrium, cholesterol, food_image)
                     values("${datum.DESC_KOR}", ${datum.NUTR_CONT1 == "" ? "0":datum.NUTR_CONT1}, 
                     ${datum.NUTR_CONT2 == "" ? "0":datum.NUTR_CONT2}, ${datum.NUTR_CONT3 == "" ? "0":datum.NUTR_CONT3},
                      ${datum.NUTR_CONT4 == "" ? "0":datum.NUTR_CONT4},${datum.NUTR_CONT5 == ""  ? "0":datum.NUTR_CONT5}, 
                      ${datum.NUTR_CONT6 == "" ? "0":datum.NUTR_CONT6}, ${datum.NUTR_CONT7 == "" ? "0":datum.NUTR_CONT7}, '');`, (err, result)=>{
                             if(err){
                                 console.error(err);
                             }
                    })
                })
            })
            start+=1000;
            if(end>53000){
                end =53000;
            }else{
                end+=1000;
            }
            console.log(start, end);
        },120000);
    return res.send("success!!!!!");
})

module.exports = router;