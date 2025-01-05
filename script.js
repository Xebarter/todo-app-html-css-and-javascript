// Import Firebase Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0QTWu-uEA3JC65OOQGuNxhdQ4qCfBEFc",
  authDomain: "to-do-app-storage.firebaseapp.com",
  projectId: "to-do-app-storage",
  storageBucket: "to-do-app-storage.appspot.com",
  messagingSenderId: "793106384640",
  appId: "1:793106384640:web:b9c8a23fbb309741f615e5",
  measurementId: "G-E3SP92PE3L"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

// Load tasks from Firestore on page load
document.addEventListener("DOMContentLoaded", async () => {
  const tasksSnapshot = await getDocs(collection(db, "tasks"));
  tasksSnapshot.forEach((doc) => {
    const taskData = doc.data();
    addTaskToDOM(doc.id, taskData.text, taskData.completed);
  });
});

// Add a new task to Firestore
addTaskBtn.addEventListener("click", async () => {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const newTaskRef = await addDoc(collection(db, "tasks"), {
    text: taskText,
    completed: false
  });

  addTaskToDOM(newTaskRef.id, taskText, false);
  taskInput.value = "";
});

// Function to add a task to the DOM
function addTaskToDOM(taskId, taskText, completed = false) {
  const li = document.createElement("li");
  li.dataset.id = taskId; // Store the Firestore document ID
  li.innerHTML = `
    <span class="task-text ${completed ? "completed" : ""}">${taskText}</span>
    <button class="edit-btn">Edit</button>
    <button class="delete-btn">Delete</button>
  `;

  taskList.appendChild(li);

  // Mark as completed
  li.querySelector(".task-text").addEventListener("click", async () => {
    const taskTextElement = li.querySelector(".task-text");
    taskTextElement.classList.toggle("completed");
    const isCompleted = taskTextElement.classList.contains("completed");

    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { completed: isCompleted });
  });

  // Edit task
  li.querySelector(".edit-btn").addEventListener("click", () => {
    const taskTextElement = li.querySelector(".task-text");
    const currentText = taskTextElement.textContent;

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = currentText;
    editInput.classList.add("edit-input");

    li.replaceChild(editInput, taskTextElement);

    editInput.addEventListener("blur", async () => saveEdit(li, taskId, editInput));
    editInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") saveEdit(li, taskId, editInput);
    });

    editInput.focus();
  });

  // Delete task
  li.querySelector(".delete-btn").addEventListener("click", async (e) => {
    e.stopPropagation();
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    li.remove();
  });
}

// Save edited task
async function saveEdit(li, taskId, editInput) {
  const updatedText = editInput.value.trim();

  if (updatedText === "") {
    alert("Task cannot be empty!");
    editInput.focus();
    return;
  }

  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { text: updatedText });

  const taskTextElement = document.createElement("span");
  taskTextElement.className = "task-text";
  taskTextElement.textContent = updatedText;

  li.replaceChild(taskTextElement, editInput);

  taskTextElement.addEventListener("click", async () => {
    const isCompleted = taskTextElement.classList.contains("completed");
    taskTextElement.classList.toggle("completed");
    await updateDoc(taskRef, { completed: isCompleted });
  });
}
