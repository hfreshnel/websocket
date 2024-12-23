const express = require('express');
const cors = require('cors');  // Import du module cors

const app = express();

// Activer CORS pour toutes les origines (si vous le souhaitez)
app.use(cors()); // Pour autoriser toutes les origines

// Ou spécifier certaines origines (par exemple)
app.use(cors({
  origin: 'http://localhost:3000'  // Autorise uniquement localhost:3001
}));

app.use(express.json()); // Pour parser le corps des requêtes JSON

let salarie = {
    "1": { "nom": "martin", "prenom": "jean" },
    "2": { "nom": "dupont", "prenom": "pierre" }
};

let questions =[
    {
        "data": {
      
          "question": 
      
            {
      
              "id": 1,
      
              "libelle": "Combien font 7 x 8 ?",
      
              "dateDebutQuestion": "2024-12-01T08:05:00",
      
              "propositions": [
      
                {
      
                  "id": 9,
      
                  "libelle": "56",
      
                  "correct": true
      
                },
      
                {
      
                  "id": 10,
      
                  "libelle": "49",
      
                  "correct": false
      
                }
      
              ]
      
            }
      },
      "code": 200,
      "error": null
     } ,

     {
        "data": {
          "question": {
            "id": 2,
            "libelle": "Quel est le résultat de 12 + 15 ?",
            "dateDebutQuestion": "2024-12-02T09:00:00",
            "propositions": [
              {
                "id": 11,
                "libelle": "27",
                "correct": true
              },
              {
                "id": 12,
                "libelle": "30",
                "correct": false
              }
            ]
          }
        },
        "code": 200,
        "error": null
      },
      {
        "data": {
          "question": {
            "id": 3,
            "libelle": "Combien y a-t-il de jours dans une année non bissextile ?",
            "dateDebutQuestion": "2024-12-03T10:00:00",
            "propositions": [
              {
                "id": 13,
                "libelle": "365",
                "correct": true
              },
              {
                "id": 14,
                "libelle": "366",
                "correct": false
              }
            ]
          }
        },
        "code": 200,
        "error": null
      },
      {
        "data": {
          "question": {
            "id": 4,
            "libelle": "Quelle est la capitale de la France ?",
            "dateDebutQuestion": "2024-12-04T11:00:00",
            "propositions": [
              {
                "id": 15,
                "libelle": "Paris",
                "correct": true
              },
              {
                "id": 16,
                "libelle": "Lyon",
                "correct": false
              }
            ]
          }
        },
        "code": 200,
        "error": null
      }
]

let statististiques = [
    {
      "QuizID": 1,
      "QuestionID": 1,
      "PropositionID": 1,
      "ChoicesForProposition": 0,
      "Percentage": 0
    },
    {
      "QuizID": 1,
      "QuestionID": 1,
      "PropositionID": 2,
      "ChoicesForProposition": 3,
      "Percentage": 100
    },
    {
      "QuizID": 1,
      "QuestionID": 1,
      "PropositionID": 3,
      "ChoicesForProposition": 0,
      "Percentage": 0
    },
    {
      "QuizID": 1,
      "QuestionID": 1,
      "PropositionID": 4,
      "ChoicesForProposition": 0,
      "Percentage": 0
    }
  ]

let idQuestion = [
  { "id": 1 },
  { "id": 2 },
  { "id": 3 },
  // Autres ids de question ici
];


let classement=[{"personId":3,"correctAnswers":2,"totalResponseTime":2100740.0,"ranking":1}
        ,{"personId":2,"correctAnswers":2,"totalResponseTime":2100900.0,"ranking":2},
         {"personId":1,"correctAnswers":1,"totalResponseTime":1050310.0,"ranking":3}]


// Route GET pour récupérer tous les utilisateurs
app.get('/1/listeId', (req, res) => {
    res.status(200).json(idQuestion);
});



// Route GET pour récupérer une question par son ID
app.get('/question/:id', (req, res) => {
    const id = req.params.id;
    const question = questions[id];
    if (question) {
        res.status(200).json(question);
    } else {
        res.status(404).send('Question non trouvée');
    }
});

// Route GET pour récupérer les statistiques
app.get('/statistiques', (req, res) => {
    res.status(200).json(statististiques);
});


app.get('/classement', (req, res) => {
  res.status(200).json(classement);
});


// Lancer le serveur
const PORT = 45056;
app.listen(PORT, () => {
    console.log(`API en cours d'exécution sur http://localhost:${PORT}`);
});
