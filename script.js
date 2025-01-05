const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

// Load tasks from localStorage on page load
document.addEventListener("DOMContentLoaded", loadTasks);

// Add a new task
addTaskBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  addTaskToDOM(taskText, false);
  saveTasksToLocalStorage();
  taskInput.value = "";
});

// Function to add a task to the DOM
function addTaskToDOM(taskText, completed = false) {
  const li = document.createElement("li");
  li.innerHTML = `
    <span class="task-text ${completed ? "completed" : ""}">${taskText}</span>
    <button class="edit-btn">Edit</button>
    <button class="delete-btn">Delete</button>
  `;

  taskList.appendChild(li);

  // Add "mark as completed" functionality
  li.querySelector(".task-text").addEventListener("click", () => {
    li.querySelector(".task-text").classList.toggle("completed");
    saveTasksToLocalStorage();
  });

  // Add edit functionality
  li.querySelector(".edit-btn").addEventListener("click", () => {
    const taskTextElement = li.querySelector(".task-text");
    const currentText = taskTextElement.textContent;

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = currentText;
    editInput.classList.add("edit-input");

    li.replaceChild(editInput, taskTextElement);

    editInput.addEventListener("blur", () => saveEdit(li, editInput));
    editInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") saveEdit(li, editInput);
    });

    editInput.focus();
  });

  // Add delete functionality
  li.querySelector(".delete-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    li.remove();
    saveTasksToLocalStorage();
  });
}

// Function to save tasks to localStorage
function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll("#task-list li").forEach((li) => {
    const taskText = li.querySelector(".task-text").textContent;
    const completed = li.querySelector(".task-text").classList.contains("completed");
    tasks.push({ text: taskText, completed });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Function to load tasks from localStorage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks.forEach((task) => {
    addTaskToDOM(task.text, task.completed);
  });
}

// Function to save edited task
function saveEdit(li, editInput) {
  const updatedText = editInput.value.trim();

  if (updatedText === "") {
    alert("Task cannot be empty!");
    editInput.focus();
    return;
  }

  const taskTextElement = document.createElement("span");
  taskTextElement.className = "task-text";
  taskTextElement.textContent = updatedText;

  li.replaceChild(taskTextElement, editInput);

  taskTextElement.addEventListener("click", () => {
    taskTextElement.classList.toggle("completed");
    saveTasksToLocalStorage();
  });

  saveTasksToLocalStorage();
}
