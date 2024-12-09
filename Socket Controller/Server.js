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

// Données fictives pour le quiz (vous pouvez les remplacer par une base de données ou un fichier JSON)
const questions = [
  {
    question: "Quelle est la capitale de la France ?",
    options: ["Paris", "Londres", "Berlin", "Rome"],
    correctAnswer: "Paris",
  },
  {
    question: "Qui a écrit 'Les Misérables' ?",
    options: ["Victor Hugo", "Emile Zola", "Molière", "Balzac"],
    correctAnswer: "Victor Hugo",
  },
  // Ajoutez d'autres questions ici
];

// Variables pour suivre l'état du quiz
let quizStarted = false;
let currentQuestionIndex = 0;
let participants = [];

io.on('connection', (socket) => {
  console.log(`Client connecté : ${socket.id}`);

  // Ajouter le participant à la liste des participants
  participants.push(socket.id);

  // Gérer le démarrage du quiz (événement émis par l'animateur)
  socket.on('startQuiz', () => {
    if (!quizStarted) {
      quizStarted = true;
      currentQuestionIndex = 0;
      // Diffuser l'événement de démarrage à tous les participants
      io.emit('quizStarted', { message: 'Le quiz a commencé !' });
      sendQuestionToParticipants();
    }
  });

  // Gérer l'envoi de la question suivante
  socket.on('nextQuestion', () => {
    if (quizStarted && currentQuestionIndex < questions.length) {
      currentQuestionIndex++;
      sendQuestionToParticipants();
    }
  });

  // Gérer l'envoi de la bonne réponse
  socket.on('showAnswer', () => {
    if (quizStarted && currentQuestionIndex < questions.length) {
      const correctAnswer = questions[currentQuestionIndex].correctAnswer;
      io.emit('showAnswer', { correctAnswer });
    }
  });

  // Gérer l'arrêt du quiz
  socket.on('endQuiz', () => {
    quizStarted = false;
    io.emit('quizEnded', { message: 'Le quiz est terminé !' });
  });

  // Gérer la déconnexion d'un participant
  socket.on('disconnect', () => {
    console.log(`Client déconnecté : ${socket.id}`);
    participants = participants.filter(id => id !== socket.id);
  });

  // Fonction pour envoyer la question actuelle à tous les participants
  function sendQuestionToParticipants() {
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      io.emit('newQuestion', {
        question: question.question,
        options: question.options,
      });
    } else {
      io.emit('quizEnded', { message: 'Toutes les questions ont été posées !' });
    }
  }
});

// Lancer le serveur
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Serveur Socket.IO en écoute sur http://192.168.1.100:${PORT}`);
});
