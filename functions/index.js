const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const gsc = require('@google-cloud/storage')();
// const spaw = require('child-process-promise').spaw;

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

exports.saveToStorage = functions.storage.object().onFinalize((object) => {

    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.

    const img_url = 'https://firebasestorage.googleapis.com/v0/b/' + fileBucket + '/o/'
    + encodeURIComponent(filePath)
    + '?alt=media&token='
    + object.metadata.firebaseStorageDownloadTokens;

    
});

exports.syncUser = functions.https.onRequest((req,res) => {
    const userCollection = db.collection("user");
    const userUid = req.body.data.uid
    
    userCollection.doc(userUid).get()
    .then(docSnapShot => {
        const user = docSnapShot.data();
        return res.status(200).send( { data: user } );
    })
    .catch(err => {
        return res.status(501).send( { data: err} );
    });
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
                    return transaction.get(db.collection("user").doc(roomToSave.admin.uid))
                         .then( snapshot => {
                            var adminRoomArray = snapshot.get("rooms")
                            if  (Array.isArray(adminRoomArray)) {
                                adminRoomArray.push(roomToSave);
                            } else {
                                adminRoomArray = [roomToSave];
                            }
                            return transaction.update(db.collection("user").doc(roomToSave.admin.uid), { rooms: adminRoomArray } );
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

    const queryLikeUser = roomCollection.where("users", "array-contains", userToComparte);
    const queryLikeOnlyAdmin = roomCollection.where("admin", "==", userToComparte);
    
    var rooms = [];


    queryLikeOnlyAdmin.get()
    .then((snp)=> { // retunr only room taht user be only admin
        snp.forEach((doc) => {
            const data = doc.data();
            if (data.users.filter(e => e.name === data.admin).length === 0) {
                rooms.push(data)
            }
        });
        return  queryLikeUser.get()
    })
    .then((snp) => {   
        snp.forEach((doc) => {
            rooms.push(doc.data())
        });
        return res.status(200).send( { data: rooms } );
    })
    .catch((err) => {
        console.log("getAllRooms error: " + err);
        return res.status(500).send( { erro: err } );
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

exports.testServer = functions.https.onRequest((req, res) =>{
    res.status(200).send({"test": req.body})
});