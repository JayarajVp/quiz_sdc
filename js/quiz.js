// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAnalytics } from "firebase/analytics"; // Import Analytics if needed

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGNio4xC3cABa4Gwg60xyIuP-3F8N2nq8",
    authDomain: "quizinsdc.firebaseapp.com",
    projectId: "quizinsdc",
    storageBucket: "quizinsdc.appspot.com",
    messagingSenderId: "668300712765",
    appId: "1:668300712765:web:a4506871b7aac80fa58354",
    measurementId: "G-5T9WB47LGZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Initialize analytics if needed
const db = getFirestore(app); // Initialize Firestore

let currentQuestionIndex = 0;
let score = 0;
let timeTaken = 0;
let timer;
let questions = [];

// Function to fetch questions from Firestore
async function getQuestions() {
    const questionsSnapshot = await db.collection("questions").get();
    questions = questionsSnapshot.docs.map(doc => doc.data());
    displayQuestion();
}

// Function to display the current question
function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        document.getElementById('quiz-container').innerHTML = `
            <h2>${question.question}</h2>
            <ul>
                ${question.options.map(option => `<li><input type="radio" name="answer" value="${option}">${option}</li>`).join('')}
            </ul>
            <button onclick="submitAnswer()">Submit</button>
        `;
        startTimer();
    } else {
        displayResults();
    }
}

// Function to start the timer
function startTimer() {
    timeTaken = 40; // 40 seconds
    timer = setInterval(() => {
        timeTaken--;
        if (timeTaken <= 0) {
            clearInterval(timer);
            alert("Time's up!");
            currentQuestionIndex++;
            displayQuestion();
        }
    }, 1000);
}

// Function to handle answer submission
function submitAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
        if (selectedOption.value === questions[currentQuestionIndex].answer) {
            score++;
        }
        clearInterval(timer);
        currentQuestionIndex++;
        displayQuestion();
    } else {
        alert("Please select an answer!");
    }
}

// Function to display results
function displayResults() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    document.getElementById('score').innerText = score;
    document.getElementById('timeTaken').innerText = 40 - timeTaken; // Total time taken
}

// Function to submit results to Firestore
async function submitResult() {
    const name = prompt("Enter your name:");
    if (name) {
        await db.collection("results").add({
            name: name,
            score: score,
            timeTaken: 40 - timeTaken // Total time taken in seconds
        });
        alert("Results submitted successfully!");
        window.location.href = 'result.html';
    }
}

// Function to display leaderboard
async function displayLeaderboard() {
    const resultsSnapshot = await db.collection("results").orderBy("score", "desc").get();
    const leaderboard = document.getElementById('leaderboard');

    resultsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const row = leaderboard.insertRow();
        row.insertCell(0).innerText = data.name;
        row.insertCell(1).innerText = data.score;
        row.insertCell(2).innerText = data.timeTaken;
    });
}

// Call these functions
getQuestions();
