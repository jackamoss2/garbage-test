import { buildMeshFromLandXML } from './landxmlMeshBuilder.js';
import { readLocalFile } from './readLocalFile.js';

export class SceneObjectsManager {
  /**
   * @param {string} folderPath - path to the folder containing LandXML files, e.g. '../geometry/'
   * @param {Array<string>} fileList - list of filenames to load, e.g. ['EG_Harvey.xml', 'FG_Harvey.xml']
   */
  constructor(folderPath, fileList = ['EG_Harvey.xml', 'FG_Harvey.xml']) {
    this.folderPath = folderPath;
    this.fileList = fileList;
    this.objects = []; // array of meshes with extra metadata
  }

  /**
   * Load all objects synchronously
   * Note: you can adapt to async if needed
   */
  loadAll() {
    this.objects = [];

    for (const fileName of this.fileList) {
      try {
        const fullPath = this.folderPath + fileName;
        const xmlString = readLocalFile(fullPath);
        const mesh = buildMeshFromLandXML(xmlString);

        // Add custom metadata
        mesh.userData = mesh.userData || {};
        mesh.userData.fileSourceName = fileName;
        mesh.userData.nickname = this._deriveNickname(fileName);
        mesh.userData.numPoints = this._countPointsInXML(xmlString);

        mesh.name = mesh.userData.nickname; // optional, for easier identification

        this.objects.push(mesh);
      } catch (err) {
        console.error(`Failed to load or parse ${fileName}:`, err);
      }
    }
  }

  /**
   * Simple nickname derived from filename (without extension)
   */
  _deriveNickname(fileName) {
    return fileName.replace(/\.[^/.]+$/, '');
  }

  /**
   * Count number of <P> points in XML string
   */
  _countPointsInXML(xmlString) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const points = xmlDoc.getElementsByTagName('P');
      return points.length;
    } catch {
      return 0;
    }
  }

  /**
   * Return array of loaded meshes
   */
  getObjects() {
    return this.objects;
  }
}
