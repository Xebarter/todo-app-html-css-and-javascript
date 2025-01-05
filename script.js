import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0QTWu-uEA3JC65OOQGuNxhdQ4qCfBEFc",
  authDomain: "to-do-app-storage.firebaseapp.com",
  projectId: "to-do-app-storage",
  storageBucket: "to-do-app-storage.appspot.com",
  messagingSenderId: "793106384640",
  appId: "1:793106384640:web:b9c8a23fbb309741f615e5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");
const guestBtn = document.getElementById("guest-btn");
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

// State
let isGuest = false; // Track if the user is in guest mode

// Show Tasks (Firebase or LocalStorage)
function renderTask(taskId, taskText, isGuestTask = false) {
  const taskItem = document.createElement("li");
  taskItem.textContent = taskText;
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = async () => {
    if (isGuestTask) {
      // Delete from localStorage
      let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      tasks = tasks.filter((task) => task.id !== taskId);
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } else {
      // Delete from Firebase
      await deleteDoc(doc(db, "tasks", taskId));
    }
    taskItem.remove();
  };
  taskItem.appendChild(deleteBtn);
  taskList.appendChild(taskItem);
}

// Load Tasks (Guest Mode)
function loadGuestTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task) => renderTask(task.id, task.text, true));
}

// Add Task (Guest Mode)
function addGuestTask(taskText) {
  const taskId = Date.now().toString();
  const task = { id: taskId, text: taskText };
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTask(taskId, taskText, true);
}

// Login User
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    authContainer.style.display = "none";
    appContainer.style.display = "block";
    logoutBtn.style.display = "block";

    // Load tasks from Firebase
    onSnapshot(collection(db, "tasks"), (snapshot) => {
      taskList.innerHTML = ""; // Clear the list
      snapshot.forEach((doc) => renderTask(doc.id, doc.data().text));
    });
  } catch (error) {
    alert(error.message);
  }
});

// Sign Up User
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("User signed up successfully. Please log in.");
  } catch (error) {
    alert(error.message);
  }
});

// Logout User
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    authContainer.style.display = "block";
    appContainer.style.display = "none";
    logoutBtn.style.display = "none";
  } catch (error) {
    alert(error.message);
  }
});

// Guest Access
guestBtn.addEventListener("click", () => {
  isGuest = true;
  authContainer.style.display = "none";
  appContainer.style.display = "block";
  logoutBtn.style.display = "block";

  // Load tasks from localStorage
  loadGuestTasks();
});

// Add Task
addTaskBtn.addEventListener("click", async () => {
  const taskText = taskInput.value;
  if (!taskText) return;

  if (isGuest) {
    addGuestTask(taskText);
  } else {
    try {
      await addDoc(collection(db, "tasks"), { text: taskText });
    } catch (error) {
      alert(error.message);
    }
  }
  taskInput.value = ""; // Clear input field
});
