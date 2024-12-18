import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

// Initialisation de la connexion Socket.IO
const socket = io('http://10.3.70.5:8080');

const DeroulementDuQuiz = () => {
  const [role, setRole] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [quizEnded, setQuizEnded] = useState(false);
  const [message, setMessage] = useState('');
  const [statistique, setStatistique] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [showStatistique, setShowStatistique] = useState(false);

  // Fonction de choix du rôle
  const chooseRole = (selectedRole) => {
    setRole(selectedRole);
  };

  // Fonction pour rejoindre un quiz
  const joinQuiz = (id) => {
    setQuizId(id);
    socket.emit('joinQuiz', id);
  };

  // Récupérer une question via l'API
  const fetchQuestion = async (quizId, questionId) => {
    try {
      const response = await axios.get(`http://10.3.70.5:45056/question/quizNumber/${quizId}/${questionId}`);
      return response.data; // Données JSON de la question
    } catch (error) {
      console.error('Erreur lors de la récupération de la question :', error);
      return null;
    }
  };

  // Récupérer les statistiques via l'API
  const fetchStatistique = async (quizId,questionId) => {
    try {
      const stat = await axios.get(`http://10.3.70.5:3001/public/${quizId}/${questionId}/stats`);
      return stat.data; // Données statistiques
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques :', error);
      return null;
    }
  };

  // Démarrer le quiz
  const commencerQuiz = async () => {
    const quizId = 1;
    const firstQuestion = await fetchQuestion(quizId, currentQuestionId);

    if (firstQuestion) {
      setCurrentQuestion(firstQuestion.data.question);
      socket.emit('startQuiz', { quizId, firstQuestion: firstQuestion.data.question });
    } else {
      console.error('La première question est introuvable');
    }
  };

  // Afficher la question suivante
  const afficherQuestionSuivante = async () => {
    const quizId = 1;
    const nextId = currentQuestionId;
    const question = await fetchQuestion(quizId, nextId);
    if (question) {
      setCurrentQuestion(question.data.question);
      setCurrentQuestionId(currentQuestionId+1);
      setShowCorrectAnswer(false);
      socket.emit('nextQuestion', { quizId, nextQuestion: question.data.question });
    } else {
      console.log('Aucune autre question disponible.');
    }
  };

  // Afficher les statistiques
  const afficherStatistique = async () => {
    const stats = await fetchStatistique(quizId,currentQuestionId);
    if (stats) {
      setShowStatistique(true);
      setStatistique(stats)
      setMessage(stats);
      socket.emit('showStatistique', { quizId, statistiques:stats });
    } else {
      console.log('Aucune statistique disponible.');
    }
  };

  // Afficher la bonne réponse
  const afficherReponse = () => {
    setShowCorrectAnswer(true);
    socket.emit('showAnswer', { quizId });
  };

  // Arrêter le quiz
  const endQuiz = () => {
    socket.emit('endQuiz', quizId);
    setQuizEnded(true); // Lorsque le quiz est terminé, on met l'état `quizEnded` à true
  };

  // Gestion des événements Socket.IO côté client
  useEffect(() => {
    socket.on('joinedQuiz', (data) => {
      setMessage(data.message);
    });

    socket.on('quizStarted', (data) => {
      setCurrentQuestion(data.data);
    });

    socket.on('nextQuestion', (data) => {
      setCurrentQuestion(data.data);
    });

    socket.on('showStatistique', (data) => {
      setStatistique(data.data);
      setShowStatistique(true)
    });

    socket.on('quizEnded', () => {
      setQuizEnded(true); // Lorsque l'événement `quizEnded` est reçu, on met `quizEnded` à true
    });

    socket.on('showAnswer', () => {
      setShowCorrectAnswer(true);
    });

    return () => {
      socket.off('joinedQuiz');
      socket.off('quizStarted');
      socket.off('nextQuestion');
      socket.off('showAnswer');
      socket.off('quizEnded');
    };
  }, [quizId, currentQuestionId]);

  // Interface pour le choix du rôle
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
            <button onClick={commencerQuiz}>Démarrer le Quiz</button>
            <button onClick={afficherQuestionSuivante}>Passer à la Question Suivante</button>
            <button onClick={afficherReponse}>Afficher la Bonne Réponse</button>
            <button onClick={endQuiz}>Terminer le Quiz</button>
            <button onClick={afficherStatistique}>Voir les Statistiques</button>

            {currentQuestion && currentQuestion.propositions && (
              <div>
                <h3>Question actuelle : {currentQuestion.libelle}</h3>
                <ul>
                  {currentQuestion.propositions.map((option) => (
                    <li
                      key={option.id}
                      style={{
                        color: showCorrectAnswer && option.correct ? 'green' : 'black',
                        fontWeight: showCorrectAnswer && option.correct ? 'bold' : 'normal',
                      }}
                    >
                      {option.libelle}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showStatistique && (
              <div>
                <h3>Statistiques du quiz</h3>
                <p>{message}</p>
              </div>
            )}

            {quizEnded && (
              <div>
                <h2>Quiz terminé !</h2> {/* Affichage du message lorsque le quiz est terminé */}
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
        <h1>Participant - Quiz {quizId || 'Non choisi'}</h1>
        {!quizId && (
          <div>
            <h2>Choisissez un quiz à rejoindre</h2>
            <button onClick={() => joinQuiz(1)}>Rejoindre le Quiz 1</button>
            <button onClick={() => joinQuiz(2)}>Rejoindre le Quiz 2</button>
            <button onClick={() => joinQuiz(3)}>Rejoindre le Quiz 3</button>
          </div>
        )}
        {quizId && currentQuestion && (
          <div>
            <h3>Question actuelle : {currentQuestion.libelle}</h3>
            <ul>
              {currentQuestion.propositions.map((option) => (
                <li
                  key={option.id}
                  style={{
                    color: showCorrectAnswer && option.correct ? 'green' : 'black',
                    fontWeight: showCorrectAnswer && option.correct ? 'bold' : 'normal',
                  }}
                >
                  {option.libelle}
                </li>
              ))}
            </ul>
            {quizEnded && (
              <div>
                <h2>Quiz terminé !</h2> {/* Affichage du message lorsque le quiz est terminé */}
              </div>
            )}
          </div>
          
        )}
      </div>
    );
  }

  return null;
};

export default DeroulementDuQuiz;
