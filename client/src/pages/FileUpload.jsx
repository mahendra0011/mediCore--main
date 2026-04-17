import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image, FileText, Loader2, CheckCircle, XCircle, AlertTriangle, Download, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function FileUpload() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadType, setUploadType] = useState('image');
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUploadedFiles();
    }
  }, [user]);

  const fetchUploadedFiles = async () => {
    setLoadingFiles(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('hms_token');
      const res = await fetch(`${API_URL}/records`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.records) {
        // Extract only records with uploaded files
        const filesWithUploads = data.records.filter(r => r.data?.uploadedFile).map(r => ({
          ...r,
          fileType: r.type,
          uploadedAt: r.createdAt || r.data?.date
        }));
        setFiles(filesWithUploads);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
    setLoadingFiles(false);
  };

  const handleUpload = async (type) => {
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.length) return;
    
    setLoading(true);
    setUploadResult(null);
    
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('hms_token');
      
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: `Server error: ${res.status}` };
      }

      if (!res.ok || !data.success) {
        setUploadResult({ 
          success: false, 
          error: data.error || data.message || `Error: ${res.status}` 
        });
        setLoading(false);
        return;
      }
      
      setUploadResult({ 
        success: true, 
        filename: data.filename,
        size: data.size,
        format: data.format
      });
      
      // Refresh file list
      fetchUploadedFiles();
      fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({ success: false, error: error.message });
    }
    setLoading(false);
  };

  const getAcceptedTypes = () => {
    if (uploadType === 'xray') return 'image/*';
    if (uploadType === 'document') return '.pdf,.jpg,.jpeg,.png,.gif';
    return 'image/jpeg,image/png,image/webp';
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'lab_report') return <Image className="w-5 h-5 text-blue-500" />;
    if (fileType === 'discharge_summary') return <FileText className="w-5 h-5 text-green-500" />;
    if (fileType === 'prescription') return <FileText className="w-5 h-5 text-orange-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const getFileUrl = (file) => {
    return file.data?.uploadedFile?.url || 
           `${API_URL.replace('/api', '')}${file.data?.uploadedFile?.filepath}`;
  };

  const filteredFiles = {
    images: files.filter(f => f.fileType === 'lab_report'),
    documents: files.filter(f => f.fileType === 'discharge_summary' || f.fileType === 'prescription'),
    all: files
  };

  if (!user || user.role !== 'patient') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">File Upload</h1>
          <p className="text-muted-foreground">Upload and process medical images, X-rays, and documents</p>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <p className="text-lg font-medium">Access Restricted</p>
            <p className="text-sm text-muted-foreground mt-1">
              Only patients can upload files.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">File Upload</h1>
        <p className="text-muted-foreground">Upload your medical documents and images. Files are stored securely in Cloudinary.</p>
      </div>

      {/* Upload Success/Error Messages */}
      {uploadResult && (
        <Card className={uploadResult.success ? 'border-green-500' : 'border-red-500'}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {uploadResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {uploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
                </p>
                {uploadResult.success ? (
                  <div className="text-sm text-muted-foreground mt-1">
                    <p><strong>Filename:</strong> {uploadResult.filename}</p>
                    <p><strong>Size:</strong> {formatFileSize(uploadResult.size)}</p>
                    <p><strong>Format:</strong> {uploadResult.format.toUpperCase()}</p>
                  </div>
                ) : (
                  <p className="text-sm text-red-500 mt-1">{uploadResult.error}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload New</TabsTrigger>
          <TabsTrigger value="myfiles">My Files ({files.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Medical Documents</CardTitle>
              <CardDescription>
                Supported formats: PDF, JPG, PNG, GIF (max 25MB). Files are stored in Cloudinary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select File Type</label>
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          <span>Medical Image</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="xray">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          <span>X-Ray</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="document">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Document (PDF/Image)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAcceptedTypes()}
                    onChange={() => handleUpload(uploadType)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <div className="border-2 border-dashed border-primary/50 rounded-xl p-12 text-center cursor-pointer hover:bg-primary/5 transition-all hover:border-primary">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
                      <p className="text-lg font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {uploadType === 'xray' ? 'X-ray images' : 
                         uploadType === 'document' ? 'PDF or image documents' : 
                         'Medical images (JPG, PNG, WebP)'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="myfiles" className="mt-4">
          {loadingFiles ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                <p className="text-muted-foreground mt-2">Loading your files...</p>
              </CardContent>
            </Card>
          ) : filteredFiles.all.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No Files Uploaded Yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your medical documents, images, or X-rays. They'll appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{filteredFiles.images.length}</p>
                        <p className="text-sm text-muted-foreground">Medical Images & X-Rays</p>
                      </div>
                      <Image className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{filteredFiles.documents.length}</p>
                        <p className="text-sm text-muted-foreground">Documents</p>
                      </div>
                      <FileText className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{files.length}</p>
                        <p className="text-sm text-muted-foreground">Total Files</p>
                      </div>
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Files List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.all.map((file, idx) => (
                  <Card key={file._id || idx} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.fileType)}
                          <CardTitle className="text-sm font-medium truncate max-w-[150px]">
                            {file.data?.uploadedFile?.filename || 'Uploaded File'}
                          </CardTitle>
                        </div>
                        <span className="text-xs px-2 py-1 bg-secondary rounded-full capitalize">
                          {file.fileType?.replace('_', ' ') || 'File'}
                        </span>
                      </div>
                      <CardDescription className="text-xs">
                        Uploaded {formatDate(file.uploadedAt || file.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-3">
                        {file.data?.uploadedFile && (
                          <>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Size:</span>
                              <span>{formatFileSize(file.data.uploadedFile.size)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Type:</span>
                              <span className="uppercase">{file.data.uploadedFile.format}</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          asChild
                        >
                          <a 
                            href={getFileUrl(file)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            download
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </a>
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          asChild
                        >
                          <a 
                            href={getFileUrl(file)} 
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
