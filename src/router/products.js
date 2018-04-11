module.exports = (app, db) => {
  // GET all products
  app.get('/products', (req, res) => {
    db.products.findAll()
      .then(products => {
        res.json(products);
      });
  });

  // GET one product by id
  app.get('/products/:id', (req, res) => {
    // console.log(req.user.phone);
    const id = req.params.id;
    db.products.find({
      where: { id: id }
    })
      .then(product => {
        res.json(product);
      });
  });

  // POST single product
  app.post('/products', (req, res) => {
    const product = req.body;
    db.products.create({
      ...product
    })
      .then(newProduct => {
        res.json(newProduct);
      })
  });

  // PATCH single product
  app.put('/products/:id', (req, res) => {
    const updates = req.body;
    const id = req.params.id
    db.products.find({
      where: { id: id }
    })
      .then(product => {
        return product.updateAttributes(updates)
      })
      .then(updatedProduct => {
        updatedProduct ? res.status(200).json(updatedProduct) : res.status(404).json({ message: "Fail update!" });;
      });
  });

  // DELETE single product
  app.delete('/products/:id', (req, res) => {
    const id = req.params.id;
    return db.products.destroy({
      where: { id: id }
    })
      .then(deletedProduct => {
        return deletedProduct ? res.status(200).json({ message: "Successed removed!" }) : res.status(404).json({ message: "Fail remove!" });
      })
  });
};