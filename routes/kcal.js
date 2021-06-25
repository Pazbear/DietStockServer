const express = require('express')
const router = express.Router()
const connection = require('../config/sqlConfig')

router.post('/saveKcalLog', (req, res)=>{
    console.log(req.body)
    console.log('/saveKcalLog 진입')
    connection.query(`insert into log_kcal(user_no, low, high, start_kcal, end_kcal, updated_dt)
    values(${req.body.user_no}, ${req.body.low}, ${req.body.high}, ${req.body.start_kcal}, ${req.body.end_kcal}, '${req.body.date}');`,
    (err, result)=>{
        if(err){
            console.log(err);
            return res.send({success:false, err:err})
        }
        console.log('/saveKcalLog success')
        return res.send({success:true})
    })
})

router.get('/getUserKcalLog', (req, res)=>{
    console.log('getUserKcalLog')
    connection.query(`select * from log_kcal where user_no=${req.query.user_no} and updated_dt >= date_sub(now(), INTERVAL 7 DAY);`,(err,result)=>{
        if(err){
            console.log(err)
            console.log("getUserKcalLog 실패")
            return res.json({success:false, err:701})
        }
        console.log("getUserKcalLog 성공")
        return res.json({success:true, result:result})
    })
})

router.post('/getDailyKcal', (req, res)=>{
    console.log('getDailyKcal')
    connection.query(`select sum(food.kcal) as sumkcal from log_food, food 
    where log_food.food_no=food.food_no and user_no=${req.body.user_no}
     and date_format(updated_dt, '%Y-%m-%d')=str_to_date('${req.body.date}', '%Y-%m-%d')`,
    (err, result)=>{
            if(err){
                console.log(err)
                console.log("getDailyKcal 실패")
                return res.json({success:false, err:701})
            }
            console.log("getDailyKcal 성공")
            return res.json({success:true, result:result})
        })
})



module.exports = router;