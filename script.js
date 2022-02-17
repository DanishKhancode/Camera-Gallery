let video = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-cont");
let recordBtn = document.querySelector(".record-btn");
let captureBtnCont = document.querySelector(".capture-btn-cont");
let captureBtn = document.querySelector(".capture-btn");
let recordFlag = false;
let transparentColor = "transparent";

let recorder;
let chunks = [];

let constraint={
    video: true,
    audio: true
}
navigator.mediaDevices.getUserMedia(constraint).then((stream) => {
    video.srcObject = stream;
    video.play();
    recorder = new MediaRecorder(stream);
    recorder.addEventListener("start", (e) => {
        chunks = [];
    })
    recorder.addEventListener("dataavailable", (e) => {
        chunks.push(e.data);
    })
    recorder.addEventListener("stop", (e) => {
        let blob = new Blob(chunks, { type: "video/mp4" });
        if (db) {
            let videoID = shortid();
            let dbTransaction = db.transaction("video", "readwrite");
            let videoStore = dbTransaction.objectStore("video");
            let videoEntry = {
                id:`vid-${videoID}`,
                blobData:blob
            }
            videoStore.add(videoEntry);
       }
    })
})
recordBtnCont.addEventListener("click", (e) => {
    if (!recorder) return;
    recordFlag = !recordFlag;
    if (recordFlag) {  //video start
        recorder.start();
        recordBtn.classList.add("scale-record");
        startTimer();
    }
    else { //video stop
        recorder.stop();
        recordBtn.classList.remove("scale-record");
        stopTimer();
    }
})
captureBtnCont.addEventListener("click", (e) => {
    captureBtn.classList.add("scale-capture");
    let canves = document.createElement("canvas");
    canves.width = video.videoWidth;
    canves.height = video.videoHeight;
    let tool = canves.getContext("2d");
    tool.drawImage(video, 0, 0, canves.width, canves.height);
    tool.fillStyle = transparentColor;
    tool.fillRect(0, 0, canves.width, canves.height);
    let imageURL = canves.toDataURL();
    if (db) {
        console.log("Saving!!");
        let imageID = shortid();
        let dbTransaction = db.transaction("image", "readwrite");
        let imageStore = dbTransaction.objectStore("image");
        let imageEntry = {
            id:`img-${imageID}`,
            url:imageURL
        }
        console.log(imageEntry);
        imageStore.add(imageEntry);
   }
    setTimeout(() => {
    captureBtn.classList.remove("scale-capture");
},500)
})
let timerID;
let counter = 0;
let timer = document.querySelector(".timer");
function startTimer() {
    timer.style.display = "block";
    function displayTimer() {
        let totalSeconds = counter;
        let hours = Number.parseInt(totalSeconds / 3600);
        totalSeconds = totalSeconds % 3600;
        let minuts = Number.parseInt(totalSeconds / 60);
        totalSeconds = totalSeconds % 60;
        let seconds = totalSeconds;
        hours = (hours < 10) ? `0${hours}` : hours;
        minuts = (minuts < 10) ? `0${minuts}` : minuts;
        seconds = (seconds < 10) ? `0${seconds}` : seconds;
        timer.innerHTML = `${hours}:${minuts}:${seconds}`;
        counter++;
    }
    timerID = setInterval(displayTimer, 1000);
}
function stopTimer() {
    timer.style.display = "none";
    clearInterval(timerID);
    timer.innerText = "00:00:00";
}
let filterLayer = document.querySelector(".filter-layer");
let allFilter = document.querySelectorAll(".filter");
allFilter.forEach((filterElem) => {
    filterElem.addEventListener("click", (e) => {
        transparentColor = getComputedStyle(filterElem).getPropertyValue("background-color");
        filterLayer.style.backgroundColor = transparentColor;
    })
})