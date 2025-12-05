import React from 'react';
import { GenerationConfig, QuestionType } from '../types';
import { Settings, CheckSquare, Square, Type } from 'lucide-react';

interface ConfigPanelProps {
  config: GenerationConfig;
  setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig, onGenerate, isGenerating }) => {
  
  const toggleType = (type: QuestionType) => {
    setConfig(prev => {
      const exists = prev.types.includes(type);
      if (exists) {
        return { ...prev, types: prev.types.filter(t => t !== type) };
      } else {
        return { ...prev, types: [...prev.types, type] };
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
        <Settings className="w-5 h-5 text-slate-600" />
        <h2 className="text-xl font-bold text-slate-800">题库生成配置</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Count Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">生成试题数量</label>
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 150, 200].map(num => (
              <button
                key={num}
                onClick={() => setConfig(prev => ({ ...prev, count: num }))}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                  config.count === num 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 hover:border-blue-300 text-slate-600'
                }`}
              >
                {num} 题
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">*生成大量试题（如100题以上）可能需要较长时间，AI将分批处理，请耐心等待。</p>
        </div>

        {/* Difficulty */}
         <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">试题难度</label>
          <select 
            value={config.difficulty}
            onChange={(e) => setConfig(prev => ({ ...prev, difficulty: e.target.value as any }))}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="基础">基础 (识别明显隐患)</option>
            <option value="进阶">进阶 (包含规范引用)</option>
            <option value="专家">专家 (复杂场景分析)</option>
          </select>
        </div>
      </div>

      {/* Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">题型选择 (多选)</label>
        <div className="flex flex-wrap gap-4">
          {Object.values(QuestionType).map(type => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex items-center space-x-2 py-2 px-4 rounded-lg border transition-all ${
                config.types.includes(type)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              {config.types.includes(type) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <span>{type}</span>
            </button>
          ))}
        </div>
        {config.types.length === 0 && (
          <p className="text-sm text-red-500">请至少选择一种题型</p>
        )}
      </div>

      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={isGenerating || config.types.length === 0}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center space-x-2 transition-all ${
            isGenerating || config.types.length === 0
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>正在分析隐患并生成试题...</span>
            </>
          ) : (
            <>
              <Type className="w-5 h-5" />
              <span>开始生成题库</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;