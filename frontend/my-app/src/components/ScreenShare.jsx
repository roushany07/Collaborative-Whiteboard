import { useState } from 'react';
import { Monitor, MonitorOff } from 'lucide-react';

export default function ScreenShare({ socket, roomId }) {
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState(null);

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      setStream(screenStream);
      setIsSharing(true);

      socket.emit('screen-share-start', { roomId });

      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Screen share error:', error);
      alert('Failed to start screen sharing');
    }
  };

  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsSharing(false);
      socket.emit('screen-share-stop', { roomId });
    }
  };

  return (
    <button
      onClick={isSharing ? stopScreenShare : startScreenShare}
      className={`p-2 rounded-md ${isSharing ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
      title={isSharing ? 'Stop Sharing' : 'Share Screen'}
    >
      {isSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
    </button>
  );
}
