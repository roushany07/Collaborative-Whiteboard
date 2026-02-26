import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Phone, PhoneOff, PhoneIncoming } from 'lucide-react';

export default function VideoCall({ socket, roomId, currentUser }) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerId, setCallerId] = useState(null);
  const [callerName, setCallerName] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-declined', handleCallDeclined);
    socket.on('video-offer', handleVideoOffer);
    socket.on('video-answer', handleVideoAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-declined');
      socket.off('video-offer');
      socket.off('video-answer');
      socket.off('ice-candidate');
      socket.off('call-ended');
    };
  }, [socket]);

  const handleIncomingCall = ({ callerId, callerName }) => {
    setIncomingCall(true);
    setCallerId(callerId);
    setCallerName(callerName);
  };

  const acceptCall = async () => {
    setIncomingCall(false);
    socket.emit('call-accepted', { roomId, callerId });
    await setupLocalStream();
  };

  const declineCall = () => {
    socket.emit('call-declined', { roomId, callerId });
    setIncomingCall(false);
    setCallerId(null);
    setCallerName('');
  };

  const handleCallAccepted = async () => {
    setIsCalling(false);
    await createAndSendOffer();
  };

  const handleCallDeclined = () => {
    setIsCalling(false);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    alert('Call declined');
  };

  const setupLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            roomId,
            candidate: event.candidate
          });
        }
      };

      peerConnectionRef.current = peerConnection;
      setIsCallActive(true);
    } catch (error) {
      console.error('Error accessing media:', error);
      alert('Failed to access camera/microphone');
    }
  };

  const createAndSendOffer = async () => {
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit('video-offer', {
        roomId,
        offer,
        userId: currentUser._id
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const startCall = async () => {
    setIsCalling(true);
    socket.emit('call-user', {
      roomId,
      callerId: currentUser._id,
      callerName: currentUser.name
    });
    await setupLocalStream();
  };

  const handleVideoOffer = async ({ offer, userId }) => {
    if (userId === currentUser._id) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socket.emit('video-answer', {
        roomId,
        answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleVideoAnswer = async ({ answer }) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async ({ candidate }) => {
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    socket.emit('call-ended', { roomId });
    setIsCallActive(false);
    setIsCalling(false);
    setRemoteStream(null);
  };

  const handleCallEnded = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsCallActive(false);
    setIsCalling(false);
    setRemoteStream(null);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };

  return (
    <div className="relative">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <div className="text-center">
              <PhoneIncoming className="w-16 h-16 mx-auto mb-4 text-green-600 animate-bounce" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Incoming Call</h3>
              <p className="text-gray-600 mb-6">{callerName} is calling...</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={declineCall}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <PhoneOff className="w-5 h-5" />
                  Decline
                </button>
                <button
                  onClick={acceptCall}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calling Modal */}
      {isCalling && !isCallActive && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <div className="text-center">
              <Phone className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Calling...</h3>
              <p className="text-gray-600 mb-6">Waiting for response</p>
              <button
                onClick={endCall}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
              >
                <PhoneOff className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Active Call Screen */}
      {isCallActive && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl max-h-3xl p-4">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={toggleVideo}
                className="p-4 bg-gray-700 text-white rounded-full hover:bg-gray-600"
              >
                {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
              <button
                onClick={endCall}
                className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Button */}
      <button
        onClick={isCallActive ? endCall : startCall}
        disabled={isCalling}
        className={`p-2 rounded-md ${isCallActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} hover:opacity-80 disabled:opacity-50`}
        title={isCallActive ? 'End Call' : 'Start Video Call'}
      >
        {isCallActive ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
      </button>
    </div>
  );
}
