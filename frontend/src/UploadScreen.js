import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import {List, ListItem} from 'material-ui/List';
import ActionInfo from 'material-ui/svg-icons/action/info';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import FileFolder from 'material-ui/svg-icons/file/folder';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import {blue500, yellow600,red500, greenA200} from 'material-ui/styles/colors';
import EditorInsertChart from 'material-ui/svg-icons/editor/insert-chart';
import Tree from 'react-file-tree';
import Checkbox from 'material-ui/Checkbox';
import './App.css';
import Dropzone from 'react-dropzone';
import FontIcon from 'material-ui/FontIcon';
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
      printButtonDisabled:false,
      fileprintingscreen:[],
      previousfilesList:[]
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
    var fileprintingscreen=[];
    fileprintingscreen.push(
      <div>
        <center>
            <div>
              You can print upto {this.state.printcount} files at a time since you are {this.state.role}
            </div>

            <Dropzone onDrop={(files) => this.onDrop(files)}>
                  <div>Try dropping some files here, or click to select files to upload.</div>
            </Dropzone>
            <div>
            Files to be printed are:
            </div>
        </center>
        <div>
            {this.state.printingmessage}
        </div>
        <MuiThemeProvider>
             <RaisedButton disabled={this.state.printButtonDisabled} label="Print Files" primary={true} style={style} onClick={(event) => this.handleClick(event)}/>
        </MuiThemeProvider>
      </div>
    )
    this.setState({printcount,role:this.props.role,fileprintingscreen});
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
showpreviousFiles(event){
  var self=this;
  var req = request.get(apiBaseUrl + 'fileretrieve');
  req.end(function (err,res){
    if(err){
     console.log("some error ");
    }
    else{
      console.log("response from server",res.body);
      if(res.body.code=="200"){
        var filestobeDisplayed = res.body.result;
        var filenamesDiv=[];
        for(var i in filestobeDisplayed){
          filenamesDiv.push(
            <ListItem
              rightAvatar={<Avatar icon={<ActionAssignment />} backgroundColor={blue500} />}
              primaryText={filestobeDisplayed[i].name}
              leftCheckbox={<Checkbox onClick={(event) => self.handleFileCheck(event,i)}/>}
            />
          )
        }
        var fileDivContainer=[];
        fileDivContainer.push(
          <div className="previousfilesContainer">
          <MuiThemeProvider>
          <List>
      <Subheader inset={true}>Files</Subheader>
        {filenamesDiv}
    </List>
          </MuiThemeProvider>
          <MuiThemeProvider>
               <RaisedButton disabled={self.state.printButtonDisabled} label="Print Files" primary={true} style={style} onClick={(event) => self.handlePreviousFilesClick(event)}/>
          </MuiThemeProvider>
          </div>
        );
        self.setState({fileprintingscreen:fileDivContainer,draweropen:false,previousfilesList:res.body.result});
      }
    }
  })
}
handleFileCheck(event,index){
  console.log("event of file check", index,this.state.previousfilesList);
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
         onTouchTap={(event) => this.showpreviousFiles(event)}>Previous Files</MenuItem>
         <MenuItem
         onTouchTap={(event) => this.handleLogout(event)}>Logout</MenuItem>
         </Drawer>
         </div>
      </MuiThemeProvider>
          <div onClick={(event) => this.handleDivClick(event)}>
          <center>
          {this.state.filesPreview}

              {this.state.fileprintingscreen}
          </center>
          </div>
          </div>
    );
  }
}

const style = {
  margin: 15,
};

export default UploadScreen;
