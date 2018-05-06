const Multer = require("multer");
const crypto = require("crypto");
const mime = require("mime");
const sequelize = require('sequelize')
const imgUpload = require('./imageUploader');
const nodemailer = require('nodemailer');

const upload = Multer({
  storage: Multer.MemoryStorage,
  fileSize: 5 * 1024 * 1024
});

const op = sequelize.Op

module.exports = (app, db, log) => {

  // GET all products
  app.get('/users', (req, res) => {
    db.users.findAll()
      .then(users => {
        log(req.user.name, 'LIST', 'PRODUCT', '', Date.now());
        res.json(users);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });

  app.post('/products/send-mail', (req, res) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'joaovpbarbosa@gmail.com',
        pass: ENV.MYPASSATGOOGLEENV
      }
    });
    const mailOptions = {
      from: 'joaovpbarbosa@gmail.com', // sender address
      to: req.user.login, // list of receivers
      subject: 'Suas compras', // Subject line
      html: `<div>Products: ${req.products}</div>`// plain text body
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        res.status(404).json({ message: "Something went wrong" });
      else
        res.json(info);
    });

  });

  app.get('/users/search', (req, res) => {
    db.users.findAll({
      where: { name: { [op.like]: `%${req.query.name}%` } }
    })
      .then(user => {
        log(req.user.name, 'SEARCH', 'USER', req.query.name, Date.now());
        res.json(user);
      })
      .catch((error) => {
        res.send(error)
      })
  });

  // GET one owner by id
  app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    db.users.find({
      where: { id: id }
    })
      .then(user => {
        user ? res.json(user) : res.status(404).json({ message: "Can't find this user" });
        log(req.user.name, 'VIEW', 'USER', user.name, Date.now());
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });

  // POST single owner
  app.post('/users', upload.single('photo'), imgUpload.uploadToGcs, (req, res) => {
    const user = req.body;
    if (req.file && req.file.cloudStoragePublicUrl) {
      user.photo = req.file.cloudStoragePublicUrl;
    }

    db.users.create({
      ...user
    })
      .then(newUser => {
        log(req.user.name, 'INSERT', 'USER', newUser.name, Date.now());
        res.json(newUser);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });

  // PATCH single owner
  app.put('/users/:id', upload.single('photo'), imgUpload.uploadToGcs, (req, res) => {
    const product = req.body;
    if (req.file && req.file.cloudStoragePublicUrl) {
      product.photo = req.file.cloudStoragePublicUrl;
    }
    const id = req.params.id
    db.users.find({
      where: { id: id }
    })
      .then(user => {
        return user.updateAttributes(updates)
      })
      .then(updatedUser => {
        log(req.user.name, 'ALTER', 'USER', updatedUser.name, Date.now());
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
        log(req.user.name, 'DELETE', 'USER', deletedUser.name, Date.now());
        return deletedUser ? res.status(200).json({ message: "Successed removed!" }) : res.status(404).json({ message: "Fail remove!" });
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });
  app.post('/register', upload.single('photo'), imgUpload.uploadToGcs, (req, res) => {

    const user = req.body;
    if (req.file && req.file.cloudStoragePublicUrl) {
      user.photo = req.file.cloudStoragePublicUrl;
    }

    db.users.create({
      ...user
    })
      .then(newUser => {
        log('ANON', 'INSERT', 'USER', newUser.name, Date.now());
        res.json(newUser);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });
};