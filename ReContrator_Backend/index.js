const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const app = express();
const dbURI = process.env.dbURI;
const PORT = process.env.PORT;

// Middlewares
app.use(cors());
//app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
const fileRoutes = require('./routes/fileupload.routes');
const ProductRoutes = require('./routes/Upload.routes');
const UserRoutes = require('./routes/User.routes');
const UserEmailRoutes = require('./routes/UserEmail.routes');
const ContractorRoutes = require('./routes/Contractor.routes');
const ContractorEmailRoutes = require('./routes/ContractorEmail.routes');
// ROUTES MIDDLEWARES
app.use('/api', fileRoutes);
app.use('/api', ProductRoutes);
app.use('/api', UserRoutes);
app.use('/api', UserEmailRoutes);
app.use('/api', ContractorRoutes);
app.use('/api', ContractorEmailRoutes);
/* MONGODB OPTIONS*/
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
};


// Mongodb Connections
mongoose.connect(dbURI, options).then((res) => {
  console.log('Nakaikabit ti', res.connections[0].name);
  app.listen(PORT, () => {
    console.log(`SERVER IS TUMARTARAY IDTOY PORT ${PORT}`);
  });
});
