package com.example.myapplication;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;
import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "SocketIO";
    private Socket mSocket;
    private TextView tvQuestion, tvOptions;
    private Button btnStartQuiz, btnNextQuestion, btnShowAnswer, btnEndQuiz;

    private int currentQuestionIndex = 0;
    private JSONArray options;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialiser les éléments de l'interface
        tvQuestion = findViewById(R.id.tvQuestion);
        tvOptions = findViewById(R.id.tvOptions);
        btnStartQuiz = findViewById(R.id.btnStartQuiz);
        btnNextQuestion = findViewById(R.id.btnNextQuestion);
        btnShowAnswer = findViewById(R.id.btnShowAnswer);
        btnEndQuiz = findViewById(R.id.btnEndQuiz);

        // Connexion à Socket.IO
        try {
            mSocket = IO.socket("http://10.3.70.5:8080"); // Remplacez par l'IP de votre serveur
            mSocket.connect();

            mSocket.on("quizStarted", onQuizStarted);
            mSocket.on("newQuestion", onNewQuestion);
            mSocket.on("showAnswer", onShowAnswer);
            mSocket.on("quizEnded", onQuizEnded);

        } catch (Exception e) {
            Log.e(TAG, "Erreur lors de la connexion à Socket.IO", e);
        }

        // Action pour démarrer le quiz
        btnStartQuiz.setOnClickListener(v -> startQuiz());

        // Action pour passer à la question suivante
        btnNextQuestion.setOnClickListener(v -> nextQuestion());

        // Action pour afficher la bonne réponse
        btnShowAnswer.setOnClickListener(v -> showAnswer());

        // Action pour terminer le quiz
        btnEndQuiz.setOnClickListener(v -> endQuiz());
    }

    // Écouteur pour le démarrage du quiz
    private Emitter.Listener onQuizStarted = args -> runOnUiThread(() -> {
        // Code à exécuter quand le quiz commence
        Log.d(TAG, "Le quiz a commencé !");
        tvQuestion.setText("Le quiz a commencé !");
    });

    // Écouteur pour une nouvelle question
    private Emitter.Listener onNewQuestion = args -> runOnUiThread(() -> {
        try {
            JSONObject questionData = (JSONObject) args[0];
            String question = questionData.getString("question");
            options = questionData.getJSONArray("options");

            tvQuestion.setText(question);

            // Affichage des options
            StringBuilder optionsText = new StringBuilder();
            for (int i = 0; i < options.length(); i++) {
                optionsText.append(i + 1).append(". ").append(options.getString(i)).append("\n");
            }
            tvOptions.setText(optionsText.toString());
        } catch (Exception e) {
            Log.e(TAG, "Erreur lors du traitement de la nouvelle question", e);
        }
    });

    // Écouteur pour afficher la bonne réponse
    private Emitter.Listener onShowAnswer = args -> runOnUiThread(() -> {
        try {
            String correctAnswer = ((JSONObject) args[0]).getString("correctAnswer");
            tvQuestion.setText("Bonne réponse : " + correctAnswer);
        } catch (Exception e) {
            Log.e(TAG, "Erreur lors de l'affichage de la réponse", e);
        }
    });

    // Écouteur pour la fin du quiz
    private Emitter.Listener onQuizEnded = args -> runOnUiThread(() -> {
        Log.d(TAG, "Le quiz est terminé !");
        tvQuestion.setText("Le quiz est terminé !");
    });

    // Méthodes pour émettre des événements vers le serveur

    public void startQuiz() {
        if (mSocket.connected()) {
            mSocket.emit("startQuiz");
        }
    }

    public void nextQuestion() {
        if (mSocket.connected()) {
            mSocket.emit("nextQuestion");
        }
    }

    public void showAnswer() {
        if (mSocket.connected()) {
            mSocket.emit("showAnswer");
        }
    }

    public void endQuiz() {
        if (mSocket.connected()) {
            mSocket.emit("endQuiz");
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mSocket != null) {
            mSocket.disconnect();
            mSocket.off("quizStarted", onQuizStarted);
            mSocket.off("newQuestion", onNewQuestion);
            mSocket.off("showAnswer", onShowAnswer);
            mSocket.off("quizEnded", onQuizEnded);
        }
    }
}
