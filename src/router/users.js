module.exports = (app, db) => {

  // GET all owners
  app.get('/users', (req, res) => {
    db.users.findAll()
      .then(users => {
        res.json(users);
      });
  });

  // GET one owner by id
  app.get('/user/:id', (req, res) => {
    const id = req.params.id;
    db.users.find({
      where: { id: id}
    })
      .then(user => {
        user ? res.json(user) : res.status(404).json({message: "Can't find this user"});
      });
  });

  // POST single owner
  app.post('/user', (req, res) => {
    const user = req.body;
    db.users.create({
      ...user
    })
      .then(newUser => {
        res.json(newUser);
      })
  });

  // PATCH single owner
  app.put('/user/:id', (req, res) => {
    const updates = req.body;
    const id = req.params.id
    db.users.find({
      where: { id: id }
    })
      .then(user => {
        return user.updateAttributes(updates)
      })
      .then(updatedUser => {
        res.json(updatedUser);
      })
      .catch(() => {
        res.status(404).json({message: "Can't find this user"});
      })
  });

  // DELETE single owner
  app.delete('/user/:id', (req, res) => {
    const id = req.params.id;
    db.users.destroy({
      where: { id: id }
    })
      .then(deletedUser => {
        return deletedUser ? res.status(200).json({message: "Successed removed!"}) : res.status(404).json({message: "Fail remove!"});
      });
  });
};