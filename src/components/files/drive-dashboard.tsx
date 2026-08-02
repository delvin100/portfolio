"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search, HardDrive, LogOut, ArrowLeftRight, Upload, Loader2, FolderPlus, X, UploadCloud } from "lucide-react";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
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
  const [isRenaming, setIsRenaming] = useState(false);
  const [deletingItem, setDeletingItem] = useState<DriveItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newName, setNewName] = useState("");
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [quota, setQuota] = useState<{ usage: number, limit: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState<DriveItem | null>(null);
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
    const fetchQuota = async () => {
      try {
        const url = new URL("/api/drive/quota", window.location.origin);
        url.searchParams.set("accountId", accountId);
        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          if (data.quota) {
            const rawUsage = parseInt(data.quota.usage || "0");
            const usageInDrive = parseInt(data.quota.usageInDrive || "0");
            const rawLimit = parseInt(data.quota.limit || "0");
            
            // Google Workspace accounts often return the entire organization's pool limit (e.g. 100TB) 
            // and the entire organization's usage (e.g. 60TB). If the limit is massive, use the drive-specific usage.
            // Also, if it's a college account (accountId 1), the admin soft-limit might be 10GB but API returns 100TB.
            const isPooledWorkspace = rawLimit > 50000000000000; // > 50 TB
            const actualUsage = isPooledWorkspace ? usageInDrive : rawUsage;
            const actualLimit = (isPooledWorkspace && accountId === "1") ? 10 * 1024 * 1024 * 1024 : rawLimit;

            setQuota({
              usage: actualUsage,
              limit: actualLimit
            });
          }
        }
      } catch (err) {}
    };
    fetchQuota();
  }, [accountId]);

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
      if (item.mimeType?.startsWith("image/") || item.mimeType === "application/pdf" || item.mimeType?.startsWith("text/")) {
        setPreviewItem(item);
      } else {
        const url = new URL("/api/drive/download", window.location.origin);
        url.searchParams.set("accountId", accountId);
        url.searchParams.set("fileId", item.id);
        window.open(url.toString(), "_blank");
      }
    }
  };

  const navigateToFolder = (index: number) => {
    setFolderStack(folderStack.slice(0, index + 1));
    setSearchQuery("");
  };

  const uploadFile = async (file: File) => {
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
        const data = await res.json();
        const newFile = { ...data.file, parentId: currentFolderId };
        setItems(prevItems => [newFile, ...prevItems]);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      const res = await fetch("/api/drive/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          folderId: currentFolderId,
          folderName: newFolderName.trim(),
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const newFolder = { ...data.file, parentId: currentFolderId };
        setItems(prevItems => [newFolder, ...prevItems]);
      } else {
        alert("Failed to create folder.");
      }
    } catch (err) {
      alert("Failed to create folder.");
    } finally {
      setIsCreatingFolder(false);
      setShowCreateFolderModal(false);
      setNewFolderName("");
    }
  };

  const handleRename = async () => {
    if (!renamingItem || !newName.trim() || newName === renamingItem.name) {
      setRenamingItem(null);
      return;
    }

    setIsRenaming(true);
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
        setItems(prevItems => prevItems.map(item => 
          item.id === renamingItem.id ? { ...item, name: newName.trim() } : item
        ));
      } else {
        alert("Rename failed.");
      }
    } catch (err) {
      alert("Rename failed.");
    } finally {
      setIsRenaming(false);
      setRenamingItem(null);
      setNewName("");
    }
  };

  const handleDelete = async (item: DriveItem) => {
    setDeletingItem(item);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    try {
      const url = new URL("/api/drive/delete", window.location.origin);
      url.searchParams.set("accountId", accountId);
      url.searchParams.set("fileId", deletingItem.id);

      const res = await fetch(url.toString(), {
        method: "DELETE",
      });
      
      if (res.ok) {
        setItems(prevItems => prevItems.filter(item => item.id !== deletingItem.id));
      } else {
        alert("Delete failed.");
      }
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  const handleDownload = (item: DriveItem) => {
    if (item.type === "file") {
      const url = new URL("/api/drive/download", window.location.origin);
      url.searchParams.set("accountId", accountId);
      url.searchParams.set("fileId", item.id);
      url.searchParams.set("action", "download");
      window.open(url.toString(), "_blank");
    } else {
      const url = new URL("/api/drive/download-folder", window.location.origin);
      url.searchParams.set("accountId", accountId);
      url.searchParams.set("folderId", item.id);
      url.searchParams.set("folderName", item.name);
      window.open(url.toString(), "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black/5 flex flex-col">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-bold text-xl">
          <HardDrive size={24} />
          <span className="hidden sm:inline">
            {accountId === "2" ? "Personal Drive" : "College Drive"}
          </span>
        </div>

        <div className="flex-1 max-w-2xl mx-auto px-4">
          <div className="relative w-full">
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

        <div className="flex items-center gap-4">
          {quota && quota.limit > 0 && (
            <div className="hidden md:flex flex-col gap-1 w-32 xl:w-48 text-xs text-gray-500 dark:text-gray-400 mr-2">
              <div className="flex justify-between">
                <span>Storage</span>
                <span>{formatBytes(quota.usage, 2)} / {formatBytes(quota.limit, 0)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (quota.usage / quota.limit) * 100)}%` }} />
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 border-l border-gray-200 dark:border-white/10 pl-4">
            <button
              onClick={onSwitchAccount}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
              title="Switch Account"
            >
              <ArrowLeftRight size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              title="Lock Drive"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main 
        className="flex-1 p-6 w-full relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-2xl m-6 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400"
            >
              <UploadCloud size={48} className="mb-4" />
              <h2 className="text-2xl font-bold">Drop files to upload</h2>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {!searchQuery ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 overflow-x-auto pb-2">
              {folderStack.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
                  <button
                    onClick={() => navigateToFolder(index)}
                    className="hover:text-gray-900 dark:hover:text-white font-medium transition-colors whitespace-nowrap cursor-pointer"
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

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <FolderPlus size={18} />
              <span className="hidden sm:inline">New Folder</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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
                  onDelete={handleDelete}
                  onDownload={handleDownload}
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

      {/* Create Folder Modal */}
      <AnimatePresence>
        {showCreateFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-white/10"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Folder</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateFolder(); }}>
                <input
                  type="text"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowCreateFolderModal(false);
                  }}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white mb-6"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowCreateFolderModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreatingFolder}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingFolder ? <Loader2 size={16} className="animate-spin" /> : null}
                    {isCreatingFolder ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <form onSubmit={(e) => { e.preventDefault(); handleRename(); }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setRenamingItem(null);
                  }}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white mb-6"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setRenamingItem(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isRenaming}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRenaming ? <Loader2 size={16} className="animate-spin" /> : null}
                    {isRenaming ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-white/10"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Item</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-200">"{deletingItem.name}"</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md">
            <div className="flex justify-between items-center p-4 text-white border-b border-white/10">
              <span className="font-medium">{previewItem.name}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownload(previewItem)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Upload size={18} />
                  <span className="text-sm">Download</span>
                </button>
                <button 
                  onClick={() => setPreviewItem(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer ml-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
              {previewItem.mimeType?.startsWith('image/') ? (
                <img 
                  src={`/api/drive/download?accountId=${accountId}&fileId=${previewItem.id}`} 
                  alt={previewItem.name} 
                  className="max-w-full max-h-full object-contain"
                />
              ) : previewItem.mimeType === 'application/pdf' ? (
                <iframe 
                  src={`/api/drive/download?accountId=${accountId}&fileId=${previewItem.id}#toolbar=0`} 
                  className="w-full h-full rounded-xl bg-white"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white p-4">
                  <iframe 
                    src={`/api/drive/download?accountId=${accountId}&fileId=${previewItem.id}`} 
                    className="w-full h-full rounded-xl bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
