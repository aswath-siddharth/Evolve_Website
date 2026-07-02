"use client";

import { useState } from "react";
import { Search, Mail, ExternalLink, GraduationCap, Award, BookOpen, Users } from "lucide-react";
import type { Faculty, Student, Team } from "@/lib/types";

interface MembersDirectoryProps {
  initialFaculty: Faculty[];
  initialStudents: Student[];
  initialTeams: Team[];
}

export function MembersDirectory({
  initialFaculty,
  initialStudents,
  initialTeams,
}: MembersDirectoryProps) {
  const [activeTab, setActiveTab] = useState<"faculty" | "students">("faculty");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter students to show only active members
  const activeStudents = initialStudents.filter((s) => s.status === "active");

  // Filtering based on active tab
  const filteredFaculty = initialFaculty.filter((f) => {
    const query = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(query) ||
      f.email.toLowerCase().includes(query) ||
      f.focus.toLowerCase().includes(query) ||
      (f.role && f.role.toLowerCase().includes(query))
    );
  });

  const filteredStudents = activeStudents.filter((s) => {
    const query = searchQuery.toLowerCase();
    const advisor = initialFaculty.find((f) => f.id === s.facultyId)?.name || "";
    const team = initialTeams.find((t) => t.id === s.teamId)?.name || "";
    return (
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.topic.toLowerCase().includes(query) ||
      advisor.toLowerCase().includes(query) ||
      team.toLowerCase().includes(query)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Evolve Members Directory
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Meet the professors, researchers, and students driving innovations in evolutionary computation, learning, and adaptive systems.
        </p>
      </div>

      {/* Tabs and Search Bar section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        {/* Tabs */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl self-start">
          <button
            onClick={() => {
              setActiveTab("faculty");
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "faculty"
                ? "bg-white text-ocean-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Award size={18} />
            Teachers & Faculty ({initialFaculty.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("students");
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "students"
                ? "bg-white text-ocean-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap size={18} />
            Students ({activeStudents.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder={
              activeTab === "faculty"
                ? "Search faculty by name, email, focus..."
                : "Search students by name, topic, advisor..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 shadow-sm"
          />
        </div>
      </div>

      {/* Grid listing */}
      {activeTab === "faculty" ? (
        filteredFaculty.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFaculty.map((member) => (
              <div
                key={member.id}
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-ocean-200 hover:shadow-md group flex flex-col justify-between"
              >
                {/* Accent Top Border Accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: member.accent || "#0ca2df" }}
                />
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-ocean-700 transition">
                        {member.name}
                      </h3>
                      <p className="text-sm font-semibold text-slate-500 mt-0.5">
                        {member.role || "Faculty Member"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-slate-400 flex-shrink-0" />
                      <a href={`mailto:${member.email}`} className="hover:underline text-slate-700 font-medium">
                        {member.email}
                      </a>
                    </div>

                    <div className="flex items-start gap-2">
                      <BookOpen size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Research Focus
                        </span>
                        <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {member.focus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <a
                    href={`/#faculty`}
                    className="text-xs font-bold text-ocean-700 hover:underline flex items-center gap-1"
                  >
                    View Publications
                  </a>
                  {member.scholarUrl && (
                    <a
                      href={member.scholarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-ocean-700 transition-colors"
                    >
                      Google Scholar
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Users className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-lg font-bold text-slate-700">No faculty members found</p>
            <p className="text-slate-500 mt-1">Try resetting your search query.</p>
          </div>
        )
      ) : filteredStudents.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => {
            const advisor = initialFaculty.find((f) => f.id === student.facultyId);
            const team = initialTeams.find((t) => t.id === student.teamId);

            return (
              <div
                key={student.id}
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-ocean-200 hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-ocean-700 transition">
                        {student.name}
                      </h3>
                      <p className="text-sm font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-slate-400" />
                        Student Researcher
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-slate-400 flex-shrink-0" />
                      <a href={`mailto:${student.email}`} className="hover:underline text-slate-700 font-medium">
                        {student.email}
                      </a>
                    </div>

                    <div className="flex items-start gap-2">
                      <BookOpen size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Research Topic
                        </span>
                        <p className="text-slate-800 font-medium leading-relaxed">
                          {student.topic}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  {advisor && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase">Advisor</span>
                      <span className="font-bold text-slate-700">{advisor.name}</span>
                    </div>
                  )}
                  {team && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase">Lab / Team</span>
                      <span className="font-bold text-slate-700 truncate max-w-[180px]" title={team.name}>
                        {team.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <GraduationCap className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-lg font-bold text-slate-700">No student researchers found</p>
          <p className="text-slate-500 mt-1">Try resetting your search query.</p>
        </div>
      )}
    </div>
  );
}
