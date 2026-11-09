const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const appScript = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");

class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.className = "";
    this.textContent = "";
    this.value = "";
    this.hidden = false;
    this.checked = false;
    this.type = "";
    this.classList = {
      toggle: (className, enabled) => {
        const classes = new Set(this.className.split(/\s+/).filter(Boolean));
        if (enabled) {
          classes.add(className);
        } else {
          classes.delete(className);
        }
        this.className = [...classes].join(" ");
      },
      contains: (className) => this.className.split(/\s+/).includes(className),
    };
  }

  addEventListener(name, listener) {
    this.listeners[name] = listener;
  }

  dispatch(name, event) {
    this.listeners[name](event);
  }

  append(...elements) {
    this.children.push(...elements);
  }

  replaceChildren(...elements) {
    this.children = elements;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  matches(selector) {
    return this.className.split(/\s+/).includes(selector.slice(1));
  }

  focus() {}
}

class MockInput extends MockElement {
  constructor() {
    super("input");
  }
}

class MockButton extends MockElement {
  constructor() {
    super("button");
  }
}

function createApp() {
  const elements = {
    "#task-form": new MockElement("form"),
    "#task-input": new MockInput(),
    "#due-date-input": new MockInput(),
    "#task-list": new MockElement("ul"),
    "#empty-message": new MockElement("p"),
  };
  elements["#task-form"].reset = () => {
    elements["#task-input"].value = "";
    elements["#due-date-input"].value = "";
  };
  const storedValues = new Map();
  let nextId = 0;

  const localStorage = {
    getItem: (key) => storedValues.get(key) ?? null,
    setItem: (key, value) => storedValues.set(key, value),
  };
  const document = {
    querySelector: (selector) => elements[selector],
    createElement: (tagName) => {
      if (tagName === "input") return new MockInput();
      if (tagName === "button") return new MockButton();
      return new MockElement(tagName);
    },
  };

  vm.runInNewContext(appScript, {
    document,
    localStorage,
    crypto: { randomUUID: () => `task-${++nextId}` },
    HTMLInputElement: MockInput,
    HTMLButtonElement: MockButton,
  });

  return { elements, localStorage };
}

function addTask(app, text) {
  app.elements["#task-input"].value = text;
  app.elements["#task-form"].dispatch("submit", { preventDefault() {} });
}

test("adds a task and saves it in browser storage", () => {
  const app = createApp();

  addTask(app, "  Buy groceries  ");

  const task = JSON.parse(app.localStorage.getItem("simple-todo-tasks"))[0];
  assert.equal(task.text, "Buy groceries");
  assert.equal(task.completed, false);
  assert.equal(task.dueDate, "");
  assert.equal(app.elements["#task-list"].children.length, 1);
  assert.equal(app.elements["#task-list"].children[0].children[1].children[0].textContent, "Buy groceries");
});

test("completes a task and saves the completed state", () => {
  const app = createApp();
  addTask(app, "Water the plants");

  const checkbox = app.elements["#task-list"].children[0].children[0];
  checkbox.checked = true;
  app.elements["#task-list"].dispatch("change", { target: checkbox });

  const task = JSON.parse(app.localStorage.getItem("simple-todo-tasks"))[0];
  assert.equal(task.completed, true);
  assert.equal(app.elements["#task-list"].children[0].classList.contains("is-complete"), true);
});

test("deletes a task and updates browser storage", () => {
  const app = createApp();
  addTask(app, "Read a book");

  const deleteButton = app.elements["#task-list"].children[0].children[2];
  app.elements["#task-list"].dispatch("click", { target: deleteButton });

  assert.deepEqual(JSON.parse(app.localStorage.getItem("simple-todo-tasks")), []);
  assert.equal(app.elements["#task-list"].children.length, 0);
  assert.equal(app.elements["#empty-message"].hidden, false);
});
