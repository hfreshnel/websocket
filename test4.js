import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Initialisation de la connexion Socket.IO
const socket = io('http://10.3.70.5:8080');

const Test4 = () => {
  const [role, setRole] = useState(null); // Animateur ou Participant
  const [quizId, setQuizId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null); // Question actuelle
  const [quizEnded, setQuizEnded] = useState(false); // Indique si le quiz est terminé
  const [message, setMessage] = useState(''); // Messages divers (ex: réponse correcte, etc.)
  const [allQuestions, setAllQuestions] = useState([]); // Historique des questions pour l'animateur

  // Gestion des choix de rôle
  const chooseRole = (selectedRole) => {
    setRole(selectedRole);
  };

  // Rejoindre un quiz spécifique
  const joinQuiz = (id) => {
    setQuizId(id);
    socket.emit('joinQuiz', id);
  };

  // Démarrer le quiz
  const startQuiz = () => {
    const firstQuestion = {
      question: 'Quelle est la capitale de la France ?',
      options: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
    };

    // Envoyer l'événement `startQuiz` au serveur
    socket.emit('startQuiz', { quizId, firstQuestion });
    setAllQuestions([firstQuestion]); // Ajouter la question à l'historique
  };

  // Passer à la question suivante
  const nextQuestion = () => {
    const next = {
      question: 'Combien font 2 + 2 ?',
      options: ['3', '4', '5', '6'],
    };

    // Envoyer l'événement `nextQuestion` au serveur
    socket.emit('nextQuestion', { quizId, nextQuestion: next });
    setAllQuestions((prevQuestions) => [...prevQuestions, next]); // Ajouter à l'historique
  };

  // Afficher la bonne réponse
  const showAnswer = () => {
    const answer = currentQuestion ? currentQuestion.correctAnswer || 'Non spécifiée' : '';
    socket.emit('showAnswer', { quizId, answer });
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
      if (data.type === 'question') {
        setCurrentQuestion(data.data);
        setMessage('');
      }
    });

    socket.on('nextQuestion', (data) => {
      if (data.type === 'question') {
        setCurrentQuestion(data.data);
      }
    });

    socket.on('showAnswer', (data) => {
      if (data.type === 'answer') {
        setMessage(`Réponse : ${data.data}`);
      }
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

  // Si un participant n'a pas encore rejoint un quiz
  if (role === 'participant' && !quizId) {
    return (
      <div>
        <h1>Choisissez un quiz</h1>
        <button onClick={() => joinQuiz(1)}>Rejoindre le Quiz 1</button>
        <button onClick={() => joinQuiz(2)}>Rejoindre le Quiz 2</button>
        <button onClick={() => joinQuiz(3)}>Rejoindre le Quiz 3</button>
      </div>
    );
  }

  // Si le quiz est terminé
  if (quizEnded) {
    return <h1>Le quiz est terminé ! Merci pour votre participation.</h1>;
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

            <h2>Questions en cours :</h2>
            {currentQuestion ? (
              <div>
                <h3>Question actuelle : {currentQuestion.question}</h3>
                <ul>
                  {currentQuestion.options.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Pas encore de question en cours...</p>
            )}

            <h2>Historique des questions :</h2>
            {allQuestions.length > 0 ? (
              <ul>
                {allQuestions.map((q, index) => (
                  <li key={index}>
                    {index + 1}. {q.question}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune question enregistrée pour le moment.</p>
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
                <li key={index}>{option}</li>
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
