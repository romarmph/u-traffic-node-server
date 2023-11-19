const admin = require("../config/index");
const dotenv = require("dotenv");

dotenv.config();

const createEnforcerAccount = (req, res) => {
  const { email, password } = req.body;

  console.log(email);
  console.log(password);

  admin
    .auth()
    .createUser({
      email: email,
      emailVerified: true,
      password: password,
      disabled: false,
    })
    .then((user) => {
      data = {
        email: user.email,
        uid: user.uid,
      };
      res.status(201).send(data);
    })
    .catch((error) => {
      console(error);
      res.status(400).send(error.message);
    });
};

const updateEnforcerAccount = (req, res) => {
  const { email, password, uid } = req.body;

  admin
    .auth()
    .updateUser(uid, {
      email: email,
      emailVerified: true,
      password: password.length > 0 ? password : undefined,
      disabled: false,
    })
    .then((user) => {
      data = {
        email: user.email,
        uid: user.uid,
      };
      res.send(data);
    })
    .catch((error) => {
      res.status(400).send(error.message);
    });
};

module.exports = {
  createEnforcerAccount,
  updateEnforcerAccount,
};
