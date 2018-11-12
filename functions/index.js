const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.firestore();
admin.firestore().settings( { timestampsInSnapshots: true })

exports.setupUser = functions.https.onRequest((req, res) => {
    const userCollection = db.collection("user")
    const data = req.body.data
    userId = data.uid

    return userCollection.doc(userId).get()
        .then(docSnapshot => {
            if (docSnapshot.exists) {
                return res.status(200).send( { data: docSnapshot.data() } );
              } else {
                throw new functions.https.HttpsError('Does not exist', 'This user does not exist', 'server custom error')
              }  
        })
        .catch(err => {
            return res.status(500).send({ data: err });
        });
});

exports.addUser = functions.https.onRequest((req, res) => { 
    const userCollection = db.collection("user");
    const userToSave = req.body.data
    console.log("Criando user" + req.body.data.name);

    return userCollection.doc(userToSave.uid).set(userToSave)
        .then(re => {
            return res.status(200).send(re);
        })
        .catch(err => {
            return res.status(500).send(err);
        });
});

exports.addRoom = functions.https.onRequest((req, res) => {
    const userCollection = db.collection("user");
    const roomCollection = db.collection("room");
    var roomToSave = req.body.data;

    var doc = roomCollection.doc() 
    roomToSave.id = doc.id

    return roomCollection.doc(doc.id).set(roomToSave)
            .then( roomSaved => {
                return db.runTransaction( transaction => {
                    return transaction.get(db.collection("user").doc(roomToSave.adminId))
                         .then( snapshot => {

                            var adminRoomArray = snapshot.data().adminRooms

                            if  (adminRoomArray && adminRoomArray.length) {
                                adminRoomArray.push(roomToSave.id);
                            } else {
                                adminRoomArray = [roomToSave.id];
                            }
                            // roomToSave.id = roomSaved.id;
                            return transaction.update(db.collection("user").doc(roomToSave.adminId), { adminRooms: adminRoomArray } );
                        });
                    });
                })
            .then( reess => {
                return res.status(200).send( { data: roomToSave } );
            })
            .catch( err =>{
                console.log("deu ruim: " + err );
                return res.status(500).send( { erro: err } );
            })
});

exports.getAllRooms = functions.https.onRequest((req, res) => {
    const roomCollection = db.collection("room");
    const adminId = req.body.data.adminId

    return roomCollection.get() 
        .then (obj => {
            var rooms = []; 
            
            obj.forEach(doc => {
                var room = doc.data()
                room.id = doc.id
                if (room.users === null){
                    if (room.adminId === adminId) {
                        rooms.push(room);
                    }
                } else {
                    if (room.adminId === adminId ||  room.users.indexOf(adminId) > -1) {
                        rooms.push(room);
                    }
                }
            });
            return res.status(200).send( { data: rooms } );
        })
        .catch(err =>{
            console.log("deu ruim: " + err );
            return res.status(300).send({ data: err });
        });
});

exports.enterRoom = functions.https.onRequest((req, res) => {
    const roomCollection = db.collection("room");
    const userId = req.body.data.uid;
    const roomId = req.body.data.roomId;
    console.log("starto: " + req.body.data);
    
    return roomCollection.doc(roomId).get()
        .then(room => {
            var roomData = room.data()
            var users = roomData.users;

            if (users === null){
                users = [userId];
            } else {
                if (users.indexOf(userId) > -1) {
                    // throw new Error('This user is already in this room');
                    throw new functions.https.HttpsError('already-exists', 'This user is already in this room', 'server custom error')
                } else {
                    users.push(userId); 
                }
            }

            roomData.users = users
            roomCollection.doc(roomId).set(roomData)
            
            return res.status(200).send( { data: roomData } );
        })
        .catch(err =>{
            console.log("ERROR: ", err);
            return res.status(500).send(  err.message  );
        });

});

exports.functionModel = functions.https.onRequest((req, res) => {

});

exports.testServer = functions.https.onRequest((req, res) =>{
    res.status(200).send({"test": req.body})
});

