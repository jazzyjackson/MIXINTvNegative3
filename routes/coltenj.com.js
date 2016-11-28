const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs')

router.get('/', (req,res,next)=>{
  res.send('coltenj.com')
})

module.exports = router;