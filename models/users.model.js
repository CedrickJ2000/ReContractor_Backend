const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UsersSchema = new Schema({
  UserName: {
    type: String,
    required: true,
    min: 5,
  },
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  EmailAddress: {
    type: String,
    required: true,
    max: 8,
  },
  Password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
  },
  resetLink: {
    data: String,
    default: ''
 },
});
const Users = mongoose.model('Users', UsersSchema);
module.exports = Users;