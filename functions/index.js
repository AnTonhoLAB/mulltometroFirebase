const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.firestore();

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
    const roomToSave = req.body.data;

    var roomToReturn = [];

    return roomCollection.add(roomToSave)
            .then( roomSaved => {
                return db.runTransaction( transaction => {
                    return transaction.get(db.collection("user").doc(roomToSave.adminId))
                         .then( snapshot => {

                            var adminRoomArray = snapshot.data().adminRooms

                            if  (adminRoomArray && adminRoomArray.length) {
                                adminRoomArray.push(roomSaved.id);
                            } else {
                                adminRoomArray = [roomSaved.id];
                            }
                            roomToReturn = snapshot.data();
                        
                            return transaction.update(db.collection("user").doc(roomToSave.adminId), { adminRooms: adminRoomArray } );
                        });
                    });
                })
            .then( reess => {
                console.log("save transaction with: " + reess);
                
                return res.status(200).send(reess);
            })
            .catch( err =>{
                console.log("deu ruim: " + err );
                return res.status(500).send( { erro: err } );
            })
});

exports.addRoomCustom = functions.https.onRequest((req, res) => {

    const roomCollection = db.collection("room");
    const userCollection = db.collection("user");

    const roomToSave = req.body.data;

    var roomToReturn = [];

    return roomCollection.add(roomToSave)
        .then( roomSaved => {

            var user = userCollection.doc(roomToSave.adminId)

            var adminRoomArray = userCollection.doc(roomToSave.adminId).get("adminRooms");
            
            console.log("OPA" + typeof adminRoomArray);

            if  (adminRoomArray.length > 0) {
                adminRoomArray.push(roomSaved);
            } else { 
                adminRoomArray = [roomSaved]
            }
            console.log("array: " + adminRoomArray);
            
            userCollection.doc(roomToSave.adminId).update({ "adminRooms": adminRoomArray});


            // console.log("user: " + user);
            

            // userCollection.doc(roomToSave.adminId).set(user);



            // return db.collection("user").doc(roomToSave.adminId).onSnapshot( snp => {
            //     var data = snp.data;
            //     // var admRooms = snp.data().adminRooms;
            //     data.admRooms.push(roomSaved);          
            //     console.log("1");
                
            //     db.collection("user").doc(roomToSave.adminId).update(snp.data());
            //     console.log("2");
            //     return res.status(200).send(snp.data().adminRooms);
            // })

            
        //   return  res.status(200).send( db.collection("user").doc(roomToSave.adminId)) ;

                // var adminRoomArray = snapshot.data().adminRooms
            return  res.status(200).send(userCollection.doc(roomToSave.adminId).get("adminRooms"));

        })
    .catch( err => {
        console.log(err);
        
        return res.status(500).send(err);
    });
});

exports.functionModel = functions.https.onRequest((req, res) => {

});

exports.testServer = functions.https.onRequest((req, res) =>{
    res.status(200).send({"test": req.body})
});

