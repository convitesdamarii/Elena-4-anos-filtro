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

// // FUNÇÃO: TIRAR FOTO CORRIGIDA
document.getElementById('btn-foto').addEventListener('click', () => {
    const ctx = canvas.getContext('2d');
    
    // Define o tamanho do canvas exatamente igual ao tamanho da moldura (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // Desenha o vídeo ocupando todo o fundo, recortando as sobras para não achatar
    const videoRatio = video.videoWidth / video.videoHeight;
    const canvasRatio = canvas.width / canvas.height;
    let sw, sh, sx, sy;

    if (videoRatio > canvasRatio) {
        sh = video.videoHeight;
        sw = video.videoHeight * canvasRatio;
        sx = (video.videoWidth - sw) / 2;
        sy = 0;
    } else {
        sw = video.videoWidth;
        sh = video.videoWidth / canvasRatio;
        sx = 0;
        sy = (video.videoHeight - sh) / 2;
    }

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    
    // Desenha a moldura por cima sem distorcer
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