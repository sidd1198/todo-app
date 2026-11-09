# Simple To-Do List

A small to-do list web app built with plain HTML, CSS, and JavaScript. Tasks are
saved in your browser, and you can optionally give tasks a due date.

## Requirements

- [Node.js](https://nodejs.org/) 18 or later
- npm (included with Node.js)

## Run locally

1. Open a terminal in this project folder.
2. Install no packages; this project uses Node.js built-ins only.
3. Start the local web server:

   ```sh
   npm run dev
   ```

4. Open <http://127.0.0.1:3000> in your browser.
5. To stop the server, return to the terminal and press **Ctrl+C**.

Tasks are stored in the browser's local storage. They stay available in that
browser on that device, but are not synced between browsers or devices.

## Run tests

Run the automated tests from the project folder:

```sh
npm test
```

The tests cover adding, completing, and deleting tasks.

## Screenshots

To add screenshots to this README:

1. Start the app with `npm run dev` and open <http://127.0.0.1:3000>.
2. Add a few example tasks, including at least one with a due date. Arrange the
   page as you want it to appear in the screenshot.
3. Capture the page using your operating system's screenshot tool.
4. In the project folder, create an `images` folder and save the image there,
   for example as `images/todo-list.png`.
5. Add it to this section using a relative Markdown image link:

   ```markdown
   ![To-do list showing tasks and due dates](images/todo-list.png)
   ```

6. Save the README and image, then commit both files so the screenshot appears
   when viewing the project on GitHub.

No screenshots are included yet; add one using the steps above when you are
ready.
