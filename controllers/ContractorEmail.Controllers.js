const Contractor = require('../models/contractor.model');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxf5d22faf29a041468f0fd28e65398512.mailgun.org';
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});
// user sign up

exports.signup = async (req, res) => {
    try {
      console.log(req.body);
      const {EmailAddress} = req.body;
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
          
        const record = {
          UserName: req.body.UserName,
          FirstName: req.body.FirstName,
          LastName: req.body.LastName,
          EmailAddress: req.body.EmailAddress,
          Address: req.body.Address,
          Password: hashedPassword,
        };



        const token = jwt.sign(record, process.env.JWT_ACC_ACTIVATE, {expiresIn: '20m'});
  
        const data = {
          from: 'ReContractor@test.com',
          to: EmailAddress,
          subject: 'Account Activation Link',
          html:`
          <h2>Please click on given link to activate your account </h2>
          <p>${process.env.CLIENT_URL}/Authentication/Activate/${token}</p>
          `
        };
        mg.messages().send(data, function (error, body) {
          if(error){
            return res.json({
              message: err.message
            })
          }
          return res.json({
            message: 'Email has been sent!, Kindly Activate Your Account'});
        });
      }
    } catch (err) {
      return res.status(400).send(err.message); 
    }
  };
  
  exports.activateAccount =  (req, res) => {
   const {token} = req.body;
   if(token){
      jwt.verify(token, process.env.JWT_ACC_ACTIVATE, function(err, decodedToken){
        if(err){
          return res.status(400).json({error: 'Incorrect or Expired link.'})
        }
        const {UserName, FirstName, LastName, EmailAddress, Password, Address} = decodedToken;
        Contractor.findOne({EmailAddress}).exec((err, contractor) =>{
          if(contractor){
            return res.status(400).json({error: "User with this email is already exists."});
          }
          
          let newContractor = new Contractor({UserName, FirstName, LastName, EmailAddress, Password, Address});
          newContractor.save((err, success) => {
            if(err){
              console.log("Error in signup while account activation: ", err);
              return res.status(400), json({error: 'Error activating account'})
            }
            res.json({
              message: "SignUp Success!"
            })
          })
        });
      })
      }else{
        return res.json({error: "Something went wrong!" })
    }
  }
  
  exports.forgotPassword = (req, res) => {
    const { EmailAddress } = req.body;
  
    Contractor.findOne({EmailAddress}, (err, contractor) => {
      if(err || !contractor){
        return res.status(400).json({error: "User with this email does not exists."});
      }
      const token = jwt.sign({_id: contractor._id}, process.env.RESET_PASSWORD_KEY, {expiresIn: '20m'});
        const data = {
          from: 'ReContractor@test.com',
          to: EmailAddress,
          subject: 'Reset Password Link',
          html:`
          <h2>Please click on given link to Reset your Password </h2>
          <p>${process.env.CLIENT_URL}/ResetPassword/${token}</p>
          `
        };
        return contractor.updateOne({resetLink: token}, function(err, success){
          if(err){
            return res.status(400).json({error: "ResetPassword Link ERROR!"});
          } else {
            mg.messages().send(data, function (error, body) {
              if(error){
                return res.json({
                  message: err.message
                })
              }
              return res.json({
                message: 'Email has been sent, Kindly Follow the Instructions'});
            });
          }
  
        })
    })
  }
  
  exports.resetPassword = (req, res) => {
    const {resetLink, newPass} = req.body;
    if (resetLink) {
      jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function(error, decodedData){
        if(error){
          return res.status(401).json({
            message: "Invalid or Expired Link."
          })
        }
        Contractor.findOne({resetLink}, (err, contractor) =>{
          if(err || !contractor){
            return res.status(400).json({error: "User with this email does not exists."});
          }
          const obj = {
            Password: newPass
          }
          contractor = _.extend(contractor, obj);
          contractor.save((err, result) => {
            if(err){
              return res.status(400).json({error: "ResetPassword  ERROR!"});
            } else {
                return res.status(200).json({
                  message: 'Your Password has been Changed!'});
            }
          })
        })
      })
    } else {
      return res.status(401).json({error: "Authentication ERROR!"}); 
    }
  
  }