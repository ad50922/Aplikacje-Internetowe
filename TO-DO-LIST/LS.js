class Todo {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.loadTasksFromLocalStorage();
    }

    initElements() {
        this.tasks = [];
        this.taskList = document.getElementById("task-list");
        this.newTaskInput = document.getElementById("new-task");
        this.dueDateInput = document.getElementById("due-date");
        this.addTaskButton = document.getElementById("add-task");
        this.searchInput = document.getElementById("search");
    }

    initEventListeners() {
        this.addTaskButton.addEventListener("click", () => this.addTaskHandler());
        this.searchInput.addEventListener("input", () => this.searchTasksHandler());
    }

    validateTask(task, date) {
        const now = new Date();
        return task.length >= 3 && task.length <= 255 && (date === "" || new Date(date) > now);
    }

    addTask(task, date) {
        if (this.validateTask(task, date)) {
            this.tasks.push({ text: task, date: date });
            this.draw();
            this.saveTasksToLocalStorage();
        } else {
            alert("Zadanie musi mieć od 3 do 255 znaków oraz nie może mieć przeszłej daty.");
        }
    }

    addTaskHandler() {
        this.addTask(this.newTaskInput.value, this.dueDateInput.value);
    }

    deleteTask(index) {
        this.tasks.splice(index, 1);
        this.draw();
        this.saveTasksToLocalStorage();
    }

    saveTasksToLocalStorage() {
        const dataToSave = {
            tasks: this.tasks,
            dueDate: this.dueDateInput.value
        };
        localStorage.setItem("tasks", JSON.stringify(dataToSave));
    }

    loadTasksFromLocalStorage() {
        const savedData = JSON.parse(localStorage.getItem("tasks") || "{}");
        this.tasks = savedData.tasks || [];
        this.dueDateInput.value = savedData.dueDate || "";
        this.draw();
    }

    searchTasks() {
        const searchText = this.searchInput.value.trim().toLowerCase();
        if (searchText.length < 2) {
            this.draw();
            return;
        }

        this.draw();
        this.taskList.querySelectorAll(".task-text").forEach((taskText, index) => {
            const taskTextContent = taskText.innerHTML.toLowerCase();
            if (!taskTextContent.includes(searchText)) {
                taskText.parentElement.parentElement.style.display = "none";
            } else {
                taskText.innerHTML = taskTextContent.replace(new RegExp(searchText, "gi"), match => `<span class="highlight">${match}</span>`);
            }
        });
    }

    searchTasksHandler() {
        this.searchTasks();
    }

    draw() {
        this.taskList.innerHTML = "";
        this.tasks.forEach((task, index) => {
            const li = this.createTaskElement(task, index);
            this.taskList.appendChild(li);
        });
    }

    createTaskElement(task, index) {
        const li = document.createElement("li");
        const taskContainer = document.createElement("div");
        taskContainer.className = "task-container";

        const taskText = this.createTaskTextElement(task.text);
        const taskDate = this.createTaskDateElement(task.date);
        const deleteButton = this.createDeleteButtonElement(index);

        taskContainer.appendChild(taskText);
        taskContainer.appendChild(taskDate);
        taskContainer.appendChild(deleteButton);
        li.appendChild(taskContainer);

        taskText.addEventListener("click", () => {
            this.editTask(taskText);
        });

        deleteButton.addEventListener("click", (event) => {
            this.deleteTask(index);
            event.stopPropagation();
        });

        return li;
    }

    createTaskTextElement(text) {
        const taskText = document.createElement("span");
        taskText.innerHTML = text;
        taskText.className = "task-text";
        return taskText;
    }

    createTaskDateElement(date) {
        const taskDate = document.createElement("span");
        taskDate.innerHTML = date;
        taskDate.className = "task-date";
        return taskDate;
    }

    createDeleteButtonElement(index) {
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Usuń";
        deleteButton.className = "delete-button";
        return deleteButton;
    }

    editTask(taskTextElement) {
        const taskText = taskTextElement.textContent;
        const listItem = taskTextElement.closest("li");
        const taskIndex = Array.from(this.taskList.children).indexOf(listItem);

        listItem.setAttribute("data-index", taskIndex);

        taskTextElement.innerHTML = '';
        const taskInput = this.createTaskInputElement(taskText);
        taskTextElement.appendChild(taskInput);

        taskInput.addEventListener("blur", () => {
            this.saveTaskEdit(taskInput, listItem);
        });

        taskInput.focus();
    }

    createTaskInputElement(value) {
        const taskInput = document.createElement("input");
        taskInput.value = value;
        taskInput.className = "task-input";
        return taskInput;
    }

    saveTaskEdit(taskInput, listItem) {
        const updatedTask = taskInput.value;
        listItem.querySelector(".task-text").textContent = updatedTask;
        listItem.querySelector(".task-date").textContent = this.dueDateInput.value;

        const index = parseInt(listItem.getAttribute("data-index"), 10);

        console.log("Dodanie nowego zadania pod ineksem:", index);

        if (index >= 0 && index < this.tasks.length) {
            this.tasks[index] = { text: updatedTask, date: this.dueDateInput.value };
            console.log("Tasks after update:", this.tasks);
            this.saveTasksToLocalStorage();
        } else {
            console.error("Nieprawidłowe zadanie o indeksie:", index);
        }
    }
}

const todo = new Todo();
