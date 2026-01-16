# Animation Library

## Overview
The Animation Library is a web-based application that allows users to explore, experiment with, and share CSS animations. It provides a gallery of animations along with a playground for users to test and customize their animation settings.

## Project Structure
```
animation-library
├── site
│   ├── index.html          # Main gallery page for the animation library
│   ├── playground.html     # Playground for experimenting with animations
│   ├── css
│   │   └── styles.css      # Styles for the site
│   └── js
│       ├── app.js         # Main JavaScript file for the application
│       ├── playground.js   # JavaScript logic for the playground page
│       ├── ui.js          # Manages user interface components
│       ├── export.js       # Handles exporting animation settings and CSS
│       └── share.js        # Manages sharing functionality
├── library
│   ├── animations.json     # JSON array of animation objects
│   └── animations.css      # CSS definitions for the animations
└── README.md               # Documentation for the project
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the `index.html` file in a web browser to view the gallery.
3. Navigate to the `playground.html` file to experiment with animations.

## Usage Guidelines
- Use the search input on the gallery page to find specific animations.
- Select categories to filter animations.
- Click on an animation card to view details and customize settings in the modal.
- In the playground, manipulate animation properties and preview the results in real-time.
- Use the export functionality to download or copy CSS for your animations.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.