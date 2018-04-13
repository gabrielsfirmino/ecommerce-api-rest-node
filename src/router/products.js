const multer = require("multer");
const multerS3 = require('multer-s3');
const crypto = require("crypto");
const mime = require("mime");
const sequelize = require('sequelize')

const op = sequelize.Op

module.exports = (app, db, log, AWS) => {

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


  // GET all products
  app.get('/products', (req, res) => {
    db.products.findAll()
      .then(products => {
        log(req.user.name, 'LIST', 'PRODUCT', '', Date.now(), AWS);
        res.json(products);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });
  app.get('/products/search', (req, res) => {
    const id = req.params.id;
    db.products.findOne({
      where: { name: { [op.like]: `%${req.query.name}%` } }
    })
      .then(product => {
        log(req.user.name, 'SEARCH', 'PRODUCT', product.name, Date.now(), AWS);
        res.json(product);
      })
      .catch((error) => {
        console.log(error)
        res.send(error)
      })
  });

  // GET one product by id
  app.get('/products/:id', (req, res) => {
    const id = req.params.id;
    db.products.find({
      where: { id: id }
    })
      .then(product => {
        log(req.user.name, 'SEARCH', 'PRODUCT', product.name, Date.now(), AWS);
        res.json(product);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });

  // POST single product
  app.post('/products', upload.single('photo'), (req, res) => {
    const product = req.body;
    product.photo = req.file.location;
    db.products.create({
      ...product
    })
      .then(newProduct => {
        log(req.user.name, 'INSERT', 'PRODUCT', newProduct.name, Date.now(), AWS);
        res.json(newProduct);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });

  // PATCH single product
  app.put('/products/:id', upload.single('photo'), (req, res) => {
    const updates = req.body;
    updates.photo = req.file.location;
    const id = req.params.id
    db.products.find({
      where: { id: id }
    })
      .then(product => {
        log(req.user.name, 'ALTER', 'PRODUCT', product.name, Date.now(), AWS);
        return product.updateAttributes(updates)
      })
      .then(updatedProduct => {
        updatedProduct ? res.status(200).json(updatedProduct) : res.status(404).json({ message: "Fail update!" });;
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });

  // DELETE single product
  app.delete('/products/:id', (req, res) => {
    const id = req.params.id;
    return db.products.destroy({
      where: { id: id }
    })
      .then(deletedProduct => {
        log(req.user.name, 'DELETE', 'PRODUCT', deletedProduct.name, Date.now(), AWS);
        return deletedProduct ? res.status(200).json({ message: "Successed removed!" }) : res.status(404).json({ message: "Fail remove!" });
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });
};