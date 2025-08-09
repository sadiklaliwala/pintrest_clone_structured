require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const app = express();


app.get('/',(re1,res)=>{
  res.send("this is Home page")
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

const port = process.env.PORT || 5000 
app.listen(port,()=>{
  console.log(`Server is Running At http://localhost:${port}`);
})
