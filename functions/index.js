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

    return roomCollection.add(roomToSave)    //save room
            .then( roomSaved => {
                return db.runTransaction( transaction => {
                    return transaction.get(db.collection("user").doc(roomToSave.adminId))
                        .then( snapshot => {
                            console.log("Run get collection");

                            const adm = snapshot.get("adminRooms");
                            adm.push("new field");
                            console.log(adm);

                            const adminRoomArray = snapshot.data().adminRooms//get('adminRooms');
                            adminRoomArray.push('newfield');
                            console.log(adminRoomArray);
                            
                            // transaction.update(roomSaved.adminId, 'adminRooms', adminRoomArray);
                            // transaction.update(db.collection("user").doc(roomToSave.adminId), { adminRooms: adminRoomArray } );
                            
                            return res.status(200).send({ save: true});
                         }).catch(err => {
                             console.log("deu ruimzao aqui" + err);
                             return err;
                         });
                }).catch( err =>{
                        console.log("deu ruim 1");
                        return err
                        // return res.status(500).send(err);
                });
        


                //old other
                
                // return userCollection.doc(roomToSave.adminId).get() //get user to add room in user rooms
                //         .then(re => {
                        
                //             const adminRoomsArray = re.get(adminRooms);
                //             adminRoomsArray.push('newfield');
                            
                //             return userCollection.doc(roomToSave.adminId).update();

                //             return res.status(200).send(re);
                //         }).catch(err => {
                //             console.log("Não achei mano");
                //             return err
                //         });

    }).catch( err =>{
        console.log("deu ruim2");
        return err
        // return res.status(500).send(err);
    });
            
});

exports.addNewRoom = functions.https.onRequest((req, res) => {
    const userCollection = db.collection("user");
    const roomCollection = db.collection("room");
    const roomToSave = req.body.data

    return roomCollection.add(roomToSave)    //save room
            .then( roomSaved => {
                return db.runTransaction( transaction => {
                    return transaction.get(db.collection("user").doc(roomToSave.adminId))
                        .then( snapshot => {
                            console.log("Run get collection");

                            const adm = snapshot.get("adminRooms");
                            adm.push("new field");
                            console.log(adm);

                            const adminRoomArray = snapshot.data().adminRooms//get('adminRooms');
                            adminRoomArray.push('newfield');
                            console.log(adminRoomArray);
                            
                            // transaction.update(roomSaved.adminId, 'adminRooms', adminRoomArray);
                            // transaction.update(db.collection("user").doc(roomToSave.adminId), { adminRooms: adminRoomArray } );
                            
                            return res.status(200).send({ save: true});
                         }).catch(err => {
                             console.log("deu ruimzao aqui" + err);
                             return err;
                         });
                }).catch( err =>{
                        console.log("deu ruim 1");
                        return err
                        // return res.status(500).send(err);
                });
        


                //old other
                
                // return userCollection.doc(roomToSave.adminId).get() //get user to add room in user rooms
                //         .then(re => {
                        
                //             const adminRoomsArray = re.get(adminRooms);
                //             adminRoomsArray.push('newfield');
                            
                //             return userCollection.doc(roomToSave.adminId).update();

                //             return res.status(200).send(re);
                //         }).catch(err => {
                //             console.log("Não achei mano");
                //             return err
                //         });

    }).catch( err =>{
        console.log("deu ruim2");
        return err
        // return res.status(500).send(err);
    });
            
});
exports.getRooms = functions.https.onRequest((req, res) => {

});

exports.functionModel = functions.https.onRequest((req, res) => {

});

exports.testServer = functions.https.onRequest((req, res) =>{
    res.status(200).send({"test": req.body})
});

