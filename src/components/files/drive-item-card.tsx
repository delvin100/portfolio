"use client";

import { motion } from "framer-motion";
import { Folder, FileText, FileImage, File, ExternalLink, Edit2 } from "lucide-react";
import type { DriveItem } from "./drive-dashboard";

interface DriveItemCardProps {
  item: DriveItem;
  onClick: (item: DriveItem) => void;
  onRename: (item: DriveItem) => void;
  index: number;
}

export function DriveItemCard({ item, onClick, onRename, index }: DriveItemCardProps) {
  const getIcon = () => {
    if (item.type === "folder") {
      return <Folder className="text-blue-500 fill-blue-500/20" size={40} />;
    }
    
    // Simple logic for file icons based on mimeType or extension
    if (item.mimeType?.includes('image/')) {
      return <FileImage className="text-purple-500 fill-purple-500/20" size={40} />;
    }
    if (item.mimeType?.includes('pdf')) {
      return <FileText className="text-red-500 fill-red-500/20" size={40} />;
    }
    
    return <File className="text-gray-500 fill-gray-500/20" size={40} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => onClick(item)}
      className="group relative flex flex-col p-4 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl cursor-pointer hover:shadow-xl hover:border-blue-500/30 transition-all overflow-hidden"
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          title="Rename"
          className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors" 
          onClick={(e) => {
            e.stopPropagation();
            onRename(item);
          }}
        >
          <Edit2 size={14} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {getIcon()}
      </div>

      <div className="mt-2 text-center">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate w-full px-2" title={item.name}>
          {item.name}
        </h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {item.type === 'file' ? item.size || 'File' : 'Folder'}
          </span>
          {item.type === 'file' && (
            <ExternalLink size={10} className="text-gray-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
