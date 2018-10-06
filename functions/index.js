const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.firestore();

exports.addUser = functions.https.onRequest((req, res) => { 
    const userCollection = db.collection("user");
    const userToSave = req.body.data

    return userCollection.add(userToSave)
            .then(re => {
                return res.status(200).send(re._referencePath);
            }).catch(err => {
                return res.status(500).send(err);
            });
});

exports.addRoom = functions.https.onRequest((req, res) => {

    const roomCollection = db.collection("room");
    const roomToSave = req.body.data

    return roomCollection.add(roomToSave)
            .then(re => {
                console.log(re._referencePath);
                return res.status(200).send(re._referencePath);
            }).catch( err =>{
                console.log("deu ruim");
                return res.status(500).send(err);
        });
});

exports.getRooms = functions.https.onRequest((req, res) => {

});

exports.functionModel = functions.https.onRequest((req, res) => {

});

exports.testServer = functions.https.onRequest((req, res) =>{
    res.status(200).send({"test": req.body})
});

