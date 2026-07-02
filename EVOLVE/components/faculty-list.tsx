"use client";

import { useState, useEffect } from "react";
import { BookOpen, GraduationCap, X, Mail, ArrowRight, Sparkles } from "lucide-react";
import type { Faculty, Publication } from "@/lib/types";
import { PublicationCard } from "./publication-card";

export function FacultyList({
  faculty,
  publications
}: {
  faculty: Faculty[];
  publications: Publication[];
}) {
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = (member: Faculty) => {
    setSelectedFaculty(member);
    // Trigger transition next frame
    setTimeout(() => setIsOpen(true), 20);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Unmount after transition finishes (300ms)
    setTimeout(() => setSelectedFaculty(null), 300);
  };

  // Close on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (selectedFaculty) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFaculty]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedFaculty) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedFaculty]);

  return (
    <div>
      {/* Faculty Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {faculty.map((member) => {
          const initials = member.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return (
            <div
              key={member.id}
              onClick={() => handleOpen(member)}
              className="group relative flex flex-col justify-between rounded-2xl border border-ocean-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
              style={{
                borderColor: selectedFaculty?.id === member.id ? member.accent : undefined
              }}
            >
              {/* Hover outline glow */}
              <div 
                className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ backgroundColor: member.accent }}
              />

              <div>
                <div className="flex items-center justify-between">
                  <div
                    className="flex size-12 items-center justify-center rounded-xl text-white font-black text-lg shadow-sm"
                    style={{ backgroundColor: member.accent }}
                  >
                    {initials}
                  </div>
                  <span className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-semibold text-ocean-700">
                    {member.role}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-ocean-700 transition-colors">
                  {member.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {member.focus}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-sm font-bold text-ocean-700 group-hover:text-ocean-900">
                <span>View profile & work</span>
                <ArrowRight 
                  size={16} 
                  className="transition-transform duration-300 group-hover:translate-x-1" 
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Popup overlay */}
      {selectedFaculty && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleClose}
        >
          {/* Modal box */}
          <div
            className={`relative flex flex-col bg-white border border-ocean-100 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl transition-all duration-300 transform ${
              isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors z-10"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row gap-5 items-start justify-between">
              <div className="flex gap-4 items-start">
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-white font-black text-xl shadow-md"
                  style={{ backgroundColor: selectedFaculty.accent }}
                >
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-950">
                    {selectedFaculty.name}
                  </h2>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">
                    {selectedFaculty.role} • {selectedFaculty.focus}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <a
                      href={`mailto:${selectedFaculty.email}`}
                      className="inline-flex items-center gap-1.5 text-slate-600 hover:text-ocean-700 transition-colors font-medium"
                    >
                      <Mail size={15} />
                      {selectedFaculty.email}
                    </a>
                    
                    <a
                      href={selectedFaculty.scholarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-ocean-700 hover:text-ocean-900 transition-colors"
                    >
                      <BookOpen size={15} />
                      Google Scholar Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable publications) */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50/50 rounded-b-3xl">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                <Sparkles size={16} className="text-ocean-600" />
                Featured Publications
              </h4>

              {publications.filter((p) => p.facultyId === selectedFaculty.id).length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-white">
                  <p className="text-slate-500 text-sm">No publications tracked for this faculty member yet.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {publications
                    .filter((p) => p.facultyId === selectedFaculty.id)
                    .slice()
                    .sort((a, b) => {
                      if (b.year !== a.year) return b.year - a.year;
                      if (b.citations !== a.citations) return b.citations - a.citations;
                      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                    })
                    .map((publication) => (
                      <PublicationCard key={publication.id} publication={publication} />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
