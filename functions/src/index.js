"use strict";
exports.__esModule = true;
var functions = require("firebase-functions");
var Client = require('node-rest-client').Client;
var client = new Client();
// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.addToFollowing = functions.database.ref('/follow/{initiatorUid}/{interestedInFollowingUid}')
    .onCreate(function (event) {
    var initiatorUid = event.params.initiatorUid;
    var interestedInFollowingUid = event.params.interestedInFollowingUid;
    var rootRef = event.data.ref.root;
    var FollowingMeRef = rootRef.child('usersFollowingMe/' + interestedInFollowingUid + '/' + initiatorUid);
    return FollowingMeRef.set(true);
});
var sendLiveMessage = function (messageToken, imageName) {
    console.log('Sending: ', messageToken, imageName);
    var args = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "key=AAAA2EPESg8:APA91bF8sKGOqH1O0ZbDmbpRWwAGpUCrdYxGBD_KtCpueUtnEdaLjwEXyKp7OTDYT9aYJcovOScrBEn9NCw3bfXZaTKgAE0ideW-o2yA9fF_hNXfbanIxU2nvT3eCbHV4EFKfegbyjXN"
        },
        data: {
            to: messageToken,
            notification: {
                title: "Congratulations",
                body: "Your image " + imageName + " has been favorited!"
            }
        }
    };
    client.post("https://fcm.googleapis.com/fcm/send", args, function (data, response) {
        console.log(data);
        console.log(response);
    });
};
exports.notifyWhenImageIsFavorited = functions.database.ref('/images/{images}')
    .onUpdate(function (event) {
    var imageData = event.data.val();
    if (imageData.oldFavoriteCount < imageData.favoriteCount) {
        var uploadedBy = imageData.uploadedBy;
        var rootRef_1 = event.data.ref.root;
        return rootRef_1.child('/users/' + uploadedBy.uid).once('value')
            .then(function (snapshot) {
            var user = snapshot.val();
            var messageToken = user.messageToken;
            sendLiveMessage(messageToken, imageData.name);
            var imageRef = rootRef_1.child('/images/' + imageData.name + "/oldFavoriteCount");
            return imageRef.set(imageData.favoriteCount);
        });
    }
    else {
        return null;
    }
});
