const multer = require("multer");
const multerS3 = require('multer-s3');
const crypto = require("crypto");
const mime = require("mime");
const sequelize = require('sequelize')

const op = sequelize.Op

module.exports = (app, db, log, AWS) => {
  const ses = new AWS.SES();
  const s3 = new AWS.S3();

  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'tiltagram',
      acl: 'public-read',
      key: function (req, file, cb) {
        console.log(file)
        crypto.pseudoRandomBytes(16, function (err, raw) {
          cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype));
        });
      }
    })
  });


  // GET all owners
  app.post('/products/send-mail', (req, res) => {
    var params = {
      EmailAddress: req.user.login
    };

    ses.verifyEmailAddress(params, function (err, data) {
      if (err) {
        res.send(err);
      }
      else {
        var ses_mail = "From: 'AWS Tutorial Series' <" + req.user.login + ">\n";
        ses_mail = ses_mail + "To: " + req.user.login + "\n";
        ses_mail = ses_mail + "Subject: AWS Work product list\n";
        ses_mail = ses_mail + "MIME-Version: 1.0\n";
        ses_mail = ses_mail + "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n";
        ses_mail = ses_mail + "--NextPart\n";
        ses_mail = ses_mail + "Content-Type: text/html; charset=us-ascii\n\n";
        console.log(req.body);
        ses_mail = ses_mail + `Aqui estão os itens comprados na loja: ${req.body}`;

        var params = {
          RawMessage: { Data: new Buffer(ses_mail) },
          Destinations: [req.user.login],
          Source: "'AWS mail' <" + req.user.login + ">'"
        };

        ses.sendRawEmail(params, function (err, data) {
          if (err) {
            res.send(err);
          }
          else {
            res.send(data);
          }
        });
      }
    });
    // db.users.findAll()
    //   .then(users => {
    //     log(req.user.name, 'LIST', 'USER', null, Date.now(), AWS);
    //     res.json(users);
    //   })
    //   .catch(() => {
    //     res.status(404).json({ message: "Something went wrong" });
    //   })
  });

  app.get('/users/search', (req, res) => {
    db.users.findAll({
      where: { name: { [op.like]: `%${req.query.name}%` } }
    })
      .then(user => {
        log(req.user.name, 'SEARCH', 'USER', req.query.name, Date.now(), AWS);
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
        log(req.user.name, 'VIEW', 'USER', user.name, Date.now(), AWS);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });
  app.get('/send', (req, res) => {

  });



  // POST single owner
  app.post('/users', upload.single('photo'), (req, res) => {
    const user = req.body;
    user.photo = req.file.location;
    db.users.create({
      ...user
    })
      .then(newUser => {
        log(req.user.name, 'INSERT', 'USER', newUser.name, Date.now(), AWS);
        res.json(newUser);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });

  // PATCH single owner
  app.put('/users/:id', upload.single('photo'), (req, res) => {
    console.log(req.file);
    const updates = req.body;
    updates.photo = req.file.location;
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
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });
  app.post('/register', upload.single('photo'), (req, res) => {
    const user = req.body;
    user.photo = req.file.location;
    db.users.create({
      ...user
    })
      .then(newUser => {
        log('ANON', 'INSERT', 'USER', newUser.name, Date.now(), AWS);
        res.json(newUser);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });
};