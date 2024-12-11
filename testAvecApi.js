import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios'; // Importer Axios pour les appels API

// Initialisation de la connexion Socket.IO
const socket = io('http://10.3.70.5:8080');

const Test4 = () => {
  const [role, setRole] = useState(null); // Animateur ou Participant
  const [quizId, setQuizId] = useState(null); // ID du Quiz
  const [currentQuestion, setCurrentQuestion] = useState(null); // Question actuelle
  const [quizEnded, setQuizEnded] = useState(false); // Indicateur de fin du Quiz
  const [message, setMessage] = useState(''); // Messages divers
  const [currentQuestionId, setCurrentQuestionId] = useState(1); // ID de la question actuelle (commence à 1)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false); // Indicateur pour afficher la bonne réponse

  // Gestion des choix de rôle
  const chooseRole = (selectedRole) => {
    setRole(selectedRole);
  };

  // Rejoindre un quiz spécifique
  const joinQuiz = (id) => {
    setQuizId(id);
    socket.emit('joinQuiz', id);
  };

  // Récupérer une question via l'API
  const fetchQuestion = async (quizId, questionId) => {
    try {
      const response = await axios.get(`http://10.3.70.5:3001/question/quizNumber/${quizId}/${questionId}`);
      return response.data; // Supposons que l'API renvoie un objet JSON de type { question, options }
    } catch (error) {
      console.error('Erreur lors de la récupération de la question :', error);
      return null;
    }
  };

  // Démarrer le quiz
  const startQuiz = async () => {
    const question = await fetchQuestion(quizId, currentQuestionId);
    if (question) {
      setCurrentQuestion(question); // Mettre à jour la question actuelle pour l'animateur
      socket.emit('startQuiz', { quizId, question }); // Envoyer la première question aux participants
    }
  };

  // Passer à la question suivante
  const nextQuestion = async () => {
    const nextId = currentQuestionId + 1; // Incrémenter l'ID de la question
    const question = await fetchQuestion(quizId, nextId);
    if (question) {
      setCurrentQuestion(question); // Mettre à jour la question actuelle
      setCurrentQuestionId(nextId); // Mettre à jour l'ID de la question
      setShowCorrectAnswer(false); // Réinitialiser l'affichage de la réponse correcte
      socket.emit('nextQuestion', { quizId, question }); // Diffuser la question aux participants
    } else {
      console.log('Aucune autre question disponible.');
    }
  };

  // Afficher la bonne réponse
  const showAnswer = () => {
    setShowCorrectAnswer(true); // Activer l'affichage de la bonne réponse
    socket.emit('showAnswer', { quizId });
  };

  // Arrêter le quiz
  const endQuiz = () => {
    socket.emit('endQuiz', quizId);
    setQuizEnded(true);
  };

  // Gestion des événements Socket.IO côté client
  useEffect(() => {
    socket.on('joinedQuiz', (data) => {
      setMessage(data.message);
    });

    socket.on('quizStarted', (data) => {
      setCurrentQuestion(data.question);
    });

    socket.on('nextQuestion', (data) => {
      setCurrentQuestion(data.question);
    });

    socket.on('showAnswer', () => {
      setShowCorrectAnswer(true); // Activer l'affichage côté participant
    });

    socket.on('quizEnded', () => {
      setQuizEnded(true);
    });

    return () => {
      socket.off('joinedQuiz');
      socket.off('quizStarted');
      socket.off('nextQuestion');
      socket.off('showAnswer');
      socket.off('quizEnded');
    };
  }, []);

  // Si aucun rôle n'est sélectionné
  if (!role) {
    return (
      <div>
        <h1>Choisissez votre rôle</h1>
        <button onClick={() => chooseRole('animateur')}>Je suis l'animateur</button>
        <button onClick={() => chooseRole('participant')}>Je suis un participant</button>
      </div>
    );
  }

  // Interface pour l'animateur
  if (role === 'animateur') {
    return (
      <div>
        <h1>Animateur - Quiz {quizId || 'Non choisi'}</h1>
        {!quizId && (
          <div>
            <h2>Choisissez un quiz à animer</h2>
            <button onClick={() => joinQuiz(1)}>Animer le Quiz 1</button>
            <button onClick={() => joinQuiz(2)}>Animer le Quiz 2</button>
            <button onClick={() => joinQuiz(3)}>Animer le Quiz 3</button>
          </div>
        )}
        {quizId && (
          <div>
            <h2>Contrôle du Quiz</h2>
            <button onClick={startQuiz}>Démarrer le Quiz</button>
            <button onClick={nextQuestion}>Passer à la Question Suivante</button>
            <button onClick={showAnswer}>Afficher la Bonne Réponse</button>
            <button onClick={endQuiz}>Terminer le Quiz</button>

            {currentQuestion && (
              <div>
                <h3>Question actuelle : {currentQuestion.question}</h3>
                <ul>
                  {currentQuestion.options.map((option, index) => (
                    <li
                      key={index}
                      style={{
                        color: showCorrectAnswer && option.isCorrect ? 'green' : 'black',
                        fontWeight: showCorrectAnswer && option.isCorrect ? 'bold' : 'normal',
                      }}
                    >
                      {option.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Interface pour le participant
  if (role === 'participant') {
    return (
      <div>
        <h1>Participant - Quiz {quizId}</h1>
        {currentQuestion ? (
          <div>
            <h2>Question : {currentQuestion.question}</h2>
            <ul>
              {currentQuestion.options.map((option, index) => (
                <li
                  key={index}
                  style={{
                    color: showCorrectAnswer && option.isCorrect ? 'green' : 'black',
                    fontWeight: showCorrectAnswer && option.isCorrect ? 'bold' : 'normal',
                  }}
                >
                  {option.text}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <h2>En attente de la première question...</h2>
        )}
        {message && <p>{message}</p>}
      </div>
    );
  }

  return null;
};

export default Test4;
