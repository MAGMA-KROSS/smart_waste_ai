"use client";
import React from "react";
import { Video, PlayCircle } from "lucide-react";

export default function TutorialVideos({ videos = [] }) {
  if (!videos || videos.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Video className="h-4.5 w-4.5 text-rose-600" />
        <h3 className="font-bold text-slate-900">🎥 Relevant Tutorials</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {videos.map((video) => (
          <a
            key={video.videoId}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-xl overflow-hidden border border-slate-100 bg-slate-50 hover:border-emerald-300 transition-colors"
          >
            <div className="relative aspect-video bg-slate-200 overflow-hidden">
              {video.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <PlayCircle className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-800 line-clamp-2">{video.title}</p>
              <p className="text-xs text-slate-500 mt-1">{video.channel}</p>
              <span className="inline-block mt-2 text-xs font-bold text-emerald-700">Watch Tutorial →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
