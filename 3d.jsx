
let objs = []

const loadManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadManager)

const mdConverter = new showdown.Converter()
mdConverter.setFlavor('github')

const config = {
  // path: './photos_2',
  meshScale: 10,
  imageDepth: 2,
  minTextWidth: 800,
  minTextHeight: 80
}

// Util
const removeProperty = (obj, propertyName) => {
  let { [propertyName]: _, ...result } = obj
  return result
}

// Select only the 'body' of a node in directory-tree-formatted json
const nodeData = x => removeProperty({...x, name: x.path, id: x.path}, 'children')

const domElemFromText = (text, path, extension) => {
  const root = document.createElement('div')
  root.id = 'c-' + path
  root.style.width = config.minTextWidth + 'px'
  // root.style.height = config.minTextHeight + 'px'

  switch (extension) {
    case '.txt': {
      const textElem = document.createElement('p')
      textElem.innerText = text
      root.appendChild(textElem)
      break
    }
    case '.markdown':
    case '.md': {
      const textElem = document.createElement('div')
      textElem.innerHTML = mdConverter.makeHtml(text)
      // textElem.style.width = config.minTextWidth + 'px'

      root.appendChild(textElem)
      break
    }
    case '.cpp':
    case '.c':
    case '.h': {
      const textElem = document.createElement('div')
      textElem.innerHTML = mdConverter.makeHtml('```c++\n' + text + '\n```')
      // textElem.style.width = config.minTextWidth + 'px'

      hljs.highlightBlock(textElem)

      root.appendChild(textElem)
      break
    }
    default:
      console.error('Unknown plaintext extension: ', extension)
  }

  return root
}

const torusMaterial =
  new THREE.MeshLambertMaterial({
    color: Math.round(Math.random() * Math.pow(2, 24)),
    transparent: true,
    opacity: 0.75
  })

const twoFaceBoxFaceMaterials = [
  // The two primary faces will be inserted later.
  /*
  new THREE.MeshBasicMaterial({ // Front face
    color: 0xff0000,
  }),
  new THREE.MeshBasicMaterial({ // Back face
    color: 0x00ff00,
  }),
  */
  new THREE.MeshBasicMaterial({
    color: 0x0000ff,
  }),
  new THREE.MeshBasicMaterial({
    color: 0x0000ff,
  }),
  new THREE.MeshBasicMaterial({
    color: 0x0000ff,
  }),
  new THREE.MeshBasicMaterial({
    color: 0x0000ff,
  })
]

const numericCSS = (numStr) => {
  return parseInt(numStr.slice(0,-2))
}

const fetchText = async (path) => {
  try {
    const res = await fetch(path)
    const mime = res.headers.get('Content-Type')
    console.log(mime)
    switch (mime) {
      case 'text/plain':
        break
    }
    return await res.text()
  } catch (e) {
    console.error(e)
  }
}


/* Build Nodes & Links for ForceGraphVR, loading files & creating textures as we go */
const buildGraphData = async (dir) => {
  /* DFS: immediately visit each leaf, so we can begin loading it as a texture */

  let q = [dir] // stack, initialized with root dir

  let nodes = [] // {path, name: path, size, type, id: path, (type: 'file' ? extension: String), (extension: 'jpg'|'png' ? tex: Object)}
  let links = [] // {source: id1, target: id2}

  while (q.length != 0) {
    const o = q.pop()

    // Skip dotfiles
    // -- If this line is uncommented, models all stack :(
    // if (o.path.split('/').slice(-1)[0][0] === '.') break

    // Now, Capture the file or directory as a node
    nodes = [...nodes, nodeData(o)]
    let n = nodeData(o)

    switch (o.type) {
      case 'file': { // Leaves! Note: Links are created by parents.
        console.log(o.path)
        const res = await fetch(o.path)
        const mime = res.headers.get('Content-Type')
        // console.log(mime.split('/'))
        const mime0 = mime.split(';')[0]
        switch (mime0) { // ;charset=utf-8
          case 'text/plain':
          case 'text/markdown':
          case 'text/x-c':
          case 'text/html':
            const txt = await res.text()
            console.info('txt:', txt)

            const elem = domElemFromText(txt, o.path, o.extension)
            console.info(elem)
            document.body.appendChild(elem)

            html2canvas(elem).then(canvas => {
              if (canvas.height == 0) {
                console.log(canvas.id)
                canvas.height = 2
                canvas.style.width = 2 // canvas.height
              }
              document.body.appendChild(canvas) // TODO hide?
              console.info(canvas)

              const mesh = new THREE.BoxGeometry(config.imageDepth, numericCSS(canvas.style.height), numericCSS(canvas.style.width))
              const mat = new THREE.MeshBasicMaterial()
              mat.map = new THREE.CanvasTexture(canvas) // TODO Add option for CSS3DObjects as a text renderer instead
              const meshMat = [mat, mat, ...twoFaceBoxFaceMaterials]
              objs[n.id] = new THREE.Mesh(mesh, meshMat)
            })
            break
          case 'image/png':
          case 'image/jpg':
          case 'image/jpeg': {
            const onImgLoad = tex => {
              // console.info(tex)

              // Prevent stretching texture to nearest 2^n
              //  apparently, this fixes itself with WebGL2 (just omit & it doesn't resize)
              tex.minFilter = THREE.LinearFilter

              n = {...n, tex}
              // console.info(n)

              const meshWidth = tex.image.width / config.meshScale
              const meshHeight = tex.image.height / config.meshScale

              // Create mesh
              const mesh = new THREE.BoxGeometry(config.imageDepth, meshHeight, meshWidth)
              const mat = new THREE.MeshBasicMaterial({ map: n.tex })
              const meshMat = [mat, mat, ...twoFaceBoxFaceMaterials]
              objs[n.id] = new THREE.Mesh(mesh, meshMat)
            }

            const onImgError = err => {
              console.error(err)
            }
            textureLoader.load(o.path, onImgLoad, undefined, onImgError)
            break
          }
          default:
            console.error('Unknown mime type:', mime, o.path)
            //const mesh = new THREE.TorusKnotGeometry(2, 1)
            //objs[n.id] = new THREE.Mesh(mesh, torusMaterial)
        }
        break
      }

      case 'directory': {
        for (const c of o.children) { // Add all children for next iteration
          // Create link
          links = [...links, { source: nodeData(o).id, target: nodeData(c).id }]
          q.push(c)
        }

        const mesh = new THREE.TorusKnotGeometry(6, 1)
        objs[n.id] = new THREE.Mesh(mesh, torusMaterial)
        break
      }
    }
  }

  return { nodes, links }
}

/*
TODO
npm scripts should enable:
- git clone to a temp dir
- run directory-tree against temp dir
- pipe output to webapp input for rendering
- git cleanup?

usage:
- `npm run clone-and-start gh-username/repo-name`
- `npm run start [dir-root-path]`
*/

// Note: Pain Point: `directory-tree` doesn't work in a web browser context, even with Browserify.
// Instead, local files can be configured via the npm scripts.
// (Otherwise, we would just be able to: `import dirTree from 'directory-tree'`)

const readDirectoryTree = async (path) => {
  // Check expected location of npm script `list-directory` output
  // Default: `scripts/output/currentDirectoryTree.txt`
  const res = await fetch(path)
  return await res.json()
}

const load = async () => {
  // Read in the directory listing.
  const tree = await readDirectoryTree('scripts/output/currentDirectoryTree.txt') // TODO vary based on config.path
  console.info('Directory Tree:\n', tree)

  const loadingElem = document.querySelector('#loading')
  const progressBarElem = loadingElem.querySelector('.progressbar')

  // Overall steps:
  // 1. for filetypes of interest (images), load as texture asynchronously
  // 2. capture width, height info
  // 3. build mesh from texture dimensions
  // 4. otherwise, build default mesh for filetype/dir

  const graphData = await buildGraphData(tree)
  //console.log('graphData:', graphData)

  const threeObj = (n) => objs[n.path]

  /* Load textures */
  loadManager.onLoad = () => {
    console.log('Textures loaded.')
    loadingElem.style.display = 'none'

    ReactDOM.render(
      <ForceGraphVR
        graphData={graphData}
        nodeThreeObject={threeObj}
      />,
      document.getElementById('graph')
    )
  }

  loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
    console.info('Texture loaded: ', urlOfLastItemLoaded)
    const progress = itemsLoaded / itemsTotal
    progressBarElem.style.transform = `scaleX(${progress})`
  }
}

//setTimeout(() => {
(async () => {
  const ok = await load()
  //console.info(ok)
})()
//}, 500)
