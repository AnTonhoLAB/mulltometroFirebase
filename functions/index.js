const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const firestore = new Firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);

exports.addAUser = functions.https.onRequest((req, res) => {
    try {
        const userCollection = admin.firestore().collection("user");

        var userToSave = {
            name: req.body.data.name,
            idade: req.body.data.idade
        };

        console.log(userToSave);

        userCollection.add(userToSave);
    } catch (error) {
        console.log('DAAM:', error);
        return error;
    }
});

