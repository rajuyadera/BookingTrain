import argon2 from "argon2";
import Users from "../../models/auth/Users.js";

export const getUser = async (req, res, next) => {
  try {
    const users = await Users.findAll({
      attributes: ["id", "username", "email", "role"],
    });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const response = await Users.findOne({
      attributes: ["id", "name", "email", "role"],
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  const user = await Users.findOne({
    where: {
      email: req.body.email,
    },
  });
  const { username, email, password, confPassword, role } = req.body;
  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password And Confirm Password Do Not Match" });
  if (user) return res.status(400).json({ msg: "Email Already Created" });
  const hashPasword = await argon2.hash(password);
  try {
    await Users.create({
      username: username,
      email: email,
      password: hashPasword,
      role: role,
    });
    res.status(201).json({ msg: "User Created Successfully" });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  const user = await Users.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!user) return res.status(404).json({ msg: "User Not Found!" });
  const { name, email, password, confPassword, role } = req.body;
  let hashPasword;
  if (password === "" || password === null) {
    hashPasword = user.password;
  } else {
    hashPasword = await argon2.hash(password);
  }
  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password And Confirm Password Do Not Match" });

  try {
    await Users.update(
      {
        name: name,
        email: email,
        password: hashPasword,
        role: role,
      },
      {
        where: {
          id: user.id,
        },
      }
    );
    res.status(200).json({ msg: "User Updated" });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  const user = await Users.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!user) return res.status(404).json({ msg: "User Not Found!" });
  try {
    await Users.destroy({
      where: {
        id: user.id,
      },
    });
    res.status(200).json({ msg: "User Deleted" });
  } catch (err) {
    next(err);
  }
};
