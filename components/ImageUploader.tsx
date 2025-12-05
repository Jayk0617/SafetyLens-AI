
import React, { useRef } from 'react';
import { Upload, X, Film, AlertCircle } from 'lucide-react';
import { UploadedMedia } from '../types';

interface MediaUploaderProps {
  media: UploadedMedia[];
  setMedia: React.Dispatch<React.SetStateAction<UploadedMedia[]>>;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit for inline API usage

const MediaUploader: React.FC<MediaUploaderProps> = ({ media, setMedia }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newMediaPromises: Promise<UploadedMedia | null>[] = files.map(file => {
        return new Promise((resolve) => {
          if (file.size > MAX_FILE_SIZE) {
            alert(`文件 "${file.name}" 太大 (超过 20MB)。为了保证生成速度，请上传较小的视频或图片。`);
            resolve(null);
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            const isVideo = file.type.startsWith('video/');
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              url: URL.createObjectURL(file),
              base64Data: reader.result as string,
              mimeType: file.type,
              type: isVideo ? 'video' : 'image'
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedItems = await Promise.all(newMediaPromises);
      const validItems = uploadedItems.filter((item): item is UploadedMedia => item !== null);
      
      setMedia(prev => [...prev, ...validItems]);
    }
  };

  const removeMedia = (id: string) => {
    setMedia(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="w-full space-y-4">
      <div 
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="bg-blue-100 p-4 rounded-full mb-4">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">点击上传实景照片或视频</h3>
        <p className="text-sm text-slate-500 mt-2 text-center">
          支持 JPG, PNG, MP4, WEBM<br/>
          (单个文件不超过 20MB)
        </p>
        <input 
          type="file" 
          multiple 
          accept="image/*,video/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {media.map(item => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black">
              {item.type === 'video' ? (
                <div className="w-full h-full flex items-center justify-center relative">
                   <video src={item.url} className="w-full h-full object-cover opacity-80" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Film className="w-8 h-8 text-white opacity-90 drop-shadow-md" />
                   </div>
                   <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">VIDEO</span>
                </div>
              ) : (
                <img src={item.url} alt="Uploaded" className="w-full h-full object-cover" />
              )}
              
              <button 
                onClick={(e) => { e.stopPropagation(); removeMedia(item.id); }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
