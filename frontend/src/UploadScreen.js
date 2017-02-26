import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Tree from 'react-file-tree';
import './App.css';
import Dropzone from 'react-dropzone';
import FontIcon from 'material-ui/FontIcon';
import {blue500, red500, greenA200} from 'material-ui/styles/colors';
import LoginScreen from './Loginscreen';

var apiBaseUrl = "http://localhost:4000/api/";

/*
Module:superagent
superagent is used to handle post/get requests to server
*/
var request = require('superagent');

class UploadScreen extends Component {
  constructor(props){
    super(props);
    this.state={
      role:'student',
      filesPreview:[],
      filesToBeSent:[],
      draweropen:false,
      printcount:10,
      printingmessage:'',
      printButtonDisabled:false
    }
  }
  componentWillMount(){
    // console.log("prop values",this.props.role);
    var printcount;
    if(this.props.role){
      if(this.props.role == 'student'){
        printcount = 5;
      }
      else if(this.props.role == 'teacher'){
        printcount =10;
      }
    }
    this.setState({printcount,role:this.props.role});
  }
  handleCloseClick(event,index){
    // console.log("filename",index);
    var filesToBeSent=this.state.filesToBeSent;
    filesToBeSent.splice(index,1);
    // console.log("files",filesToBeSent);
    var filesPreview=[];
    for(var i in filesToBeSent){
      filesPreview.push(<div>
        {filesToBeSent[i][0].name}
        <MuiThemeProvider>
        <a href="#"><FontIcon
          className="material-icons customstyle"
          color={blue500}
          onClick={(event) => this.handleCloseClick(event,i)}
        >clear</FontIcon></a>
        </MuiThemeProvider>
        </div>
      )
    }
    this.setState({filesToBeSent,filesPreview});
  }
  onDrop(acceptedFiles, rejectedFiles) {
      // console.log('Accepted files: ', acceptedFiles[0].name);
      var filesToBeSent=this.state.filesToBeSent;
      if(filesToBeSent.length < this.state.printcount){
        filesToBeSent.push(acceptedFiles);
        var filesPreview=[];
        for(var i in filesToBeSent){
          filesPreview.push(<div>
            {filesToBeSent[i][0].name}
            <MuiThemeProvider>
            <a href="#"><FontIcon
              className="material-icons customstyle"
              color={blue500}
              styles={{ top:10,}}
              onClick={(event) => this.handleCloseClick(event,i)}
            >clear</FontIcon></a>
            </MuiThemeProvider>
            </div>
          )
        }
        this.setState({filesToBeSent,filesPreview});
      }
      else{
        alert("You have reached the limit of printing files at a time")
      }

      // console.log('Rejected files: ', rejectedFiles);
}
handleClick(event){
  // console.log("handleClick",event);
  this.setState({printingmessage:"Please wait until your files are being printed",printButtonDisabled:true})
  var self = this;
  if(this.state.filesToBeSent.length>0){
    var filesArray = this.state.filesToBeSent;
    var req = request.post(apiBaseUrl+'fileprint');
    for(var i in filesArray){
        // console.log("files",filesArray[i][0]);
        req.attach(filesArray[i][0].name,filesArray[i][0])
    }
    req.end(function(err,res){
      if(err){
        console.log("error ocurred");
      }
      console.log("res",res);
      self.setState({printingmessage:'',printButtonDisabled:false,filesToBeSent:[],filesPreview:[]});
      alert("File printing completed")
      // self.props.indexthis.switchPage();
    });
  }
  else{
    alert("Please upload some files first");
  }
}
toggleDrawer(event){
  // console.log("drawer click");
  this.setState({draweropen: !this.state.draweropen})
}
handleDivClick(event){
  // console.log("event",event);
  if(this.state.draweropen){
    this.setState({draweropen:false})
  }
}
handleLogout(event){
  // console.log("logout event fired",this.props);
  var loginPage =[];
  loginPage.push(<LoginScreen appContext={this.props.appContext}/>);
  this.props.appContext.setState({loginPage:loginPage,uploadScreen:[]})
}
  render() {
    return (
      <div className="App">
      <MuiThemeProvider>
        <div>
        <AppBar
           title="Print Files"
           onLeftIconButtonTouchTap={(event) => this.toggleDrawer(event)}
         />
         <Drawer open={this.state.draweropen}>
         <div>
         User Profile
         <a href="#"><FontIcon
           className="material-icons customdrawerstyle"
           color={blue500}
           styles={{ top:10,}}
           onClick={(event) => this.toggleDrawer(event)}
         >clear</FontIcon></a>
         </div>
         <MenuItem
         onTouchTap={(event) => this.handleLogout(event)}>Logout</MenuItem>
         </Drawer>
         </div>
      </MuiThemeProvider>
          <div onClick={(event) => this.handleDivClick(event)}>
          <center>
          <div>
            You can print upto {this.state.printcount} files at a time since you are {this.state.role}
          </div>

          <Dropzone onDrop={(files) => this.onDrop(files)}>
                <div>Try dropping some files here, or click to select files to upload.</div>
          </Dropzone>
          <div>
          Files to be printed are:
          {this.state.filesPreview}
          </div>
          </center>
          <div>
          {this.state.printingmessage}
          </div>
      <MuiThemeProvider>
           <RaisedButton disabled={this.state.printButtonDisabled} label="Print Files" primary={true} style={style} onClick={(event) => this.handleClick(event)}/>
      </MuiThemeProvider>
          </div>
          </div>
    );
  }
}

const style = {
  margin: 15,
};

export default UploadScreen;
