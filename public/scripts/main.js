//Helper functions.
function getElementsByClassName(className) {
    if(className === undefined || className === null || typeof className !== "string") { throw "'className' must be a valid string!"; }
    
    var returnArray = [];
    var elements = document.getElementsByClassName(className);
    for(var i = 0; i < elements.length; i++) {
        returnArray.push(elements[i]);
    }

    return returnArray;
}

function formatDate(date) {
    if(Object.prototype.toString.call(date) !== "[object Date]") { throw "Input must be a valid Date!"; }
    return date.getFullYear() + "-" + formatNumber(date.getMonth() + 1) + "-" + formatNumber(date.getDate()) + " " + 
            formatNumber(date.getHours()) + ":" + formatNumber(date.getMinutes()) + ":" + formatNumber(date.getSeconds());
}

function formatNumber(num) {
    if(typeof num !== "number") { throw "Input must be a valid number!"; }
    return (num >= 0 && num <= 9 ? "0" + num.toString() : num.toString());
}

//Firebase events.
var messages = firebase.database().ref("chat");
var messageArray = [];
var vue = null;

firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
        document.getElementById("uid").value = user.uid;
        
        document.getElementById("googleLoginLink").style.display = "none";
        document.getElementById("logoutLink").style.display = "block";
        document.getElementById("loginLink").style.display = "none";
        document.getElementById("loginNotice").style.display = "none";
        document.getElementById("loginBlock").style.display = "none";
        document.getElementById("chatMessages").style.display = "block";
        document.getElementById("chatBlock").style.display = "block";

        messages.on("value", function(data) {
            var msgs = data.val();
            var chatMessages = document.getElementById("chatMessages");
            
            messageArray.splice(0, messageArray.length);

            for(var key in msgs) {
                var message = msgs[key];
                message.key = key;
                messageArray.push(message);
            }
            
            if(chatMessages.children.length > 0) {
                chatMessages.children[chatMessages.children.length - 1].scrollIntoView();
            }
        });
    }
    else {
        document.getElementById("googleLoginLink").style.display = "block";
        document.getElementById("logoutLink").style.display = "none";
        document.getElementById("loginLink").style.display = "block";
        document.getElementById("loginNotice").style.display = "table";
        document.getElementById("loginBlock").style.display = "none";
        document.getElementById("chatMessages").style.display = "none";
        document.getElementById("chatBlock").style.display = "none";
    }
});

//Main code.
window.addEventListener("DOMContentLoaded", documentLoaded);

function documentLoaded() {
    document.getElementById("chatForm").addEventListener("submit", onSubmit);
    document.getElementById("loginForm").addEventListener("submit", onLoginSubmit);

    vue = new Vue({
        el: "#chatMessages",
        data: {
            messages: messageArray
        },
        methods: {

        }
    });
}

function onSubmit(event) {
    event.preventDefault();
    
    var uid = document.getElementById("uid").value;
    var name = document.getElementById("chatName").value;
    var message = document.getElementById("chatMessage").value;
    var timestamp = Date.now();

    let database = firebase.database();

    database.ref("chat").push({
        name: name,
        message: message,
        timestamp: timestamp,
        uid: uid
    });

    document.getElementById("chatMessage").value = "";
}

function onLoginSubmit(event) {
    event.preventDefault();

    firebase.auth().signInWithEmailAndPassword(document.getElementById("email").value, document.getElementById("password").value)
        .then(function() {
            
        })
        .catch(function(error) {
            console.log(error.message, error.code);
            alert("Invalid username or password!");
        });
}

function login() {
    document.getElementById("googleLoginLink").style.display = "none";
    document.getElementById("loginLink").style.display = "none";
    document.getElementById("loginNotice").style.display = "none";
    document.getElementById("loginBlock").style.display = "table";
}

function loginWithGoogle() {
    firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider());
}

function logout() {
    firebase.auth().signOut()
        .then(function() {
            window.location.reload(true);
        })
        .catch(function(error) {
            alert("Couldn't sign out:\n" + error.message + " (" + error.code + ")");
        });
}

function deleteMessage(event) {
    firebase.database().ref("chat").child(event.currentTarget.id).remove();
}

function editMessage() {

}