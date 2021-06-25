const express = require('express')
const { start } = require('pm2')
const router = express.Router()
const connection = require('../config/sqlConfig')


router.get('/getRanking/week/all',(req, res)=>{
    console.log("/getRanking/week/all 요청")
    connection.query(`select user.user_no, start_kcal from log_kcal, user where updated_dt in (select min(updated_dt) 
    from log_kcal where week(updated_dt) = week(now())) and bmigroup in (select bmigroup from user where user_no=${req.query.user_no}) order by user_no asc;`, (err1, start_kcal)=>{
                if(err1){
                    console.log(err1)
                    console.log("/getRanking/week/all 실패1")
                    return res.send({success:false, err:412})
                }
                connection.query(`select user.user_no,name, end_kcal from log_kcal, user where user.user_no =log_kcal.user_no and updated_dt in (select max(updated_dt)
                from log_kcal where week(updated_dt) = week(now()))  and bmigroup in (select bmigroup from user where user_no=${req.query.user_no}) order by user_no asc;`, (err2, end_kcal)=>{
                        if(err2){
                            console.log(err2)
                            console.log("/getRanking/week/all 실패2")
                            return res.send({success:true})
                        }
                        start_kcal.map((item, index)=>{
                            Object.assign(item, start_kcal[index], end_kcal[index])
                        })
                        start_kcal.map((item)=>{
                            item.kcal = item.end_kcal - item.start_kcal
                        })
                        function resultSort(a, b){
                            if(a.kcal == b.kcal)
                                return 0
                            return a.kcal > b.kcal ? -1:1
                        }
                        var result=[];
                        start_kcal.map((item)=>{
                            if(item.kcal!=null)
                                result.push(item);
                        })
                        result.sort(resultSort)
                        console.log("/getRanking/week/all 성공")
                        return res.send({success:true, result:result})
                    })
            })
})

router.get('/getRanking/month/all',(req, res)=>{
    console.log("/getRanking/month/all 요청")
    connection.query(`select user.user_no, start_kcal from log_kcal,user where updated_dt in (select min(updated_dt) 
    from log_kcal where month(updated_dt) = month(now())) and bmigroup in (select bmigroup from user where user_no=${req.query.user_no})  order by user_no asc;`, (err1, start_kcal)=>{
                if(err1){
                    console.log(err1)
                    console.log("/getRanking/month/all 실패1")
                    return res.send({success:false, err:412})
                }
                connection.query(`select user.user_no,name, end_kcal from log_kcal, user where user.user_no =log_kcal.user_no and updated_dt in (select max(updated_dt)
                from log_kcal where month(updated_dt) = month(now()))  and bmigroup in (select bmigroup from user where user_no=${req.query.user_no}) order by user_no asc;`, (err2, end_kcal)=>{
                        if(err2){
                            console.log(err2)
                            console.log("/getRanking/month/all 실패2")
                            return res.send({success:true})
                        }
                        start_kcal.map((item, index)=>{
                            Object.assign(item, start_kcal[index], end_kcal[index])
                        })
                        start_kcal.map((item)=>{
                            item.kcal = item.end_kcal - item.start_kcal
                        })
                        function resultSort(a, b){
                            if(a.kcal == b.kcal)
                                return 0
                            return a.kcal > b.kcal ? -1:1
                        }
                        var result=[]
                        start_kcal.map((item)=>{
                            if(item.kcal!=null)
                                result.push(item);
                        })
                        result.sort(resultSort)
                        console.log("/getRanking/month/all 성공")
                        return res.send({success:true, result:result})
                    })
            })
})

module.exports = router;