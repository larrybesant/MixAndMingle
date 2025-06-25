// Simple WebRTC peer connection setup (client-side)
export function createPeerConnection(config?: RTCConfiguration) {
  return new RTCPeerConnection(config);
}

// Example: Get user media (audio/video)
export async function getUserMedia(constraints: MediaStreamConstraints) {
  return await navigator.mediaDevices.getUserMedia(constraints);
}

// Example: Attach stream to video element
export function attachStreamToVideo(
  videoElement: HTMLVideoElement,
  stream: MediaStream,
) {
  videoElement.srcObject = stream;
}
