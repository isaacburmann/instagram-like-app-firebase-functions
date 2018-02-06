import * as functions from 'firebase-functions';

const Client = require('node-rest-client').Client;

const client = new Client();


// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const addToFollowing =
    functions.database.ref('/follow/{initiatorUid}/{interestedInFollowingUid}')
        .onCreate(event => {
            const initiatorUid = event.params.initiatorUid
            const interestedInFollowingUid = event.params.interestedInFollowingUid
            const rootRef = event.data.ref.root;
            const FollowingMeRef = rootRef.child('usersFollowingMe/' + interestedInFollowingUid + '/' + initiatorUid)
            return FollowingMeRef.set(true)
        });

const sendLiveMessage = (messageToken, imageName) => {
    console.log('Sending: ', messageToken, imageName);
    
    // Coloque a sua chave de autorizaçao (Authorization key) de mensagens aqui
    const args = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "key=******"
        },
        data: {
            to: messageToken,
            notification: {
                title: "Congratulations",
                body: `Your image ${imageName} has been favorited!`
            }
        }
    };

    client.post("https://fcm.googleapis.com/fcm/send", args, (data, response) => {
        console.log(data);
        console.log(response);
    });
};

export const notifyWhenImageIsFavorited =
    functions.database.ref('/images/{images}')
        .onUpdate(event => {

            const imageData = event.data.val();

            if (imageData.oldFavoriteCount < imageData.favoriteCount) {
                const uploadedBy = imageData.uploadedBy;
                const rootRef = event.data.ref.root;

                return rootRef.child('/users/' + uploadedBy.uid).once('value')
                    .then(snapshot => {
                        const user = snapshot.val();
                        const messageToken = user.messageToken;
                        sendLiveMessage(messageToken, imageData.name);
                        const imageRef = rootRef.child('/images/' + imageData.name + "/oldFavoriteCount");
                        return imageRef.set(imageData.favoriteCount);
                    });
            } else {
                return null;
            }
        });
