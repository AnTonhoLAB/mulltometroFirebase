const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.firestore();
admin.firestore().settings( { timestampsInSnapshots: true })

exports.createUserInFirstLogin = functions.auth.user().onCreate((user) => {
    const userCollection = db.collection("user");
    const userId = user.uid;
    var userToSave = {
        firstTime: true,
        name: user.email,
        email: user.email,
        uid: user.uid
    };
    return userCollection.doc(userId).set(userToSave);
});

exports.setupUser = functions.https.onRequest((req, res) => {
    const userCollection = db.collection("user")
    const data = req.body.data
    const userId = data.uid

    return userCollection.doc(userId).get()
        .then(docSnapshot => {
            var userToSave = docSnapshot.data()
            if (userToSave.firstTime) {
                userToSave.firstTime = false;
                userCollection.doc(userId).set(userToSave);
                throw new functions.https.HttpsError('Does not exist', 'This user does not exist', 'server custom error')
              } else {
                return res.status(200).send( { data: docSnapshot.data() } );
              }  
        })
        .catch(err => {
            return res.status(500).send({ data: err.message });
        });
});

exports.addUser = functions.https.onRequest((req, res) => { 
    const userCollection = db.collection("user");
    const userToSave = req.body.data
    console.log("Criando user" + req.body.data.name);

    return userCollection.doc(userToSave.uid).set(userToSave)
        .then(re => {
            return res.status(200).send({ data: re } );
        })
        .catch(err => {
            return res.status(500).send( { data: err });
        });
});

exports.getUser = functions.https.onRequest((req,res) => {
    const userCollection = db.collection("user");
    const userUid = req.body.data.uid
    return userCollection.doc(uid);
});

exports.getUserName = functions.https.onRequest((req, res) => {
    const userCollection = db.collection("user");
    const user = req.body.data.user


    userCollection.doc(user).get()
    .then(documentSnapShot => {
        return res.status(200).send( { data: documentSnapShot.data().name } );
    })
    .catch(err => {
        return res.status(501).send( { data: err} );
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
    const userToComparte = req.body.data

    const query = roomCollection.where("users", "array-contains", userToComparte);

    query.get()
    .then((snp) => {
        var rooms = [];
        snp.forEach((doc) => {
            rooms.push(doc.data())
        });

        return res.status(200).send( { data: rooms } );
    })
    .catch((err) => {
        console.log("getAllRooms error: " + err);
        return res.status(500).send( { erro: err } );
    });
    // return roomCollection.get() 
    //     .then (obj => {
    //         var rooms = [];             
    //         obj.forEach(doc => {
    //             var room = doc.data()
    //             room.id = doc.id
    //             if (room.users === null){
    //                 if (room.adminId === adminId) {
    //                     rooms.push(room);
    //                 }
    //             } else {
    //                 if (room.adminId === adminId ||  room.users.indexOf(adminId) > -1) {
    //                     rooms.push(room);
    //                 }
    //             }
    //         });
    //         return res.status(200).send( { data: rooms } );
    //     })
    //     .catch(err =>{
    //         console.log("deu ruim: " + err );
    //         return res.status(300).send({ data: err });
    //     });
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


