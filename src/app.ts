const express = require('express');
const http = require('http');
const { setupSocket } = require('./socket');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Middleware setup (if needed)
app.use(express.json());
app.use(cors());

// Initialize socket.io
setupSocket(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});