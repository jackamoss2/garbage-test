# three-controls

## Project Overview
The three-controls project is a 3D visualization application that utilizes Three.js to render a ramp defined by LandXML data. The application allows users to view and interact with the 3D model of the ramp.

## Project Structure
```
three-controls
├── geometry
│   └── Wilsonville_Ramp.xml       # Contains LandXML data for the ramp geometry.
├── modules
│   └── render.js                   # Contains rendering logic for the 3D scene.
├── textures
│   └── concrete.jpg                # Texture image for applying a concrete finish to the mesh.
├── three.js                        # Main application code with setup functions and mesh building.
├── index.html                      # Entry point HTML file for the application.
├── package.json                    # npm configuration file with dependencies and scripts.
└── README.md                       # Documentation for the project.
```

## Getting Started

### Prerequisites
- Node.js and npm installed on your machine.

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd three-controls
   ```

2. Install the dependencies:
   ```
   npm install
   ```

### Running the Application
1. Open `index.html` in a web browser to view the application.
2. Ensure that the `geometry/Wilsonville_Ramp.xml` file is present for the application to load the ramp data.

## Usage
- The application renders a 3D model of the ramp using the LandXML data provided in `Wilsonville_Ramp.xml`.
- Users can interact with the model using mouse controls to rotate, zoom, and pan the view.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.