# Sanctuary

Browse your code in peace.

Fly around in 3D and browse a directory tree.

![](example-file-browser.gif)

## Running

### From the repo root -

Install package and http server: `npm i && npm i -g serve`

Create directory listing file: `./scripts/list-directory.js example/`

Run: `serve -s -l 5001`; navigate to `localhost:5001` to view.

The default example runs using the files in `example/`. Run `./scripts/clone-and-list.js` to setup other repos for viewing in `scripts/output/cloned-repos/`.

### Supports -

- Images (`.jpg`, `.png`)
- Text (`.txt`, `.md`)
- Code (`.cpp`, `.c`, `.h`)

## Future Features

- [ ] More file & MIME types (`.svg`, `.mp4`)
- [ ] `q`, `e` for flying `upward`, `downward`
- [ ] Clear 3D default models for directories and files
- [ ] Handlable UI (Focus, Move)
- [ ] Collapsible directories
- [ ] Secondary edges for file hyperlinks
- [ ] Documentation generator support (Doxygen, JSDoc)
- [ ] HTML5 filesystem support (`bro-fs`), for temporary cloned repos
- [ ] Support for VR devices
- [ ] Canvas-based image rendering option
- [ ] 2D analog
