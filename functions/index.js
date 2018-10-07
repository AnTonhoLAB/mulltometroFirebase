const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.firestore();

exports.addUser = functions.https.onRequest((req, res) => { 
    const userCollection = db.collection("user");
    const userToSave = req.body.data

    return userCollection.doc(userToSave.id).set(userToSave)
            .then(re => {
                return res.status(200).send(re._referencePath);
            }).catch(err => {
                return res.status(500).send(err);
            });
});

exports.addRoom = functions.https.onRequest((req, res) => {
    const userCollection = db.collection("user");
    const roomCollection = db.collection("room");
    const roomToSave = req.body.data


    return roomCollection.add(roomToSave)
            .then( roomSaved => {
                return db.runTransaction( transaction => {
                    return transaction.get(db.collection("user").doc(roomToSave.adminId))
                         .then( snapshot => {

                            var adminRoomArray = snapshot.data().adminRooms

                            if  (adminRoomArray && adminRoomArray.length) {
                                adminRoomArray.push('newfield');
                            } else {
                                adminRoomArray = ["oldField"];
                            }
                            console.log("setup array " + adminRoomArray);

                            return transaction.update(db.collection("user").doc(roomToSave.adminId), { adminRooms: adminRoomArray } );
                        });
                    });
                })
            .then( reess => {
                console.log("save transaction");
                
                return res.status(200).send({ data: roomToSave} );
            })
            .catch( err =>{
                console.log("deu ruim: " + err );
                return res.status(500).send( { erro: err } );
            })
});

exports.getRooms = functions.https.onRequest((req, res) => {

});

exports.functionModel = functions.https.onRequest((req, res) => {

});

exports.testServer = functions.https.onRequest((req, res) =>{
    res.status(200).send({"test": req.body})
});

