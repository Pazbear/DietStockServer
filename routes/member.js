const express = require('express')
const router = express.Router()
const connection = require('../config/sqlConfig')
const multer = require('multer')

var _storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'uploads/')
    },
    filename:function(req, file, cb){
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== 'jpg' || ext !== 'png' || ext !== 'jpeg') {
            return cb(res.status(400).end('only jpg, png, jpeg is allowed'), false);
        }
        cb(null, true)
    }
})

var upload = multer({storage:_storage}).single("file");

router.post('/login', (req, res)=>{
    var inputData
    console.log(req.body)
    console.log("login 시도");
    connection.query(`select * from user where user_id='${req.body.user_id}'
    and password='${req.body.password}';`, (err, result)=>{
        if(err){
            console.error(err);
            res.send({success:false, err:501});
        }else{
            var userInfo={
                user_no:result[0].user_no,
                name:result[0].name,
                height:result[0].height,
                goal:result[0].goal
            }
            console.log(result[0]);
            res.send({success:true, result:userInfo})
        }
    })
})

router.post('/register', (req, res)=>{
    console.log("/register")
    upload(req, res, err=>{
        if(err){
            console.log("register image 저장 실패");
            console.log(err);
            return res.json({success:false, err})
        }
        var result={
            filePath : res.req.file.path,
            fileName : res.req.file.filename
        }
        var bmi = req.body.weight / (Math.pow(req.body.height, 2)/10000)
        var bmigroup;
        if(bmi <18)
            bmigroup = 1
        else if(bmi <20)
            bmigroup = 2
        else if(bmi <=22)
            bmigroup = 3
        else if(bmi <25)
            bmigroup = 4
        else if(bmi <= 27)
            bmigroup=5
        else if(bmi <30)
            bmigroup=6
        else if(bmi <=32)
            bmigroup=7
        else
            bmigroup=8
        connection.query(`insert into user(user_id, password, name, height, goal, beforeimage, issuperuser,weight, beforeweight, age, sex, bmi, bmigroup, activity)  
        values('${req.body.user_id}', '${req.body.password}', '${req.body.name}', ${req.body.height}, ${req.body.goal}, '${result.fileName}', 0,
        ${req.body.weight}, ${req.body.weight}, ${req.body.age}, ${req.body.sex}, ${bmi}, ${bmigroup},${req.body.activity});`, (err, result)=>{
            if(err){
                console.log("register 실패")
                console.log(err)
                return res.json({success:false, err})
            }
            console.log("register 저장")
            return res.json({success:true, result:result})
        })
    })
})

router.post('/getUserInfo', (req, res)=>{
    connection.query(`select name, height, goal, beforeimage, activity, age, bmi, weight, beforeweight,afterimage,sex from user
    where user_no=${req.body.user_no};`,
    (err, result)=>{
        if(err){
            console.log(err)
            return res.send({success:false, err:err})
        }
        console.log('getUserInfo success')
        return res.send({success:true, result:result})
    })
})

router.post('/setBeforeImage', (req, res)=>{
    upload(req, res, err=>{
        if(err){
            console.log("setBeforeImage 저장 실패");
            console.log(err);
            return res.json({success:false, err})
        }
        var Image={
            filePath : res.req.file.path,
            fileName : res.req.file.filename
        }
        connection.query(`update user set beforeimage='${Image.fileName}'
        where user_no=${req.body.user_no};`,(err, result)=>{
            if(err){
                console.log("setBeforeImage DB 저장 실패")
                return res.json({success:false, err:701})
            }
            console.log("setBeforeImage DB 저장 성공")
            return res.json({success:true, Image})
        })
    })
})

router.post('/setAfterImage', (req, res)=>{
    upload(req, res, err=>{
        if(err){
            console.log("afterImage 저장 실패");
            console.log(err);
            return res.json({success:false, err})
        }
        var Image={
            filePath : res.req.file.path,
            fileName : res.req.file.filename
        }
        connection.query(`update user set afterimage='${Image.fileName}'
        where user_no=${req.body.user_no};`,(err, result)=>{
            if(err){
                console.log("setAfterImage DB 저장 실패")
                return res.json({success:false, err:701})
            }
            console.log("setAfterImage DB 저장 성공")
            return res.json({success:true, Image})
        })
    })
})

router.post('/updateWeight', (req, res)=>{
    connection.query(`update user set weight =${req.body.weight}, bmi = ${req.body.weight} / (power(height, 2)/10000), 
    bmigroup =  CASE WHEN bmi <18 then 1 
    WHEN bmi <20 then 2
    WHEN bmi <=22 then 3
    WHEN bmi <25 then 4
    WHEN bmi <=27 then 5
    WHEN bmi <30 then 6
    WHEN bmi <=32 then 7
    ELSE 8 END
    where user_no = ${req.body.user_no}; `, (err, result)=>{
        if(err){
            console.log(err)
            return res.send({success:false, err : 407})
        }
        connection.query(`select * from user where user_no = ${req.body.user_no} and weight <= goal;`, (err, result)=>{
            if(result.length >0)
            {
                console.log("insert rolemodel")
                console.log(result)
                console.log(result[0].beforeweight, result[0].weight)
                connection.query(`insert into rolemodel(user_no, weight_gap, updated_dt) values (${req.body.user_no}, ${result[0].beforeweight}-${result[0].weight}, now());`
                ,(err, result)=>{
                    if(err){
                        console.log(err)
                        return res.send({success:false})
                    }
                    return res.send({success:true})
                })
            }else{
                return res.send({success:true})
            }
        })
    })
})

router.post('/updateHeight', (req, res)=>{
    connection.query(`update user set height=${req.body.height} where user_no = ${req.body.user_no}; `, (err, result)=>{
        if(err){
            console.log(err)
            return res.send({success:false, err: 407})
        }
        return res.send({success:true})
    })
})

router.post('/updateGoal', (req, res)=>{
    connection.query(`update user set goal=${req.body.goal} where user_no = ${req.body.user_no}; `, (err, result)=>{
        if(err){
            console.log(err)
            return res.send({success:false, err: 407})
        }
        return res.send({success:true})
    })
})


router.post('/getKcalByWeek',(req, res)=>{
    console.log(req.body);
    connection.query(`select week(updated_dt) as week, min(low) as low,max(high) as high
    from log_kcal where user_no=${req.body.user_no} group by week;`,
    (err1, highNLow)=>{
        if(err1){
            console.log("getKcalByWeek 실패1")
            console.log(err1);
            return res.json({success:false, err:702})
        }
        connection.query(`SELECT start_kcal, week(updated_dt) as week
        FROM log_kcal WHERE updated_dt IN ( 
            SELECT MIN(updated_dt) FROM log_kcal  where user_no=${req.body.user_no}
             GROUP BY week(updated_dt) 
            ) and user_no=${req.body.user_no} order by week asc;`, (err2, start)=>{
                if(err2){
                    console.log("getKcalByWeek 실패2")
                    console.log(err2);
                    return res.json({success:false, err:702})
                }
                connection.query(`SELECT end_kcal, week(updated_dt) as week
                FROM log_kcal WHERE updated_dt IN ( 
                    SELECT MAX(updated_dt) FROM log_kcal where user_no=${req.body.user_no}
                    GROUP BY week(updated_dt) 
                    ) and user_no=${req.body.user_no} order by week asc;`, (err3, end)=>{
                    if(err3){
                        console.log("getKcalByWeek 실패3")
                        console.log(err3);
                        return res.json({success:false, err:702})
                    }
                    var results = highNLow;
                    console.log(results)
                    function resultSort(a, b){
                        if(a.month == b.week)
                            return 0
                        return a.week > b.week ? 1:-1
                    }
                    results.sort(resultSort)
                    results.map((item, index)=>{
                        console.log(Object.assign(item, start[index],end[index]));
                    })
                    return res.send({success:true, results})
                })
            })
    })
})

router.post('/getFoodLogs', (req, res)=>{
    console.log(req.body);
    connection.query(`select user_no, count(name) as cnt, name from log_food, food
    where log_food.user_no = ${req.body.user_no} and food.food_no = log_food.food_no group by name order by cnt desc limit 10;`,
    (err, result)=>{
        if(err){
            console.log("getFoodLogs 실패")
            console.log(err);
            return res.json({success:false, err:703})
        }
        console.log("getFoodLogs 성공")
        return res.json({success:true, result})
    })
})

module.exports = router;