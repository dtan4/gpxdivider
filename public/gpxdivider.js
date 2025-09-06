// GPX Divider JS
// Handles drag-and-drop, parsing, splitting, and download links

document.addEventListener("DOMContentLoaded", function () {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileList = document.getElementById("file-list");

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
  });

  function handleFiles(files) {
    if (!files.length) return;
    const file = files[0];
    if (!file.name.endsWith(".gpx")) {
      alert("Please drop a .gpx file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        splitGPX(e.target.result, file.name);
      } catch (err) {
        alert("Failed to process GPX: " + err);
      }
    };
    reader.readAsText(file);
  }

  function splitGPX(gpxText, originalName) {
    // Parse GPX XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxText, "application/xml");
    const trks = xmlDoc.getElementsByTagName("trk");
    if (!trks.length) {
      alert("No <trk> tags found in this GPX file.");
      return;
    }
    // Get GPX root and header
    const gpxRoot = xmlDoc.documentElement;
    const header = gpxText.split(/<trk[ >]/)[0];
    // Remove previous links
    fileList.innerHTML = "";
    // For each <trk>, create a new GPX file
    Array.from(trks).forEach((trk, i) => {
      // Clone header and <trk>
      const serializer = new XMLSerializer();
      const trkXML = serializer.serializeToString(trk);
      // Compose new GPX
      let gpxOut = header + trkXML + "\n</gpx>\n";
      // Download link
      const blob = new Blob([gpxOut], { type: "application/gpx+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = originalName.replace(/\.gpx$/, "") + `-part${i + 1}.gpx`;
      a.textContent = `Download part ${i + 1}`;
      a.className = "download-link";
      fileList.appendChild(a);
    });
  }
});
