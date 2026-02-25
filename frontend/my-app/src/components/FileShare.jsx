import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function FileShare({ socket, roomId, currentUser }) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('file-share', {
        roomId,
        userId: currentUser._id,
        userName: currentUser.name,
        fileName: file.name,
        fileData: reader.result,
        fileType: file.type
      });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      <label
        htmlFor="file-upload"
        className="p-2 rounded-md hover:bg-gray-100 cursor-pointer inline-flex items-center"
        title="Share File"
      >
        <Upload className="w-4 h-4" />
      </label>
    </div>
  );
}
