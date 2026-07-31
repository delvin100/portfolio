"use client";

import { motion } from "framer-motion";
import { Cloud, GraduationCap } from "lucide-react";

interface AccountSelectorProps {
  onSelect: (accountId: string) => void;
}

export function AccountSelector({ onSelect }: AccountSelectorProps) {
  const accounts = [
    {
      id: "2",
      name: "Personal Drive",
      icon: Cloud,
      color: "bg-blue-500",
      textColor: "text-blue-500",
      description: "Access your personal files",
    },
    {
      id: "1",
      name: "College Drive",
      icon: GraduationCap,
      color: "bg-purple-500",
      textColor: "text-purple-500",
      description: "Access your college files",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Select Drive
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 dark:text-gray-400"
        >
          Choose which Google Drive account you want to access.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        {accounts.map((acc, index) => (
          <motion.button
            key={acc.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(acc.id)}
            className="flex flex-col items-center p-8 rounded-3xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:shadow-2xl transition-all group overflow-hidden relative cursor-pointer"
          >
            
            <div className={`w-20 h-20 mb-6 rounded-2xl ${acc.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <acc.icon className={acc.textColor} size={40} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {acc.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              {acc.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
