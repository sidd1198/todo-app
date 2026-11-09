const STORAGE_KEY = "simple-todo-tasks";
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const dueDateInput = document.querySelector("#due-date-input");
const taskList = document.querySelector("#task-list");
const emptyMessage = document.querySelector("#empty-message");

const savedTasks = localStorage.getItem(STORAGE_KEY);
let tasks = savedTasks ? JSON.parse(savedTasks) : [];

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  taskList.replaceChildren();
  emptyMessage.hidden = tasks.length > 0;

  const sortedTasks = [...tasks].sort((first, second) => {
    const firstDate = first.dueDate || "";
    const secondDate = second.dueDate || "";

    if (!firstDate) {
      return secondDate ? 1 : 0;
    }
    if (!secondDate) {
      return -1;
    }
    return firstDate.localeCompare(secondDate);
  });

  for (const task of sortedTasks) {
    const item = document.createElement("li");
    item.className = "task-item";
    item.classList.toggle("is-complete", task.completed);

    const checkbox = document.createElement("input");
    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark "${task.text}" as complete`);
    checkbox.dataset.taskId = task.id;

    const copy = document.createElement("div");
    copy.className = "task-copy";

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    copy.append(text);

    if (task.dueDate) {
      const dueDate = document.createElement("time");
      dueDate.className = "task-due-date";
      dueDate.dateTime = task.dueDate;
      dueDate.textContent = `Due ${formatDueDate(task.dueDate)}`;
      copy.append(dueDate);
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);
    deleteButton.dataset.taskId = task.id;

    item.append(checkbox, copy, deleteButton);
    taskList.append(item);
  }
}

function formatDueDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(year, month - 1, day),
  );
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();

  if (!text) {
    return;
  }

  tasks.push({
    id: crypto.randomUUID(),
    text,
    dueDate: dueDateInput.value,
    completed: false,
  });
  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

taskList.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
    return;
  }

  const task = tasks.find((item) => item.id === event.target.dataset.taskId);
  if (task) {
    task.completed = event.target.checked;
    saveTasks();
    renderTasks();
  }
});

taskList.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLButtonElement) || !event.target.matches(".delete-button")) {
    return;
  }

  tasks = tasks.filter((task) => task.id !== event.target.dataset.taskId);
  saveTasks();
  renderTasks();
});

renderTasks();
