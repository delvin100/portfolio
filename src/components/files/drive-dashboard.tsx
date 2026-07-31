"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search, HardDrive, LogOut, ArrowLeftRight, Upload, Loader2 } from "lucide-react";
import { DriveItemCard } from "./drive-item-card";

export interface DriveItem {
  id: string;
  name: string;
  type: "folder" | "file";
  mimeType?: string;
  size?: string;
  updatedAt?: string;
  url?: string;
  icon?: string;
  parentId: string | null;
}

interface DriveDashboardProps {
  accountId: string;
  onSwitchAccount: () => void;
}

export function DriveDashboard({ accountId, onSwitchAccount }: DriveDashboardProps) {
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingItem, setRenamingItem] = useState<DriveItem | null>(null);
  const [newName, setNewName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Breadcrumbs stack
  const [folderStack, setFolderStack] = useState<{id: string, name: string}[]>([{ id: "root", name: "Root" }]);
  const currentFolderId = folderStack[folderStack.length - 1].id;

  const fetchFiles = useCallback(async (query: string = "") => {
    setLoading(true);
    try {
      const url = new URL("/api/drive", window.location.origin);
      url.searchParams.set("accountId", accountId);
      url.searchParams.set("folderId", currentFolderId);
      if (query) url.searchParams.set("q", query);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        // Decorate with parentId for local tracking (search results won't perfectly fit the tree, but that's fine for simple display)
        const decoratedFiles = data.files.map((f: any) => ({ ...f, parentId: currentFolderId }));
        setItems(decoratedFiles);
      }
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setLoading(false);
    }
  }, [accountId, currentFolderId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFiles(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentFolderId, fetchFiles]);

  const handleLogout = async () => {
    await fetch("/api/files/auth", { method: "DELETE" });
    window.location.reload();
  };

  const handleItemClick = (item: DriveItem) => {
    if (item.type === "folder") {
      setFolderStack([...folderStack, { id: item.id, name: item.name }]);
      setSearchQuery("");
    } else {
      // Download or view file
      const url = new URL("/api/drive/download", window.location.origin);
      url.searchParams.set("accountId", accountId);
      url.searchParams.set("fileId", item.id);
      window.open(url.toString(), "_blank");
    }
  };

  const navigateToFolder = (index: number) => {
    setFolderStack(folderStack.slice(0, index + 1));
    setSearchQuery("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", accountId);
    formData.append("folderId", currentFolderId);

    try {
      const res = await fetch("/api/drive/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchFiles(); // Refresh list
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRename = async () => {
    if (!renamingItem || !newName.trim() || newName === renamingItem.name) {
      setRenamingItem(null);
      return;
    }

    try {
      const res = await fetch("/api/drive/rename", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          fileId: renamingItem.id,
          newName: newName.trim(),
        }),
      });
      if (res.ok) {
        fetchFiles(); // Refresh list to get new name
      } else {
        alert("Rename failed.");
      }
    } catch (err) {
      alert("Rename failed.");
    } finally {
      setRenamingItem(null);
      setNewName("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black/5 flex flex-col">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-bold text-xl">
          <HardDrive size={24} />
          <span className="hidden sm:inline">Drive {accountId}</span>
        </div>

        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800/50 border border-transparent dark:border-white/5 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchAccount}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Switch Account"
          >
            <ArrowLeftRight size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Lock Drive"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          {!searchQuery ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 overflow-x-auto pb-2">
              {folderStack.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
                  <button
                    onClick={() => navigateToFolder(index)}
                    className="hover:text-gray-900 dark:hover:text-white font-medium transition-colors whitespace-nowrap"
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Search results for "{searchQuery}"
            </div>
          )}

          <div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              <span className="hidden sm:inline">{uploading ? "Uploading..." : "Upload File"}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <DriveItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={handleItemClick}
                  onRename={(item) => {
                    setRenamingItem(item);
                    setNewName(item.name);
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
            <HardDrive size={48} className="mb-4 opacity-20" />
            <p>This folder is empty.</p>
          </div>
        )}
      </main>

      {/* Rename Modal */}
      <AnimatePresence>
        {renamingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-white/10"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rename Item</h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setRenamingItem(null);
                }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white mb-6"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setRenamingItem(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRename}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
