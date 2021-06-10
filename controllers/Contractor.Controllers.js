const Contractor = require('../models/contractor.model');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxf5d22faf29a041468f0fd28e65398512.mailgun.org';
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});
// add user and encrypting password

exports.addUser = async (req, res) => {
  try {
    const findEmail = await Contractor.find({ EmailAddress: req.body.EmailAddress });
    const findUserName = await Contractor.find({ UserName: req.body.UserName });

    const validationSchema = Joi.object({
      UserName: Joi.string().min(5).required(),
      FirstName: Joi.string().min(3).required(),
      LastName: Joi.string().required(),
      Address: Joi.string().required(),
      EmailAddress: Joi.string().min(8).required().email(),
      Password: Joi.string()
        .min(6)
        .required()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    });

    const { error } = validationSchema.validate(req.body);
    if (error) return res.status(400).send({ message: error });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.Password, salt);
    if (findEmail.length >= 1 && findUserName.length >= 1) {
      return res
        .status(403)
        .send({ message: 'Email And Username is already existed ' });
    } else if (findEmail.length >= 1) {
      return res.status(403).send({ message: 'Email is already existed' });
    } else if (findUserName.length >= 1) {
      return res.status(403).send({ message: 'UserName is already existed' });
    } else {
      const contractor = new Contractor({
        UserName: req.body.UserName,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        EmailAddress: req.body.EmailAddress,
        Address: req.body.Address,
        Password: hashedPassword,
      });

      const saveContractor = await contractor.save();
      res.send({ contractor: contractor._id });
      return res.status(200).send(saveContractor);
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

// User Login and it will give you a token.

exports.userLogin = async (req, res) => {
  try {
    const validationLogin = Joi.object({
      EmailAddress: Joi.string().min(6).required(),
      Password: Joi.string().min(6).required(),
    });

    // Request Validations
    const { error } = validationLogin.validate(req.body);
    if (error)
      return res.status(400).send({
        message: error.details[0].message,
        status: 'none',
        statusCode: 400,
      });

    // Check if username exists
    const contractor = await Contractor.findOne({ EmailAddress: req.body.EmailAddress });
    if (!contractor)
      return res.status(409).send({
        message: `"Username or Password is wrong"`,
        status: 'none',
        statusCode: 409,
      });
    const validPass = await bcrypt.compare(req.body.Password, contractor.Password);
    if (!validPass)
      return res.status(403).send({
        message: `"Invalid Password or Email"`,
        status: 'none',
        statusCode: 403,
      });

    // Create and assign token
    const payload = {
      _id: contractor._id,
      EmailAddress: contractor.EmailAddress,
    };
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d',
    });
    res.status(200).header('auth-token', token).send({
      token: token,
      _id: contractor._id,
      logged_in: 'Yes',
      message: `User verified`,
      status: 200,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message, status: 400 });
  }
};


// getting user info by ID

exports.getUserInfo = async (req, res) => {
  try {
    const getInfo = await Contractor.findById(req.params._id);
    return res
      .status(200)
      .json({ message: 'User Retrived', data: getInfo, statusCode: 200 });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message, statusCode: 400 });
  }
};

// retrieve and return all users || retrieve and return single user
exports.findUser = (req, res) => {
  if(req.params._id){
      const id = req.params._id;

      Contractor.findById(id)
      .then(data =>{
          if(!data){
              res.status(404).send({message:"Not found user with id " + id})
          }else{
              res.send(data)
          }
      })
      .catch( err =>{
          res.status(500).send({message: "Error retrieving user with id" + id})
      })
  }else{
      Contractor.find()
      .then(user =>{
          res.send(user)
      })
      .catch(err => {
          res.status(500).send({ message:err.message || "Error Occured while retriving user information"})
      })
  }
}

// Delete a user with specified userid
exports.deleteUser = (req, res) => {
  const id = req.params.id;
  Contractor.findByIdAndDelete(id)
  .then(data =>{
      if(!data){
          res.status(404).send({message:`Cannot DELETE with id ${id}. Maybe ID not found`})
      }else{
          res.send({
              message: "User was DELETED succesfully!"
          })
      }
  })
  .catch(err =>{
      res.status(500).send({
          message:"Could not delete User with id=" + id
      });
  }); 
}

// Update Specific User by ID
exports.updateUser = async (req, res) => {
try {
    const findUserName = await Contractor.find({ UserName: req.body.UserName });
    const validationSchema = Joi.object({
      UserName: Joi.string().min(5).required(),
      FirstName: Joi.string().min(3).required(),
      LastName: Joi.string().required(),
      Address: Joi.string().required(),
      Password: Joi.string()
        .min(6)
        .required()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    });
    const { error } = validationSchema.validate(req.body);
    if (error) return res.status(400).send({ message: error });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.Password, salt);
    if (findEmail.length >= 1 && findUserName.length >= 1) {
      return res
        .status(403)
        .send({ message: 'Email And Username is already existing' });
    } else if (findEmail.length >= 1) {
      return res.status(403).send({ message: 'Email is already existing' });
    } else if (findUserName.length >= 1) {
      return res.status(403).send({ message: 'UserName is already existing' });
    } else {
    const updateContractor= await User.updateMany(
      { _id: req.params._id},
      {
        UserName: req.body.UserName,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Address: req.body.Address,
        Password: hashedPassword,
      }
    );
    return res.status(200).json({ data: updateContractor, message: "User Updated", status: 200 });  
    }
  } catch (err) {
    return res.status(400).json({ message: err.message, status: 400 });
  }
};

// ResetPassword
 exports.ResetPass = async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.Password, salt);
      const userPassword = await Contractor.findByIdAndUpdate(
        
          { _id: req.params._id},
          {Password: hashedPassword },
          {new: true });

        return res.status(200).json ({ status: true, data: userPassword});
    } catch (error) {
      return res.status(400).json ({ status: false, error: "ERROR OCCURED"});
    }
  }