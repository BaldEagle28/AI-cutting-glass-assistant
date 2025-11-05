import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeOrderImage } from './services/geminiService';
import { LogoIcon, ExportIcon } from './components/icons';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    setImageFile(file);
    setAnalysisResult(null);
    setError(null);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile) {
      setError("Vui lòng chọn một hình ảnh để phân tích.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeOrderImage(imageFile);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(`Đã xảy ra lỗi: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleExport = useCallback(() => {
    if (!analysisResult) return;
    
    // Sanitize the markdown for a cleaner text file
    const textContent = analysisResult
      .replace(/###\s(\d\.)\s/g, '\n\n--- $1 ---\n') // Add separators for sections
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\|/g, '\t') // Replace table pipes with tabs
      .replace(/---\n/g, '') // Remove table separators
      .trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ket_qua_cat_kinh.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [analysisResult]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <LogoIcon className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Trợ lý Cắt Kính AI
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Tải lên hình ảnh đơn hàng của bạn. AI sẽ tự động trích xuất, xác nhận và tạo kế hoạch cắt tối ưu nhất.
          </p>
        </header>

        <main className="bg-gray-800 shadow-2xl rounded-xl p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-white border-b-2 border-blue-500 pb-2">1. Tải lên Đơn hàng</h2>
              <FileUpload onFileSelect={handleFileSelect} previewUrl={previewUrl} />
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-white border-b-2 border-blue-500 pb-2">2. Phân tích & Tối ưu</h2>
                <button
                    onClick={handleAnalyzeClick}
                    disabled={!imageFile || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center text-lg shadow-lg"
                >
                    {isLoading ? <LoadingSpinner /> : 'Bắt đầu Phân tích'}
                </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Lỗi! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {isLoading && (
              <div className="text-center p-8 space-y-4">
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                  <p className="text-lg text-blue-300 animate-pulse">AI đang phân tích và tính toán... Vui lòng đợi trong giây lát.</p>
              </div>
          )}
          
          {analysisResult && (
            <div className="mt-8 fade-in-up">
                <div className="flex justify-between items-center border-b-2 border-green-500 pb-2 mb-4">
                    <h2 className="text-2xl font-semibold text-white">Kết quả Tối ưu</h2>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        <ExportIcon className="h-5 w-5" />
                        Xuất Kết quả
                    </button>
                </div>
                <ResultDisplay markdownText={analysisResult} />
            </div>
          )}
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} AI Glass Cutting Assistant. Powered by Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;