import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image, FileText, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function FileUpload() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadType, setUploadType] = useState('image');
  const fileInputRef = useRef(null);

  const handleUpload = async (type) => {
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.length) return;
    
    setLoading(true);
    setUploadResult(null);
    
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/reports/upload/${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        setUploadResult({ success: true, ...data });
      } else {
        setUploadResult({ success: false, error: data.error });
      }
    } catch (error) {
      setUploadResult({ success: false, error: error.message });
    }
    setLoading(false);
    fileInput.value = '';
  };

  const getAcceptedTypes = () => {
    if (uploadType === 'xray') return 'image/*';
    if (uploadType === 'document') return '.pdf,.jpg,.jpeg,.png';
    return 'image/jpeg,.image/png,.image/webp';
  };

  if (user?.role === 'patient') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">File Upload</h1>
          <p className="text-muted-foreground">Upload medical documents and images</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>Upload X-rays, lab reports, and prescriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger><SelectValue placeholder="Select upload type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Medical Image</SelectItem>
                  <SelectItem value="xray">X-Ray</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
              
              <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptedTypes()}
                onChange={() => handleUpload(uploadType)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload {uploadType === 'xray' ? 'X-ray image' : uploadType}</p>
                  <p className="text-xs text-muted-foreground mt-1">Images will be compressed automatically</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">File Upload</h1>
        <p className="text-muted-foreground">Upload and process medical images, X-rays, and documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Image className="w-5 h-5" /> Medical Images</CardTitle>
            <CardDescription>Upload and compress patient images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={() => handleUpload('image')}
                className="hidden"
                id="upload-image"
              />
              <label htmlFor="upload-image">
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Click to upload image</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Image className="w-5 h-5" /> X-Ray Upload</CardTitle>
            <CardDescription>High-resolution X-ray processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={() => handleUpload('xray')}
                className="hidden"
                id="upload-xray"
              />
              <label htmlFor="upload-xray">
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Click to upload X-ray</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Documents</CardTitle>
            <CardDescription>Upload PDF and image documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={() => handleUpload('document')}
                className="hidden"
                id="upload-document"
              />
              <label htmlFor="upload-document">
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Click to upload document</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {uploadResult && (
        <Card className={uploadResult.success ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uploadResult.success ? (
              <div className="space-y-2">
                <p className="text-sm"><strong>Filename:</strong> {uploadResult.filename}</p>
                <p className="text-sm"><strong>Path:</strong> {uploadResult.filepath}</p>
                <p className="text-sm"><strong>Size:</strong> {(uploadResult.size / 1024).toFixed(2)} KB</p>
                {uploadResult.width && (
                  <p className="text-sm"><strong>Dimensions:</strong> {uploadResult.width}x{uploadResult.height}</p>
                )}
              </div>
            ) : (
              <p className="text-red-500">{uploadResult.error}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>File Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Supported Formats</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Images: JPEG, PNG, WebP, GIF</li>
                <li>Documents: PDF, JPEG, PNG</li>
                <li>X-Rays: All image formats</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Size Limits</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Images: Max 10MB</li>
                <li>Documents: Max 25MB</li>
                <li>Auto-compression applied</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
