const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialiser l'application Express et le serveur HTTP
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",  // Accès depuis le client local sur la même machine
      "http://127.0.0.1:3000",  // Alternative pour le client local
      "http://10.3.70.5:3000",  // Réseau local
    ],
    methods: ["GET", "POST"],
  },
});

// Variables pour suivre l'état du quiz
let quizStarted = false;
let currentQuestionIndex = 0;
let participants = [];

// Gestion de la connexion des clients
io.on('connection', (socket) => {
  console.log(`Client connecté : ${socket.id}`);

  // Ajouter le participant à la liste des participants
  participants.push(socket.id);

  // Démarrer le quiz lorsque l'animateur envoie l'événement
  socket.on('startQuiz', () => {
    if (!quizStarted) {
      quizStarted = true;
      currentQuestionIndex = 0;
      // Diffuser l'événement de démarrage à tous les participants
      io.emit('quizStarted', { message: 'Le quiz a commencé !' });
      io.emit('nextQuestion'); // Demander au client de récupérer la première question
    }
  });

  // Gérer l'envoi de la question suivante
  socket.on('nextQuestion', () => {
    if (quizStarted) {
      currentQuestionIndex++;
      io.emit('nextQuestion'); // Demander au client de récupérer la question suivante
    }
  });

  // Afficher la bonne réponse
  socket.on('showAnswer', () => {
    if (quizStarted) {
      io.emit('showAnswer');
    }
  });

  // Arrêter le quiz
  socket.on('endQuiz', () => {
    quizStarted = false;
    io.emit('quizEnded', { message: 'Le quiz est terminé !' });
  });

  // Gérer la déconnexion d'un participant
  socket.on('disconnect', () => {
    console.log(`Client déconnecté : ${socket.id}`);
    participants = participants.filter(id => id !== socket.id);
  });
});

// Lancer le serveur
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Serveur Socket.IO en écoute sur http://localhost:${PORT}`);
});
