import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Upload,
  File,
  Download,
  Trash2,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react";
import projectsApi from "../../services/projectsApi";
import type {
  ProjectDocument,
  ProjectDocumentCreate,
  DocumentType,
} from "../../types/project";
import { DOCUMENT_TYPE_LABELS } from "../../types/project";

interface ProjectDocumentsProps {
  projectId: string;
  documents: ProjectDocument[];
  onDocumentsChange: (documents: ProjectDocument[]) => void;
}

export const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({
  projectId,
  documents,
  onDocumentsChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState<
    Omit<ProjectDocumentCreate, "file">
  >({
    title: "",
    document_type: "other" as DocumentType,
    description: "",
    version: "1.0",
    is_confidential: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!uploadData.title) {
        const fileName = file.name.split(".")[0];
        setUploadData((prev) => ({ ...prev, title: fileName }));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const documentData: ProjectDocumentCreate = {
        ...uploadData,
        file: selectedFile,
      };

      const newDocument = await projectsApi.uploadDocument(
        projectId,
        documentData
      );
      onDocumentsChange([...documents, newDocument]);

      // Reset form
      setUploadData({
        title: "",
        document_type: "other" as DocumentType,
        description: "",
        version: "1.0",
        is_confidential: false,
      });
      setSelectedFile(null);
      setShowUploadForm(false);
    } catch (error) {
      console.error("Failed to upload document:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await projectsApi.deleteDocument(projectId, documentId);
      onDocumentsChange(documents.filter((doc) => doc.id !== documentId));
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const formatFileSize = (sizeMb: number) => {
    if (sizeMb < 1) return `${Math.round(sizeMb * 1024)} KB`;
    return `${sizeMb.toFixed(1)} MB`;
  };

  const getFileIcon = (extension: string) => {
    if ([".pdf"].includes(extension))
      return <FileText className="h-5 w-5 text-red-500" />;
    if ([".doc", ".docx"].includes(extension))
      return <FileText className="h-5 w-5 text-blue-500" />;
    if ([".xls", ".xlsx"].includes(extension))
      return <FileText className="h-5 w-5 text-green-500" />;
    if ([".ppt", ".pptx"].includes(extension))
      return <FileText className="h-5 w-5 text-orange-500" />;
    if ([".jpg", ".jpeg", ".png", ".gif"].includes(extension))
      return <Eye className="h-5 w-5 text-purple-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Project Documents ({documents.length})
          </CardTitle>
          <Button onClick={() => setShowUploadForm(!showUploadForm)} size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showUploadForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-4">Upload New Document</h4>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title *
                  </label>
                  <Input
                    value={uploadData.title}
                    onChange={(e) =>
                      setUploadData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Contract, SRS, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select
                    value={uploadData.document_type}
                    onChange={(e) =>
                      setUploadData((prev) => ({
                        ...prev,
                        document_type: e.target.value as DocumentType,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version
                  </label>
                  <Input
                    value={uploadData.version}
                    onChange={(e) =>
                      setUploadData((prev) => ({
                        ...prev,
                        version: e.target.value,
                      }))
                    }
                    placeholder="1.0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_confidential"
                    checked={uploadData.is_confidential}
                    onChange={(e) =>
                      setUploadData((prev) => ({
                        ...prev,
                        is_confidential: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="is_confidential"
                    className="text-sm text-gray-700"
                  >
                    Confidential Document
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the document"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File *
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.svg,.zip,.rar"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {selectedFile.name} (
                    {Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={isUploading || !selectedFile}>
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">
              Upload contracts, SRS, plans, and other project documents
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(document.file_extension)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {document.title}
                      </h4>
                      {document.is_confidential && (
                        <span title="Confidential">
                          <EyeOff className="h-4 w-4 text-red-500" />
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {DOCUMENT_TYPE_LABELS[document.document_type]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>v{document.version}</span>
                      <span>{formatFileSize(document.file_size_mb)}</span>
                      <span>
                        Uploaded by {document.uploaded_by.first_name}{" "}
                        {document.uploaded_by.last_name}
                        on {new Date(document.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {document.description && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {document.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(document.file, "_blank")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(document.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
