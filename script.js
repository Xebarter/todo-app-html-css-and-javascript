const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

// Add a new task
addTaskBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const li = document.createElement("li");
  li.innerHTML = `
    ${taskText}
    <button class="delete-btn">Delete</button>
  `;

  taskList.appendChild(li);
  taskInput.value = "";

  // Add delete functionality to the button
  li.querySelector(".delete-btn").addEventListener("click", () => {
    li.remove();
  });
});
