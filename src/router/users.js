const AWS = require('aws-sdk');
const log = require('../log');
const multer = require("multer");
const multerS3 = require('multer-s3');
const crypto = require("crypto");
const mime = require("mime");

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'contatosf30',
    acl: 'public-read',
    key: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
      });
    }
  })
});

module.exports = (app, db) => {
  // GET all owners
  app.get('/users', (req, res) => {
    db.users.findAll()
      .then(users => {
        log(req.user.name, 'LIST', 'USER', null, Date.now(), AWS);
        res.json(users);
      });
  });

  // GET one owner by id
  app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    db.users.find({
      where: { id: id }
    })
      .then(user => {
        user ? res.json(user) : res.status(404).json({ message: "Can't find this user" });
        log(req.user.name, 'VIEW', 'USER', user.name, Date.now(), AWS);
      });
  });

  // POST single owner
  app.post('/users', (req, res) => {
    const user = req.body;
    db.users.create({
      ...user
    })
      .then(newUser => {
        log(req.user.name, 'INSERT', 'USER', newUser.name, Date.now(), AWS);
        res.json(newUser);
      })
  });

  // PATCH single owner
  app.put('/users/:id', (req, res) => {
    const updates = req.body;
    const id = req.params.id
    db.users.find({
      where: { id: id }
    })
      .then(user => {
        return user.updateAttributes(updates)
      })
      .then(updatedUser => {
        log(req.user.name, 'ALTER', 'USER', updatedUser.name, Date.now(), AWS);
        res.json(updatedUser);
      })
      .catch(() => {
        res.status(404).json({ message: "Can't find this user" });
      })
  });

  // DELETE single owner
  app.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    db.users.destroy({
      where: { id: id }
    })
      .then(deletedUser => {
        log(req.user.name, 'DELETE', 'USER', deletedUser.name, Date.now(), AWS);
        return deletedUser ? res.status(200).json({ message: "Successed removed!" }) : res.status(404).json({ message: "Fail remove!" });
      });
  });
  app.post('/register', (req, res) => {
    const user = req.body;
    db.users.create({
      ...user
    })
      .then(newUser => {
        log('ANON', 'INSERT', 'USER', newUser.name, Date.now(), AWS);
        res.json(newUser);
      })
  });
};