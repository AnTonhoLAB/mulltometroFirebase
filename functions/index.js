const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.firestore();
// admin.firestore().settings( { timestampsInSnapshots: true })


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

    return roomCollection.add(roomToSave)
            .then( roomSaved => {
                return db.runTransaction( transaction => {
                    return transaction.get(db.collection("user").doc(roomToSave.adminId))
                         .then( snapshot => {

                            var adminRoomArray = snapshot.data().adminRooms

                            if  (adminRoomArray && adminRoomArray.length) {
                                adminRoomArray.push(roomSaved);
                            } else {
                                adminRoomArray = [roomSaved];
                            }
                            roomToSave.id = roomSaved.id;
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

    console.log(adminId);

    return roomCollection.get() 
        .then (obj => {
            var rooms = []; 

            obj.forEach(doc => {
                const room = doc.data()

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
 
    // return roomCollection.where("adminId","==",adminId, "||", "array_contains",adminId ).get()
    //     .then (obj => {
    //         var rooms = []; 

    //         obj.forEach(doc => {
    //             rooms.push(doc.data());    
    //         });
    //         console.log("JOAO DORIA TA LOCAO DE PAU MOLE ");
            
    //         return res.status(200).send( { data: rooms } );
    //     })
    //     .catch(err =>{
    //         console.log("deu ruim: " + err );
    //         return res.status(300).send({ data: err });
    //     });
});

exports.functionModel = functions.https.onRequest((req, res) => {

});

exports.testServer = functions.https.onRequest((req, res) =>{
    res.status(200).send({"test": req.body})
});

