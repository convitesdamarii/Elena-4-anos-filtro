const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const moldura = document.getElementById('moldura');
let currentStream;
let useFrontCamera = true;
let mediaRecorder;
let recordedChunks = [];

async function startCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    const constraints = {
        video: { facingMode: useFrontCamera ? "user" : "environment" }
    };
    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
    } catch (err) {
        alert("Erro ao acessar a câmera: " + err);
    }
}

// FUNÇÃO: TROCAR CÂMERA
document.getElementById('btn-inverter').addEventListener('click', () => {
    useFrontCamera = !useFrontCamera;
    startCamera();
});

// FUNÇÃO: TIRAR FOTO
document.getElementById('btn-foto').addEventListener('click', () => {
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);
    const link = document.createElement('a');
    link.download = 'foto-maya.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// FUNÇÃO: GRAVAR VÍDEO
document.getElementById('btn-video').addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        document.getElementById('icon-video').style.filter = "none";
    } else {
        recordedChunks = [];
        const stream = canvas.captureStream(30); 
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'video-maya.webm';
            a.click();
        };
        mediaRecorder.start();
        document.getElementById('icon-video').style.filter = "invert(20%) sepia(100%) saturate(10000%) hue-rotate(0deg)";
    }
});

startCamera();