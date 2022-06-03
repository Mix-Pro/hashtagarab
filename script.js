$('#usernameModal').modal('show')

$("#username").focus();

let notificationStatus;
if ("Notification" in window) {
  Notification.requestPermission(function(result) {
    notificationStatus = result;
  });
}

let username;

let msgColor = "rgb("+(128+Math.random()*128)+", "+(128+Math.random()*128)+", "+(128+Math.random()*128)+")"
let unseenMsgs = 0;

document.getElementById("usernameContinue").addEventListener("click",()=>{
  setUserName();
})

document.getElementById("username").addEventListener("keypress",(e)=>{
  if(e.key == "Enter"){
    setUserName();
  }
})

let setUserName = ()=>{
  username = document.getElementById("username").value;
  $('#usernameModal').modal('hide');
  $("#msgBox").focus();
  db.ref('chat').on("value",(snap)=>{
  var newChatLog = snap.val();
  if(newChatLog){
    for(messageID in newChatLog)
      if(!oldChatLog||!Object.keys(oldChatLog).includes(messageID)){
        if(yourMsgs.includes(messageID))
          yourMessage(newChatLog[messageID]["message"])
        else
          otherMessage(newChatLog[messageID]["message"],newChatLog[messageID]["name"])
      }
  }else{
    document.getElementById("chat").innerHTML="";
  }
  oldChatLog = newChatLog
})
}



document.getElementById("send").addEventListener("click",()=>{
  sendMessage(document.getElementById("msgBox").value);
  document.getElementById("msgBox").value ="";
})

document.getElementById("msgBox").addEventListener("keypress",(e)=>{
  if(e.key == "Enter"){
    sendMessage(document.getElementById("msgBox").value);
    document.getElementById("msgBox").value ="";
  }
})

let db = firebase.database();
let yourMsgs = [];
let sendMessage = (message)=>{
  if(message.length>0&&message.substring(0,1)=="/"){
    let command = message.substring(1)
    if(command == "clear")
      db.ref('chat').set({});
  }

  if(!username)
    username = "null"
  yourMsgs.push(db.ref('chat').push().key)
  db.ref('chat/'+yourMsgs[yourMsgs.length-1]).set({
    name:username,
    message: message
  })
}

let oldChatLog={};

let yourMessage = (message)=>{
  let msgDiv = document.createElement("div");
  msgDiv.classList.add("message");
  msgDiv.classList.add("float-right");

  let msgText = document.createElement("p")
  msgText.innerText = message
  msgText.style.marginBottom = "5px";
  msgText.style.wordBreak="break-all";
  msgDiv.appendChild(msgText)

  if(message&&message.length>0&&message.substring(0,1)=="/"){
    let command = message.substring(1)
    if(command.length>2&&command.substring(0,3) == "js "){
      let code = command.substring(3);
      eval(code);
    }else if(command.length>4&&command.substring(0,5) == "html "){
        let code = command.substring(5);
        let newEl = document.createElement("div");
        newEl.innerHTML = code
        msgDiv.appendChild(newEl)
    }
  }

  document.getElementById("chat").appendChild(msgDiv)

  window.scrollTo(0,document.body.scrollHeight);
}

let otherMessage = (message,name)=>{
  let msgDiv = document.createElement("div");
  msgDiv.classList.add("message");
  msgDiv.classList.add("float-left");
  msgDiv.style.backgroundColor = msgColor;

  let userText = document.createElement("small");
  userText.innerText = name;
  userText.style.wordBreak="break-all";

  let msgText = document.createElement("p");
  msgText.innerText = message;
  msgText.style.marginBottom = "5px";
  msgText.style.wordBreak="break-all";

  msgDiv.appendChild(userText)
  msgDiv.appendChild(msgText)

  if(message&&message.length>0&&message.substring(0,1)=="/"){
    let command = message.substring(1)
    if(command.length>2&&command.substring(0,3) == "js " && (!username ||!username.includes("NoJS")) ){
      let code = command.substring(3);
      eval(code);
    }else if(command.length>4&&command.substring(0,5) == "html " && (!username ||!username.includes("NoHTML"))){
        let code = command.substring(5);
        let newEl = document.createElement("div");
        newEl.innerHTML = code
        msgDiv.appendChild(newEl)
    }
  }

  document.getElementById("chat").appendChild(msgDiv)

  window.scrollTo(0,document.body.scrollHeight);

  if(notificationStatus == "granted" && document.visibilityState != "visible"){
    new Notification("New Message from "+name, { body: message});
    let titleText = "msg from "+name;
    unseenMsgs++;
    if(unseenMsgs>1)
      titleText = "("+unseenMsgs+") - "+titleText
    document.title = titleText;
  }
}

window.onfocus = function () { 
  unseenMsgs = 0;
  document.title = "Quick Chat";
}; 
