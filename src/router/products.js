const Multer = require("multer");
const crypto = require("crypto");
const mime = require("mime");
const sequelize = require('sequelize')
const imgUpload = require('./imageUploader');


const op = sequelize.Op

module.exports = (app, db, log) => {

  const upload = Multer({
    storage: Multer.MemoryStorage,
    fileSize: 5 * 1024 * 1024
  });

  // GET all products
  app.get('/products', (req, res) => {
    db.products.findAll()
      .then(products => {
        log(req.user.name, 'LIST', 'PRODUCT', '', Date.now());
        res.json(products);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });

  app.get('/products/search', (req, res) => {
    db.products.findAll({
      where: { name: { [op.like]: `%${req.query.name}%` } }
    })
      .then(products => {
        log(req.user.name, 'SEARCH', 'PRODUCT', products.name, Date.now());
        res.json(products);
      })
      .catch((error) => {
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
        log(req.user.name, 'SEARCH', 'PRODUCT', product.name, Date.now());
        res.json(product);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });

  // POST single product
  app.post('/products', upload.single('photo'), (req, res) => {
    const product = req.body;
    if (req.file && req.file.cloudStoragePublicUrl) {
      product.photo = req.file.cloudStoragePublicUrl;
    }
    db.products.create({
      ...product
    })
      .then(newProduct => {
        log(req.user.name, 'INSERT', 'PRODUCT', newProduct.name, Date.now());
        res.json(newProduct);
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });

  // PATCH single product
  app.put('/products/:id', upload.single('photo'), (req, res) => {
    const product = req.body;
    if (req.file && req.file.cloudStoragePublicUrl) {
      product.photo = req.file.cloudStoragePublicUrl;
    }
    const id = req.params.id
    db.products.find({
      where: { id: id }
    })
      .then(product => {
        log(req.user.name, 'ALTER', 'PRODUCT', product.name, Date.now());
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
        log(req.user.name, 'DELETE', 'PRODUCT', deletedProduct.name, Date.now());
        return deletedProduct ? res.status(200).json({ message: "Successed removed!" }) : res.status(404).json({ message: "Fail remove!" });
      })
      .catch(() => {
        res.status(404).json({ message: "Something went wrong" });
      })
  });
};