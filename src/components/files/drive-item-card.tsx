"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FileText, FileImage, File, ExternalLink, Edit2, Trash2, MoreVertical, Download } from "lucide-react";
import type { DriveItem } from "./drive-dashboard";

interface DriveItemCardProps {
  item: DriveItem;
  onClick: (item: DriveItem) => void;
  onRename: (item: DriveItem) => void;
  onDelete: (item: DriveItem) => void;
  onDownload: (item: DriveItem) => void;
  index: number;
}

export function DriveItemCard({ item, onClick, onRename, onDelete, onDownload, index }: DriveItemCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);
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
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
        <button 
          title="More Actions"
          className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <MoreVertical size={16} />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 flex items-center gap-1 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-20"
            >
              <button 
                title="Rename"
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onRename(item);
                }}
              >
                <Edit2 size={16} />
              </button>
              
              <button 
                title="Download"
                className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/20 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onDownload(item);
                }}
              >
                <Download size={16} />
              </button>

              <button 
                title="Delete"
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onDelete(item);
                }}
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
