import { useState } from "react";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileIcon } from "lucide-react";

interface AttachedFile {
  file: File;
  id: string;
}

interface AttachmentsUploadProps {
  attachments: AttachedFile[];
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (fileId: string) => void;
  isLoading?: boolean;
}

export function AttachmentsUpload({
  attachments,
  onFilesAdded,
  onFileRemoved,
  isLoading = false,
}: AttachmentsUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onFilesAdded(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFilesAdded(files);
    e.target.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <FormItem>
      <FormLabel>Anexos</FormLabel>
      
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
          id="file-input"
          accept="*/*"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("file-input")?.click()}
          disabled={isLoading}
        >
          Selecionar Arquivos
        </Button>
      </div>

      {/* Attached Files List */}
      {attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Anexos ({attachments.length})</h4>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{attachment.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onFileRemoved(attachment.id)}
                  disabled={isLoading}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </FormItem>
  );
}
