import React, { useState } from 'react';
import { Question, QuestionType } from '../types';
import { FileDown, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { generateWordDocument } from '../services/docxService';

interface ResultViewProps {
  questions: Question[];
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ questions, onReset }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDownload = () => {
    generateWordDocument(questions);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getTypeColor = (type: QuestionType) => {
    switch (type) {
      case QuestionType.SINGLE_CHOICE: return 'bg-blue-100 text-blue-700 border-blue-200';
      case QuestionType.MULTIPLE_CHOICE: return 'bg-purple-100 text-purple-700 border-purple-200';
      case QuestionType.TRUE_FALSE: return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Helper to strip "A.", "A ", "A、" etc from the start of the string if AI generated it
  const cleanOptionText = (text: string) => {
    return text.replace(/^[A-F][\.\:、\)\s]\s*/i, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="text-green-500 w-7 h-7" />
            生成完成
          </h2>
          <p className="text-slate-500 mt-1">共生成 {questions.length} 道试题，已准备好导出。</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={onReset}
            className="flex-1 md:flex-none py-2 px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            重新制作
          </button>
          <button 
            onClick={handleDownload}
            className="flex-1 md:flex-none py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FileDown className="w-5 h-5" />
            下载 Word 文档
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">试题预览</h3>
          <span className="text-xs text-slate-400">点击题目查看解析</span>
        </div>
        <div className="divide-y divide-slate-100">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div 
                className="flex gap-4 cursor-pointer"
                onClick={() => toggleExpand(q.id)}
              >
                <div className="flex-shrink-0 pt-1">
                  <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 font-bold text-sm">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-grow space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium text-slate-800 text-lg">{q.content}</p>
                    <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${getTypeColor(q.type)}`}>
                      {q.type}
                    </span>
                  </div>
                  
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                          <span className="w-5 h-5 flex items-center justify-center border rounded-full text-xs">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{cleanOptionText(opt)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedId === q.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-300 mx-auto mt-2" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-300 mx-auto mt-2" />
                  )}
                </div>
              </div>

              {expandedId === q.id && (
                <div className="mt-4 pl-12 pr-4 py-4 bg-orange-50 rounded-lg border border-orange-100 text-sm">
                  <div className="flex gap-2 items-start mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <span className="font-bold text-orange-800">隐患焦点:</span>
                    <span className="text-orange-900">{q.hazardFocus}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-bold text-slate-700">正确答案:</span>
                    <span className="ml-2 font-mono text-green-600 font-bold">
                      {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">专业解析:</span>
                    <p className="mt-1 text-slate-600 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultView;