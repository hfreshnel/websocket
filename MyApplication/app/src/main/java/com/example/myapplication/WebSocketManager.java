package com.example.myapplication2;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

/**
 * Classe de gestion de la connexion au socket
 * @author William Priso and Clovis Neya
 *
 */
public class WebSocketManager {

    private static WebSocketManager instance;
    private static Socket mSocket;
    private final Map<String, Emitter.Listener> eventListeners = new HashMap<>();

    private WebSocketManager() {
        try {
            mSocket = IO.socket("http://192.168.0.29:8080");
            mSocket.connect();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Permet de se connecter au websocket
     * @return le singleton de connexion au socket
     */
    public static synchronized WebSocketManager getInstance() {
        if (instance == null) {
            instance = new WebSocketManager();
        }
        return instance;
    }

    /**
     * Permet d'ecouter les evenements
     * @param event "joinedQuiz", "quizStarted", "nextQuestion", "showStatistique", "showClassement", "showAnswer", "quizEnded"
     * @param listener methode executée lorsque lorsque ce message est recu
     */
    public void on(String event, Emitter.Listener listener) {
        if (mSocket != null ) {
            if (!eventListeners.containsKey(event)) {
                mSocket.on(event, listener);
                eventListeners.put(event, listener);
            }
        }
    }

    /**
     * Permet d'arreter d'ecouter un evenement
     * @param event
     */
    public void off(String event) {
        if (mSocket != null && eventListeners.containsKey(event)) {
            mSocket.off(event, eventListeners.get(event));
            eventListeners.remove(event);
        }
    }

    /**
     * Publier un evement
     * @param event "joinQuiz", "startQuiz", "showAnswer", "nextQuestion", "showStatistique", "showClassement", "endQuiz"
     * @param data données que l'on souhaite publier au format JSON
     */
    public void emit(String event, JSONObject data) {
        if (mSocket != null && mSocket.connected()) {
            mSocket.emit(event, data);
        }
    }

    /**
     * Se deconnecter du socket
     */
    public void disconnect() {
        if (mSocket != null) {
            for (Map.Entry<String, Emitter.Listener> entry : eventListeners.entrySet()) {
                mSocket.off(entry.getKey(), entry.getValue());
            }
            mSocket.disconnect();
        }
    }

    /**
     * Permet d'extraire la question de la reponse du socket
     * @param socketData Liste d'objets transmise par le socket
     * @return l'objet question
     */
    public JSONObject extractQuestion(Object... socketData){
        //Extraction des informations importantes recues par le socket
        JSONObject data = (JSONObject) socketData[0];
        JSONObject question;
        try {
            question = data.getJSONObject("data");
            question = question.getJSONObject("data");
            return question;
        } catch (JSONException e) {
            return null;
        }
    }

    /**
     * Permet d'extraire les statistiques de la reponse du socket
     * @param socketData Liste d'objets transmise par le socket
     * @return l'objet statistique
     */
    public JSONObject extractStatistique(Object... socketData){
        //Extraction des informations importantes recues par le socket
        JSONObject data = (JSONObject) socketData[0];
        try {
            JSONObject statistiques = data.getJSONObject("data");
            return statistiques;
        } catch (JSONException e) {
            return null;
        }
    }

    /**
     * Permet d'extraire le classement de la reponse du socket
     * @param socketData Liste d'objets transmise par le socket
     * @return l'objet classement
     */
    public JSONObject extractClassement(Object... socketData){
        //Extraction des informations importantes recues par le socket
        JSONObject data = (JSONObject) socketData[0];
        try {
            JSONObject classement = data.getJSONObject("data");
            return classement;
        } catch (JSONException e) {
            return null;
        }
    }
}
