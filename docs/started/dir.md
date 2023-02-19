
# Dir

The project structure of the html-to-MasterGo plug-in (specifically the parsing html part):

```
.
├── lib
│   ├── inject.js      # Resolution plug-in main entrance
├── html-to-mastergo
│   ├── frames.js      # Dependencies for building dom structure
│   ├── images.js      # Dependencies for processing pictures
│   ├── index.js       # Plug-in main function
│   ├── nodes.js       # Dependencies required to process Element nodes
│   ├── object.js      # Uitls
│   ├── parser.js      # Regularization processing function
│   ├── styles.js      # Processing style
│   ├── svg.js         # Processing SVG
│   └── text.js        # Dependencies required for processing TEXTNodes
├── layer              # Test file
│   └── HomePage.js    # The display interface for testing needs to be used in the react environment
├──package.json        
└──README.md

```
