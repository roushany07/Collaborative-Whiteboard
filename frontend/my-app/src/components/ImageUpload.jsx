import { Image } from 'lucide-react';

export default function ImageUpload({ canvasRef, context }) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas && context) {
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <label
        htmlFor="image-upload"
        className="p-2 rounded-md hover:bg-gray-100 cursor-pointer inline-flex"
        title="Upload Image"
      >
        <Image className="w-4 h-4" />
      </label>
    </div>
  );
}
