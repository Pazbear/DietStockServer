const express = require('express')
const router = express.Router()
const connection = require('../config/sqlConfig')
const multer = require('multer')

var _storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'uploads/')
    },
    filename:function(req, file, cb){
        cb(null, `food/${Date.now()}_${file.originalname}`)
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

router.post('/getFoodInfo', (req, res)=>{
    connection.query(`select * from food where name='${req.body.food_name}';`,
    (err, result)=>{
            if(err){
                console.log("getFoodInfo 실패")
                return res.json({success:false, err:701})
            }
            console.log("getFoodInfo 성공")
            return res.json({success:true, result:result})
        })
})

router.post('/getDailyFood', (req, res)=>{
    connection.query(`select name as food_name, kcal, serving, date_format(updated_dt, '%T') as updated_dt,
    carbs, protein, fat, log_food.food_image
     from log_food, food where user_no = ${req.body.user_no} and food.food_no = log_food.food_no 
    and date_format(updated_dt, '%Y-%m-%d')=str_to_date('${req.body.updated_dt}', '%Y-%m-%d');`,
    (err, result)=>{
            if(err){
                console.log(err)
                console.log("getDailyFood 실패")
                return res.json({success:false, err:701})
            }
            console.log("getDailyFood 성공")
            return res.json({success:true, result:result})
        })
})

router.post('/getRequestFoods', (req, res)=>{
    console.log(req.body)
    var allegicFoods = req.body.avoid_food =="" ? "" : req.body.avoid_food.split(',')
    console.log(allegicFoods)
    var strAllegicFoods = '';
    if(allegicFoods == ""){
        console.log("not allegic")
    }else{
        strAllegicFoods+=" where "
        allegicFoods.forEach((avoid_food,i) => {
            strAllegicFoods +=`isnull(`+avoid_food+`)`;
            if(allegicFoods.length-1 != i){
                console.log(allegicFoods.length , i)
                strAllegicFoods += ' and '
            }
        });
        console.log(strAllegicFoods)
    }
    var sql = `select food_name,kcal,carbs, protein, fat, food_image from requestFood_List ${strAllegicFoods};`
    console.log(sql)
    connection.query(sql,
    (err, result)=>{
            if(err){
                console.log(err)
                console.log("getRequestFoods 실패")
                return res.json({success:false, err:701})
            }
            console.log("getRequestFoods 성공")
            return res.json({success:true, result:result})
        })
})


router.post('/saveFoodLog/1', (req, res)=>{
    console.log("saveFoodLog/1 요청")
    console.log(req.body)
    connection.query(`insert into log_food(user_no, food_no, serving, updated_dt, food_image)
    values (${req.body.user_no}, ${req.body.food_no}, ${req.body.serving},now(), null);`
    ,(err, result)=>{
        if(err){
            console.log(err)
            console.log("saveFoodLog/1 DB 저장 실패")
            return res.json({success:false, err:err})
        }
        console.log("saveFoodLog/1 DB 저장 성공1")
        return res.json({success:true})
    })
})
            
router.post('/saveFoodLog/2', (req, res)=>{
    console.log("saveFoodLog/2 요청")
    console.log(req.file)
    upload(req, res, err=>{
        console.log(res.req.file)
        if(err){
            console.log("foodImage 저장 실패 or foodImage 없음");
            console.log(err);
            return res.json({success:false, err:401})
        }
        var Image={
            filePath : res.req.file.path,
            fileName : res.req.file.filename
        }
        connection.query(`insert into log_food(user_no, food_no, serving, updated_dt, food_image)
        values (${req.body.user_no}, ${req.body.food_no}, ${req.body.serving},now(), '${Image.fileName}');`
        ,(err, result)=>{
            if(err){
                console.log("saveFoodLog DB 저장 실패")
                console.log(err)
                return res.json({success:false, err:501})
            }
            console.log("saveFoodLog/2 DB 저장 성공2")
            return res.json({success:true})
        })
    })
})

router.post('/addFood', (req, res)=>{
    console.log("addFood 요청")
    console.log(req.body)
    connection.query(`insert into addFood(name) values('${req.body.name}');`
    ,(err, result)=>{
        if(err){
            console.log(err)
            console.log("addFood DB 저장 실패")
            return res.json({success:false, err:err})
        }
        console.log("addFood DB 저장 성공1")
        return res.json({success:true})
    })
})


module.exports = router;