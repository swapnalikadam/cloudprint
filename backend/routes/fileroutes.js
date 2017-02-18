var fs=require("fs");
var path = require('path');
var writePath='/home/swapnali/Documents/filestobeprinted/';
var cmd=require('node-cmd');
exports.fileprint = function(req,res){
  // console.log("req",req.files);
  var filesArray = req.files;
  for(var i in filesArray){
    fs.readFile(filesArray[i].path, (err, data) => {
      if (err)
      {
        console.log("err ocurred",err);
      }
      else{
        fs.writeFile(writePath+filesArray[i].originalname, data, (err) => {
            if (err) {
              console.log("error occured");
            }
            else{
              cmd.get(
                'swift -A http://127.0.0.1:12345/auth/v1.0 -U test:tester -K testing upload user1 '+ writePath+filesArray[i].originalname,
                function(data){
                  console.log('the responses is : ',data)
                }
              );
              res.send({"code":200,
                        "success":"files handled sucessfully"});
            }
          });
        // console.log("data",data);
      }
    });
  }

}
