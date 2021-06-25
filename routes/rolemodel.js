const express = require('express')
const router = express.Router()
const connection = require('../config/sqlConfig')

router.get('/getRolemodel',(req, res)=>{
    console.log("/getRolemodel start")
    connection.query(`select rolemodel.user_no, user.name, rolemodel.weight_gap,
     date(rolemodel.updated_dt) as date, user.beforeimage, user.afterimage
    from rolemodel, user where user.user_no = rolemodel.user_no
   order by rolemodel.weight_gap desc limit 3 ;`, (err, result)=>{
        if(err)
        {
            console.log("/getRolemodel failed")
            console.log(err)
            res.send({success:false, errcode : 900})
        }else{
            console.log("/getRolemodel success")
            console.log(result)
            res.send({success:true, result : result})
        }
        console.log("/getRolemodel end")
    })
})

module.exports = router;