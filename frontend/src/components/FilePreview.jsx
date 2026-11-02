import { FileText, FileSpreadsheet, Presentation, File, Archive, Video, Download } from "lucide-react";

const iconMap = {
  pdf:   { Icon: FileText,        color: "text-red-400",    label: "PDF" },
  doc:   { Icon: FileText,        color: "text-blue-400",   label: "DOC" },
  xls:   { Icon: FileSpreadsheet, color: "text-green-400",  label: "XLS" },
  ppt:   { Icon: Presentation,    color: "text-orange-400", label: "PPT" },
  txt:   { Icon: FileText,        color: "text-base-content/60", label: "TXT" },
  zip:   { Icon: Archive,         color: "text-yellow-400", label: "ZIP" },
  video: { Icon: Video,           color: "text-purple-400", label: "VID" },
  other: { Icon: File,            color: "text-base-content/50", label: "FILE" },
};

const FilePreview = ({ fileUrl, fileName, fileType }) => {
  const { Icon, color, label } = iconMap[fileType] || iconMap.other;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName || "file";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-3 py-2 bg-black/10 rounded-lg hover:bg-black/20 transition-colors max-w-[220px] group"
      title={`Download ${fileName || label}`}
    >
      <div className={`shrink-0 ${color}`}>
        <Icon size={28} />
      </div>
      <div className="min-w-0 text-left">
        <p className="text-sm font-medium truncate max-w-[140px]">
          {fileName || `Attachment.${fileType}`}
        </p>
        <p className="text-xs opacity-60 uppercase">{label}</p>
      </div>
      <Download size={14} className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default FilePreview;

