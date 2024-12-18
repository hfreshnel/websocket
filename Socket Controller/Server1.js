const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialiser l'application Express et le serveur HTTP
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",  // Frontend local
      "http://127.0.0.1:3000",  // Alternative locale
      "http://10.3.70.5:3000",  // Réseau local
    ],
    methods: ["GET", "POST"],
  },
});

// Variables pour suivre l'état des quizs
const quizzes = {}; // Stocke l'état de chaque quiz, par exemple : { quizId: { currentQuestionIndex: 0, started: false } }

// Gestion de la connexion des clients
io.on('connection', (socket) => {
  console.log(`Client connecté : ${socket.id}`);

  // Joindre un utilisateur à une room correspondant à un quiz
  socket.on('joinQuiz', (quizId) => {
    socket.join(quizId);
    console.log(`Client ${socket.id} a rejoint la room du quiz ${quizId}`);
    
    // Envoyer une confirmation à l'utilisateur
    socket.emit('joinedQuiz', { quizId, message: `Vous avez rejoint le quiz ${quizId}` });
  });

  // Démarrer un quiz (uniquement par l'animateur)
  socket.on('startQuiz', ({ quizId, firstQuestion }) => {
    if (!quizzes[quizId]) {
      quizzes[quizId] = { currentQuestionIndex: 0, started: true };
    }
    console.log(`Quiz ${quizId} démarré avec la question :`, firstQuestion);

    // Diffuser la première question uniquement à la room correspondante
    io.to(quizId).emit('quizStarted', {
      type: 'question',
      data: firstQuestion,
    });
  });

  // Passer à la question suivante
  socket.on('nextQuestion', ({ quizId, nextQuestion }) => {
    if (quizzes[quizId] && quizzes[quizId].started) {
      quizzes[quizId].currentQuestionIndex++;
      console.log(`Question suivante pour le quiz ${quizId} :`, nextQuestion);

      // Diffuser la question suivante uniquement à la room correspondante
      io.to(quizId).emit('nextQuestion', {
        type: 'question',
        data: nextQuestion,
      });
    }
  });


  socket.on('showStatistique', ({ quizId, statistiques }) => {
      // Diffuser la données des states suivante uniquement à la room correspondante
      io.to(quizId).emit('showStatistique', {
        type: 'stats',
        data: statistiques,
      });
    
  });


  // Afficher la bonne réponse
  socket.on('showAnswer', ({ quizId }) => {
    if (quizzes[quizId] && quizzes[quizId].started) {
      // Diffuser un événement avec la valeur true pour déclencher l'affichage de la bonne réponse
      io.to(quizId).emit('showAnswer', true);
    }
  });

  
  // Terminer le quiz
  socket.on('endQuiz', (quizId) => {
    if (quizzes[quizId]) {
      quizzes[quizId].started = false;
      console.log(`Quiz ${quizId} terminé.`);

      // Diffuser la fin du quiz uniquement à la room correspondante
      io.to(quizId).emit('quizEnded', { message: `Le quiz ${quizId} est terminé !` });

      // Optionnel : Supprimer l'état du quiz pour libérer de la mémoire
      delete quizzes[quizId];
    }
  });

  // Gérer la déconnexion d'un participant
  socket.on('disconnect', () => {
    console.log(`Client déconnecté : ${socket.id}`);
  });
});

// Lancer le serveur
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Serveur Socket.IO en écoute sur http://localhost:${PORT}`);
});
