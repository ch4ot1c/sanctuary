# Sanctuary

Browse your code in peace.

Fly around in 3D and browse a directory tree.

**From the repo root:**

Install: `npm i && npm i -g serve`

List directory: `./scripts/list-directory.js example`

Run: `serve -s -l 5001`

- Text, Markdown, Code, Image (JPG, PNG) support
- VR support!?
- File formats:
  - Images (`.jpg`, `.png`)
  - Text (`.txt`, `.md`)
  - Code (`.cpp`, `.c`, `.h`)

## Usage

Navigate to `localhost:5001` to view

Running the default example uses `example/`. Run the `clone-and-list` script to fetch to your default workspace, `scripts/output/cloned-repos/`.

## TODO

- [ ] Support many file & mime types (SVG, MP4)
- [ ] `q`, `e` for flying `upward`, `downward`
- [ ] Succinct 3D model for a `directory`, and default `file`
- [ ] Handlable UI (Focus, Move)
- [ ] Collapsible directories
- [ ] Secondary edges for file hyperlinks
- [ ] Canvas image rendering option
- [ ] Documentation generator support (Doxygen, JSDoc)
- [ ] HTML5 filesystem support (`bro-fs`) for temporary cloned repos
- [ ] Support for VR devices
- [ ] 2D analog
