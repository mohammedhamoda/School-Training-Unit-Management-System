//@ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { PlaySquare, Save, Trash2, Video, Link, UploadCloud, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { db, VideoNote } from '../db';

const CustomVideoPlayer = ({ blob, url, isLocal }: { blob?: Blob, url?: string, isLocal: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    let objectUrl = '';
    if (isLocal && blob) {
      objectUrl = URL.createObjectURL(blob);
      setVideoSrc(objectUrl);
    } else if (url) {
      setVideoSrc(url);
    }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [blob, url, isLocal]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = (Number(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current) videoRef.current.requestFullscreen();
  };

  return (
    <div 
      className="relative w-full h-full bg-black group overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video 
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-all duration-300 transform ${showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>

        <input 
          type="range"
          min="0"
          max="100"
          value={progress || 0}
          onChange={handleProgressChange}
          className="w-full h-1.5 mb-4 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
        />

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-blue-400 transition-colors">
              {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6" />}
            </button>
            
            <button onClick={() => { if(videoRef.current) videoRef.current.currentTime -= 10 }} className="hover:text-blue-400">
              <RotateCcw className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="hover:text-blue-400">
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold bg-black/40 px-2 py-1 rounded">
              {videoRef.current ? Math.floor(videoRef.current.currentTime / 60) : 0}:
              {videoRef.current ? String(Math.floor(videoRef.current.currentTime % 60)).padStart(2, '0') : '00'}
            </span>
            <button onClick={toggleFullScreen} className="hover:text-blue-400">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-blue-600/80 rounded-full flex items-center justify-center text-white animate-pulse">
            <Play className="w-8 h-8 fill-current ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default function VideoLibrary() {
  const [videos, setVideos] = useState<VideoNote[]>([]);
  const [uploadType, setUploadType] = useState<'link' | 'local'>('link');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '', notes: '' });
  const [saveMessage, setSaveMessage] = useState('');

  const loadVideos = async () => {
    const data = await db.videos.reverse().sortBy('id');
    setVideos(data);
  };

  useEffect(() => { loadVideos(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    const newVideo: VideoNote = {
      title: formData.title,
      url: uploadType === 'link' ? formData.url : '',
      videoBlob: uploadType === 'local' && selectedFile ? selectedFile : undefined,
      isVideoLocal: uploadType === 'local',
      notes: formData.notes,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    await db.videos.add(newVideo);
    setSaveMessage('تم حفظ الفيديو بنجاح!');
    setFormData({ title: '', url: '', notes: '' });
    setSelectedFile(null);
    setTimeout(() => setSaveMessage(''), 3000);
    loadVideos();
  };

  const getEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url; 
  };

  return (
    <div className="space-y-8">
      {/* Adding section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
            <Video className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">مكتبة الفيديوهات</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex p-1 bg-slate-100 rounded-xl max-w-md">
            <button type="button" onClick={() => setUploadType('link')} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${uploadType === 'link' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>رابط يوتيوب</button>
            <button type="button" onClick={() => setUploadType('local')} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${uploadType === 'local' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>رفع ملف محلي</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required type="text" name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" placeholder="عنوان الفيديو..." />
            
            {uploadType === 'link' ? (
              <input required type="url" name="url" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-left" placeholder="https://youtube.com/..." dir="ltr" />
            ) : (
              <div className="md:col-span-2 relative">
                <input required type="file" accept="video/*" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="w-full py-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="font-bold text-slate-600">{selectedFile ? selectedFile.name : 'اختر ملف الفيديو'}</span>
                </div>
              </div>
            )}
            <textarea name="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 min-h-[100px]" placeholder="الملاحظات..." />
          </div>

          <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all">
            <Save className="w-5 h-5" /> حفظ في المكتبة
          </button>
        </form>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="w-full aspect-video bg-black relative">
              {video.isVideoLocal && video.videoBlob ? (
                <CustomVideoPlayer blob={video.videoBlob} isLocal={true} />
              ) : video.url?.includes('youtube') ? (
                <iframe src={getEmbedUrl(video.url)} className="w-full h-full" allowFullScreen></iframe>
              ) : (
                <CustomVideoPlayer url={video.url} isLocal={false} />
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-extrabold text-lg text-slate-900">{video.title}</h3>
                <button onClick={() => db.videos.delete(video.id!).then(loadVideos)} className="text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm font-medium whitespace-pre-wrap text-slate-700">
                {video.notes || "لا توجد ملاحظات."}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}