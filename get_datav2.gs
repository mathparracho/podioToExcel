var credentials = {
  email : "[YOUR EMAIL HERE]",
  password : "[YOUR PASSWORD HERE]",
  client_id : "[YOUR CLIENT_ID HERE]",
  client_secret : "[YOUR CLIENT_SECRET HERE]"
}
//your credentials

var stop_in = {
  name : "clubs-teams",
  offset : 7,
  check : false
}
//gscript allows 6 min of runtime. To continue where it stopped, put the name and the number of the last excel file and turn check to "true"

var limit = 11000
//set the maximum value of rows the script can find in a podium's file.

var ids = [22861617,22861507,22861524,22872677,23301272,24581930,22979384,24398466,24529926,24416898,22979971]
var names = ["confederations","clubs-teams", "companies","competitions","gov","public-agents","athletics","professionals","university-ecosystem","schools","universities"]
//put the id and name of the apps, please put them respectively


//-------------------------------------------------------------------------------------------------------------------------------------------------//
function runThisFunction(){
  var offset = 0;
  
  //any time exception?
  if (stop_in.check == true){
    var index = names.indexOf(stop_in.name);
    var aux_ids = []; var aux_names = [];
    
    for (var i = index; i < ids.length;i++) aux_ids.push(ids[i]);
    for (var i = index; i < names.length;i++) aux_names.push(names[i]);
    
    ids = aux_ids;
    names = aux_names;  
    offset = (stop_in.offset + 1) * 1000;
  }
  
  
  for (var i = 0; i < ids.length; i++){
    podioToDrive_xlsx(ids[i], names[i],limit,offset);
    offset = 0;
  }
}

function podioToDrive_xlsx(appID, name, limit, offset) {
  var options = {"method" : "post"};
  var result = UrlFetchApp.fetch("https://podio.com/oauth/token?grant_type=password&username=" + credentials.email + "&password=" + credentials.password  + "&client_id=" + credentials.client_id + "&client_secret=" + credentials.client_secret,options);
  
  var json = result.getContentText();
  var data = JSON.parse(json);
  
  for(offset; offset < limit; offset += 1000){
    
    var url = "https://api.podio.com/item/app/"+appID+"/xlsx/?offset=" + offset.toString();
    
    var headers2 = {"Authorization": "OAuth2 "+data.access_token}  
    var options2 = {
      "method": "GET",
      "headers": headers2,
      "muteHttpExceptions": true,
    }
    
    var response2 = UrlFetchApp.fetch(url,options2);
    var rblob = response2.getBlob();
    
    //prevent 504 error (slow response from server)
    if (rblob.getContentType() == "text/html"){
      offset -= 1000;
      
    }else{
      var fileName = name + (offset/1000).toString()
      rblob.setName(fileName);
      DriveApp.createFile(rblob);
      var file = DriveApp.getFilesByName(fileName).next();
      if (file.getSize() < 7000){
        file.setTrashed(true);
        break;
      }
    }
  }
}
