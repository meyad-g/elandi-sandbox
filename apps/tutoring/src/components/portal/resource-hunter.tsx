'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Download,
  Star,
  Clock,
  Copy,
  Share
} from 'lucide-react';

interface AuthoritativeResource {
  title: string;
  url: string;
  reason: string;
}

interface VideoResource {
  title: string;
  url: string;
  timestamp?: string;
}

interface Printables {
  worksheet: string;
  answers: string;
}

interface ResourceHunterProps {
  authoritative: AuthoritativeResource[];
  videos: VideoResource[];
  printables: Printables;
}

export function ResourceHunter({ authoritative, videos, printables }: ResourceHunterProps) {
  const [copiedResource, setCopiedResource] = useState<string | null>(null);

  const handleCopyUrl = async (url: string, title: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedResource(title);
    setTimeout(() => setCopiedResource(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Resource Hunter Header */}
      <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5" />
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="relative z-10 p-4 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 mb-6 lg:mb-8">
            <div>
              <h4 className="text-white font-light text-2xl lg:text-4xl tracking-tight flex items-center space-x-3 lg:space-x-4 mb-2 lg:mb-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg lg:text-xl">🔍</span>
                </div>
                <span>Resource Hunter</span>
              </h4>
              <p className="text-white/60 text-base lg:text-lg font-light">Curated educational resources and materials</p>
            </div>
            
            <div className="flex items-center space-x-3 lg:space-x-4">
              <motion.button
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg lg:rounded-xl transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg text-sm lg:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Export List</span>
              </motion.button>
              <motion.button
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-lg lg:rounded-xl transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg text-sm lg:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Share</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Materials */}
      <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-emerald-500/3 to-teal-500/3" />
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="relative z-10 p-6 lg:p-8">
          <h5 className="text-white font-medium text-xl lg:text-2xl mb-4 lg:mb-6 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span>Printable Materials</span>
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* Worksheet */}
            <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                
                <div className="flex-grow">
                  <h6 className="text-white font-medium text-lg mb-3">Practice Worksheet</h6>
                  <p className="text-white/70 text-sm leading-relaxed mb-4 font-light">
                    {printables.worksheet}
                  </p>
                  <motion.button
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white rounded-lg transition-all duration-200 font-medium text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="h-4 w-4" />
                    <span>Generate</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Answer Sheet */}
            <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-white" />
                </div>
                
                <div className="flex-grow">
                  <h6 className="text-white font-medium text-lg mb-3">Answer Sheet</h6>
                  <p className="text-white/70 text-sm leading-relaxed mb-4 font-light">
                    {printables.answers}
                  </p>
                  <motion.button
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-lg transition-all duration-200 font-medium text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="h-4 w-4" />
                    <span>Generate</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authoritative Sources */}
      <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-indigo-500/3 to-purple-500/3" />
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="relative z-10 p-6 lg:p-8">
          <h5 className="text-white font-medium text-xl lg:text-2xl mb-4 lg:mb-6 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span>Authoritative Sources</span>
          </h5>
          
          <div className="space-y-4">
            {authoritative.map((resource, index) => (
              <motion.div
                key={index}
                className="group relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-6 hover:bg-black/40 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                  <div className="flex-grow">
                    <h6 className="text-white font-medium text-base lg:text-lg mb-2 group-hover:text-blue-300 transition-colors">
                      {resource.title}
                    </h6>
                    <p className="text-white/70 text-sm leading-relaxed mb-3 font-light">
                      {resource.reason}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-white/50">
                      <ExternalLink className="h-3 w-3" />
                      <span className="font-mono">{resource.url.replace('https://', '').split('/')[0]}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => handleCopyUrl(resource.url, resource.title)}
                      className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Copy className="h-4 w-4 text-white" />
                    </motion.button>
                    <motion.a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Open</span>
                    </motion.a>
                  </div>
                </div>
                
                {copiedResource === resource.title && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-2 right-2 px-3 py-1 bg-green-600 text-white text-xs rounded-full"
                  >
                    URL Copied!
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Resources */}
      <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/3 via-pink-500/3 to-orange-500/3" />
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="relative z-10 p-6 lg:p-8">
          <h5 className="text-white font-medium text-xl lg:text-2xl mb-4 lg:mb-6 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Video className="h-4 w-4 text-white" />
            </div>
            <span>Video Explanations</span>
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={index}
                className="group relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-6 hover:bg-black/40 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-9 lg:w-16 lg:h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  
                  <div className="flex-grow">
                    <h6 className="text-white font-medium text-base lg:text-lg mb-2 group-hover:text-red-300 transition-colors">
                      {video.title}
                    </h6>
                    {video.timestamp && (
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="h-3 w-3 text-orange-400" />
                        <span className="text-orange-300 text-sm font-medium">{video.timestamp}</span>
                      </div>
                    )}
                    <motion.a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white rounded-lg transition-all duration-200 font-medium text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Video className="h-4 w-4" />
                      <span>Watch</span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
