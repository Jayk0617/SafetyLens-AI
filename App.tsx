
import React, { useState } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ConfigPanel from './components/ConfigPanel';
import ResultView from './components/ResultView';
import { GenerationConfig, Question, QuestionType, UploadedMedia } from './types';
import { generateQuestionsFromMedia } from './services/geminiService';

const App: React.FC = () => {
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [config, setConfig] = useState<GenerationConfig>({
    count: 50,
    types: [QuestionType.SINGLE_CHOICE, QuestionType.TRUE_FALSE],
    difficulty: '进阶'
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (media.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedQuestions = await generateQuestionsFromMedia(media, config);
      setQuestions(generatedQuestions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "生成失败，请检查API Key或网络连接。");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetApp = () => {
    setQuestions([]);
    setError(null);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">SafetyLens AI</h1>
              <p className="text-xs text-slate-500 font-medium">企业安全实景题库生成系统</p>
            </div>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-8">
          
          {questions.length === 0 ? (
            <>
              {/* Step 1: Upload */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    上传现场素材
                  </h2>
                  <p className="text-slate-500 text-sm ml-8">
                    上传车间、工地、办公室等实景照片或视频，AI 将自动识别其中的违规操作、隐患点或安全设施。
                  </p>
                </div>
                <ImageUploader media={media} setMedia={setMedia} />
              </section>

              {/* Step 2: Config */}
              {media.length > 0 && (
                 <section>
                    <div className="mb-4 ml-6">
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                        生成设置
                      </h2>
                    </div>
                   <ConfigPanel 
                     config={config} 
                     setConfig={setConfig} 
                     onGenerate={handleGenerate}
                     isGenerating={isGenerating}
                   />
                 </section>
              )}
            </>
          ) : (
            /* Step 3: Result */
            <ResultView questions={questions} onReset={resetApp} />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
