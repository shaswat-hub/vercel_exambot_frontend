import { useState, useEffect } from "react";
import axios from "axios";
import { Upload, X, FileText, ClipboardList } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL;

const HomePage = () => {
  const [images, setImages] = useState([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await axios.get(`${API}/ads`);
      setAds(response.data);
    } catch (error) {
      console.error("Error fetching ads:", error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image format`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(",")[1];
        setImages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name: file.name,
            preview: reader.result,
            base64: base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleGenerate = async (type) => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const endpoint =
        type === "summary" ? "/generate/summary" : "/generate/questions";
      const response = await axios.post(`${API}${endpoint}`, {
        images: images.map((img) => img.base64),
      });

      // Clean markdown formatting from AI response
      let cleanedResult = response.data.result;
      // Remove ** for bold
      cleanedResult = cleanedResult.replace(/\*\*/g, '');
      // Remove * for italics
      cleanedResult = cleanedResult.replace(/\*/g, '');
      // Remove # for headings but keep the text
      cleanedResult = cleanedResult.replace(/#{1,6}\s/g, '');

      setResult(cleanedResult);
      toast.success(
        type === "summary"
          ? "Summary generated successfully!"
          : "Question paper generated successfully!"
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Mobile Top Ad */}
      {ads?.top && (
        <div className="lg:hidden w-full">
          <a
            href={ads.top.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="mobile-top-ad"
          >
            <img
              src={ads.top.imageUrl}
              alt="Advertisement"
              className="w-full h-32 object-cover"
            />
          </a>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex gap-6 relative">
          {/* Left Ads - Desktop Only */}
          <div className="hidden lg:flex flex-col gap-6 w-64 flex-shrink-0 sticky top-8 self-start">
            {ads?.left1 && (
              <a
                href={ads.left1.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="desktop-left1-ad"
              >
                <img
                  src={ads.left1.imageUrl}
                  alt="Ad"
                  className="w-full h-80 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                />
              </a>
            )}
            {ads?.left2 && (
              <a
                href={ads.left2.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="desktop-left2-ad"
              >
                <img
                  src={ads.left2.imageUrl}
                  alt="Ad"
                  className="w-full h-80 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                />
              </a>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
                ExamBot
              </h1>
              <p className="text-lg text-gray-600">
                Upload your study material & get instant summaries or question
                papers
              </p>
            </div>

            {/* Upload Section */}
            <Card className="mb-6 shadow-lg" data-testid="upload-section">
              <CardContent className="p-6">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                  data-testid="upload-dropzone"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-3 text-blue-500" />
                    <p className="mb-2 text-sm text-gray-700 font-semibold">
                      Click to upload images
                    </p>
                    <p className="text-xs text-gray-500">
                      JPEG, PNG, WEBP (Multiple files supported)
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    data-testid="image-upload-input"
                  />
                </label>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div
                    className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                    data-testid="image-preview-grid"
                  >
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="relative group"
                        data-testid={`image-preview-${img.id}`}
                      >
                        <img
                          src={img.preview}
                          alt={img.name}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`remove-image-${img.id}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {img.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => handleGenerate("summary")}
                    disabled={loading || images.length === 0}
                    className="flex-1 h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                    data-testid="generate-summary-btn"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Generate Summary
                  </Button>
                  <Button
                    onClick={() => handleGenerate("questions")}
                    disabled={loading || images.length === 0}
                    className="flex-1 h-12 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700"
                    data-testid="generate-questions-btn"
                  >
                    <ClipboardList className="w-5 h-5 mr-2" />
                    Generate Test Paper
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            {(loading || result) && (
              <Card className="shadow-lg" data-testid="results-section">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Result
                  </h2>
                  {loading ? (
                    <div
                      className="flex flex-col items-center justify-center py-12"
                      data-testid="loading-message"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                      </div>
                      <p className="mt-4 text-gray-600 font-medium">
                        Processing your images...
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        AI is analyzing your study material
                      </p>
                    </div>
                  ) : (
                    <div
                      className="prose max-w-none bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto whitespace-pre-wrap"
                      data-testid="result-content"
                    >
                      {result}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Ads - Desktop Only */}
          <div className="hidden lg:flex flex-col gap-6 w-64 flex-shrink-0 sticky top-8 self-start">
            {ads?.right1 && (
              <a
                href={ads.right1.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="desktop-right1-ad"
              >
                <img
                  src={ads.right1.imageUrl}
                  alt="Ad"
                  className="w-full h-80 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                />
              </a>
            )}
            {ads?.right2 && (
              <a
                href={ads.right2.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="desktop-right2-ad"
              >
                <img
                  src={ads.right2.imageUrl}
                  alt="Ad"
                  className="w-full h-80 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow"
                />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Ad */}
      {ads?.bottom && (
        <div className="lg:hidden w-full mt-8">
          <a
            href={ads.bottom.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="mobile-bottom-ad"
          >
            <img
              src={ads.bottom.imageUrl}
              alt="Advertisement"
              className="w-full h-32 object-cover"
            />
          </a>
        </div>
      )}
    </div>
  );
};

export default HomePage;