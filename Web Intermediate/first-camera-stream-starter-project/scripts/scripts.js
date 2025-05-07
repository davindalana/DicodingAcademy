let width = 320;
let height = 0;
let streaming = false;
let currentStream = null;

async function startup() {
  const cameraVideo = document.getElementById("camera-video");
  const cameraCanvas = document.getElementById('camera-canvas');
  const cameraTakeButton = document.getElementById('camera-take-button');
  const cameraOutputList = document.getElementById('camera-list-output');
  const cameraListSelect = document.getElementById('camera-list-select');

  function populateTakenPicture(image) {
    cameraOutputList.innerHTML = `
      <li><img src="${image}" alt="Taken picture" />`;
  }

  async function populateCameraList() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((device) => device.kind === 'videoinput');

      cameraListSelect.innerHTML = videoInputs.reduce((html, device, index) => {
        return html + `
          <option value="${device.deviceId}">
            ${device.label || `Camera ${index + 1}`}
          </option>`;
      }, '');
    } catch (error) {
      console.error("Gagal memuat daftar kamera:", error);
    }
  }

  async function getStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: {
            exact: !streaming ? undefined : cameraListSelect.value,
          },
          aspectRatio: 16 / 9,
          width: 1280,
          height: 720,
        },
        // audio: true,
      });
      // const video = document.createElement("video");
      // video.srcObject = stream;
      // video.play();

      // document.body.appendChild(video);

      await populateCameraList(stream);
      return stream;
    } catch (error) {
      throw error;
    }
  }

  function stopCurrentStream() {
    if (currentStream instanceof MediaStream) {
      currentStream.getTracks().forEach((track) => track.stop());
    }
  }

  cameraVideo.addEventListener('canplay', () => {
    if (streaming) {
      return;
    }
    // Calculate height dynamically
    height = (cameraVideo.videoHeight * width) / cameraVideo.videoWidth;
    cameraVideo.setAttribute('width', width.toString());
    cameraVideo.setAttribute('height', height.toString());
    cameraCanvas.setAttribute('width', width.toString());
    cameraCanvas.setAttribute('height', height.toString());
    streaming = true;
  });

  function cameraLaunch(stream) {
    cameraVideo.srcObject = stream;
    cameraVideo.play();
    // TODO: launch camera on video
  }

  function cameraTakePicture() {
    const context = cameraCanvas.getContext('2d');
    cameraCanvas.width = width;
    cameraCanvas.height = height;
    context.drawImage(cameraVideo, 0, 0, width, height);

    return cameraCanvas.toDataURL('image/png');
  }

  cameraListSelect.addEventListener('change', async (evemt) => {
    console.log('Kamera:', event.target.value); 
    stopCurrentStream();
    console.log('Kamera:', event.target.value); 
    currentStream = await getStream();
    cameraLaunch(currentStream);
  });

  cameraTakeButton.addEventListener('click', () => {
    const imageUrl = cameraTakePicture();
    populateTakenPicture(imageUrl);
  });

  async function init() {
    try {
      currentStream = await getStream();
      cameraLaunch(currentStream);

      currentStream.getVideoTracks().forEach((track) => {
        console.log(track.getSettings());
      });
    }
    catch (error) {
      console.error(error);
      alert("Error occured: " + error.message);
    }
  }

  init();
}

window.onload = startup;
