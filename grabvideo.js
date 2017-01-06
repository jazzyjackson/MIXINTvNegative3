var video = document.getElementById('innertag0').shadowRoot.getElementById('webcam')
navigator.getUserMedia({video: true}, stream => video.src = URL.createObjectURL(stream), err => console.error.bind(console))

// <video autoplay="true" id='webcam' width="100%" ></video>
