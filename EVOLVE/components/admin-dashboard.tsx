"use client";

import { useMemo, useState, useTransition } from "react";
import type { ComponentType } from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  Copy,
  KeyRound,
  LogOut,
  MailPlus,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X
} from "lucide-react";
import type { Faculty, Invite, Publication, Student, Team, User } from "@/lib/types";
import { cn } from "@/lib/utils";

type SafeUser = Omit<User, "password"> & { passwordSet?: boolean };

export function AdminDashboard({
  currentUser,
  faculty,
  initialInvites,
  initialStudents,
  initialTeams,
  initialUsers,
  publications
}: {
  currentUser: SafeUser;
  faculty: Faculty[];
  initialInvites: Invite[];
  initialStudents: Student[];
  initialTeams: Team[];
  initialUsers: SafeUser[];
  publications: Publication[];
}) {
  const [selectedFaculty, setSelectedFaculty] = useState(currentUser.facultyId || faculty[0]?.id || "");
  const [studentEmail, setStudentEmail] = useState("");
  const [hoursValid, setHoursValid] = useState(48);
  const [inviteTeamId, setInviteTeamId] = useState("");
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState("");
  
  const [invites, setInvites] = useState(initialInvites);
  const [students, setStudents] = useState(initialStudents);
  const [teams, setTeams] = useState(initialTeams);
  const [users, setUsers] = useState(initialUsers);
  const [facultiesState, setFacultiesState] = useState(faculty);

  // Create Team state
  const [teamDraft, setTeamDraft] = useState({ name: "", project: "", description: "" });
  const [coMentorIds, setCoMentorIds] = useState<string[]>([]);

  // Edit Team state
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamProject, setEditTeamProject] = useState("");
  const [editTeamDescription, setEditTeamDescription] = useState("");
  const [editTeamCoMentorIds, setEditTeamCoMentorIds] = useState<string[]>([]);

  // Direct Add Student state
  const [directStudentName, setDirectStudentName] = useState("");
  const [directStudentEmail, setDirectStudentEmail] = useState("");
  const [directStudentTopic, setDirectStudentTopic] = useState("");
  const [directStudentPassword, setDirectStudentPassword] = useState("");
  const [directStudentTeamId, setDirectStudentTeamId] = useState("");

  // Super Admin - User search and filters
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "faculty" | "student" | "super_admin">("all");

  // Super Admin - User Creation state
  const [createUserDraft, setCreateUserDraft] = useState({
    name: "",
    email: "",
    password: "",
    role: "faculty" as User["role"],
    facultyId: "",
    scholarUrl: "",
    scholarUser: "",
    focus: "Evolutionary computation",
    accent: "#0ca2df",
    topic: "",
    teamId: ""
  });

  // Super Admin - User Editing state
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [editUserDraft, setEditUserDraft] = useState({
    name: "",
    email: "",
    password: "",
    role: "faculty" as User["role"],
    facultyId: "",
    studentId: "",
    scholarUrl: "",
    scholarUser: "",
    focus: "",
    accent: "#0ca2df",
    topic: "",
    teamId: ""
  });

  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isSuperAdmin = currentUser.role === "super_admin";
  const selectedMember = facultiesState.find((member) => member.id === selectedFaculty) || facultiesState[0];

  // A team belongs to the selected faculty if they are primary mentor OR co-mentor
  const visibleTeams = teams.filter((team) => team.facultyId === selectedFaculty || (team.coMentorIds || []).includes(selectedFaculty));
  
  // Filter active and pending students for selected faculty
  const activeStudents = students.filter((s) => s.status === "active" && s.facultyId === selectedFaculty);
  const pendingRequests = students.filter((s) => s.status === "pending" && s.facultyId === selectedFaculty);
  const visibleInvites = invites.filter((invite) => invite.facultyId === selectedFaculty);
  
  const latestPublications = publications
    .filter((publication) => publication.facultyId === selectedFaculty)
    .slice(0, 5);

  const joinLinkBase = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/join/${selectedFaculty}`;
  }, [selectedFaculty]);

  const inviteBase = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/invite`;
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
      const matchesRole = userRoleFilter === "all" ? true : u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearchQuery, userRoleFilter]);

  const createStudentInvite = () => {
    setMessage("");
    setGeneratedInviteUrl("");
    startTransition(async () => {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyId: selectedFaculty,
          teamId: inviteTeamId || undefined,
          email: studentEmail,
          hoursValid
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error || "Could not create invite");
        return;
      }

      const inviteUrl = `${inviteBase}/${payload.invite.id}`;
      setInvites((current) => [payload.invite, ...current]);
      setStudentEmail("");
      setGeneratedInviteUrl(inviteUrl);

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(inviteUrl);
          setMessage("Invite link generated and copied to clipboard successfully!");
        } catch {
          setMessage("Invite link generated successfully.");
        }
      } else {
        setMessage("Invite link generated successfully.");
      }
    });
  };

  const handleAddStudentDirectly = () => {
    setMessage("");
    if (!directStudentEmail.toLowerCase().endsWith("amrita.edu")) {
      setMessage("Student email must be an official college email (@amrita.edu or @*.amrita.edu)");
      return;
    }
    startTransition(async () => {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: directStudentName,
          email: directStudentEmail,
          topic: directStudentTopic,
          password: directStudentPassword,
          teamId: directStudentTeamId || undefined
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Could not add student");
        return;
      }
      setStudents((current) => [payload.student, ...current]);
      
      // Update users state
      const newUser: SafeUser = {
        id: `user-${payload.student.id}`,
        name: payload.student.name,
        email: payload.student.email,
        role: "student",
        facultyId: selectedFaculty,
        studentId: payload.student.id,
        status: "active",
        createdAt: new Date().toISOString(),
        passwordSet: true
      };
      setUsers((current) => [newUser, ...current]);

      setDirectStudentName("");
      setDirectStudentEmail("");
      setDirectStudentTopic("");
      setDirectStudentPassword("");
      setDirectStudentTeamId("");
      setMessage(`Student "${payload.student.name}" added directly.`);
    });
  };

  const handleApproveRequest = (studentId: string) => {
    setMessage("");
    startTransition(async () => {
      const response = await fetch(`/api/students/${studentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Could not approve request");
        return;
      }
      setStudents((current) =>
        current.map((s) => (s.id === studentId ? payload.student : s))
      );
      
      // Update local users list
      const newUser: SafeUser = {
        id: `user-${studentId}`,
        name: payload.student.name,
        email: payload.student.email,
        role: "student",
        facultyId: selectedFaculty,
        studentId: studentId,
        status: "active",
        createdAt: new Date().toISOString(),
        passwordSet: true
      };
      setUsers((current) => [newUser, ...current]);
      setMessage(`Join request approved for "${payload.student.name}".`);
    });
  };

  const handleRejectRequest = (studentId: string) => {
    setMessage("");
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    startTransition(async () => {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const payload = await response.json();
        setMessage(payload.error || "Could not reject request");
        return;
      }
      setStudents((current) => current.filter((s) => s.id !== studentId));
      setMessage("Join request rejected and removed.");
    });
  };

  const saveTeam = () => {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...teamDraft, facultyId: selectedFaculty, coMentorIds })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Could not save team");
        return;
      }
      setTeams((current) => [payload.team, ...current]);
      setTeamDraft({ name: "", project: "", description: "" });
      setCoMentorIds([]);
      setMessage("Team created successfully");
    });
  };

  const startEditingTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setEditTeamName(team.name);
    setEditTeamProject(team.project);
    setEditTeamDescription(team.description || "");
    setEditTeamCoMentorIds(team.coMentorIds || []);
  };

  const handleUpdateTeam = () => {
    if (!editingTeamId) return;
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTeamId,
          name: editTeamName,
          project: editTeamProject,
          description: editTeamDescription,
          coMentorIds: editTeamCoMentorIds
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Could not update team");
        return;
      }
      setTeams((current) =>
        current.map((t) => (t.id === editingTeamId ? payload.team : t))
      );
      setEditingTeamId(null);
      setMessage("Team updated successfully");
    });
  };

  const updateStudentDetails = (student: Student, updates: Partial<Student>) => {
    startTransition(async () => {
      const response = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Could not update student");
        return;
      }
      setStudents((current) =>
        current.map((item) => (item.id === student.id ? payload.student : item))
      );
      if (updates.password || updates.email || updates.name) {
        setUsers((current) =>
          current.map((u) =>
            u.studentId === student.id
              ? {
                  ...u,
                  name: updates.name || u.name,
                  email: updates.email || u.email,
                  passwordSet: updates.password ? true : u.passwordSet
                }
              : u
          )
        );
      }
      setMessage("Student updated successfully");
    });
  };

  const resetPassword = (student: Student) => {
    const password = window.prompt(`New password for ${student.name}`);
    if (!password) return;
    updateStudentDetails(student, { password });
  };

  const handleCreateUser = () => {
    setMessage("");
    startTransition(async () => {
      // If creating faculty, auto-generate a facultyId
      let facultyId = createUserDraft.facultyId;
      if ((createUserDraft.role === "faculty" || createUserDraft.role === "super_admin") && !facultyId) {
        facultyId = createUserDraft.name.toLowerCase().replace(/\s+/g, "-");
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createUserDraft.name,
          email: createUserDraft.email,
          password: createUserDraft.password,
          role: createUserDraft.role,
          facultyId: facultyId || undefined
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Could not save user");
        return;
      }

      setUsers((current) => [payload.user, ...current]);

      // If user is faculty, update local facultiesState
      if (payload.user.role === "faculty" || payload.user.role === "super_admin") {
        const newFaculty: Faculty = {
          id: facultyId,
          name: createUserDraft.name,
          email: createUserDraft.email,
          role: "Faculty",
          scholarUrl: createUserDraft.scholarUrl,
          scholarUser: createUserDraft.scholarUser,
          focus: createUserDraft.focus,
          accent: createUserDraft.accent
        };
        
        // Push faculty detail to dynamic list API or local state
        await fetch(`/api/users/${payload.user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scholarUrl: createUserDraft.scholarUrl,
            scholarUser: createUserDraft.scholarUser,
            focus: createUserDraft.focus,
            accent: createUserDraft.accent
          })
        });

        setFacultiesState((current) => [...current, newFaculty]);
      }

      setCreateUserDraft({
        name: "",
        email: "",
        password: "",
        role: "faculty",
        facultyId: "",
        scholarUrl: "",
        scholarUser: "",
        focus: "Evolutionary computation",
        accent: "#0ca2df",
        topic: "",
        teamId: ""
      });
      setMessage("Faculty login account and profile created successfully.");
    });
  };

  const handleEditUserClick = (user: SafeUser) => {
    setEditingUser(user);
    
    // Find associated student or faculty profile details
    let scholarUrl = "";
    let scholarUser = "";
    let focus = "";
    let accent = "#0ca2df";
    let topic = "";
    let teamId = "";

    if (user.role === "faculty" || user.role === "super_admin") {
      const fac = facultiesState.find((f) => f.id === user.facultyId);
      if (fac) {
        scholarUrl = fac.scholarUrl;
        scholarUser = fac.scholarUser;
        focus = fac.focus;
        accent = fac.accent;
      }
    } else if (user.role === "student" && user.studentId) {
      const stud = students.find((s) => s.id === user.studentId);
      if (stud) {
        topic = stud.topic;
        teamId = stud.teamId || "";
      }
    }

    setEditUserDraft({
      name: user.name,
      email: user.email,
      password: "", // Leave blank to not change password
      role: user.role,
      facultyId: user.facultyId || "",
      studentId: user.studentId || "",
      scholarUrl,
      scholarUser,
      focus,
      accent,
      topic,
      teamId
    });
  };

  const handleSaveEditedUser = () => {
    if (!editingUser) return;
    setMessage("");

    startTransition(async () => {
      const payload: any = {
        name: editUserDraft.name,
        email: editUserDraft.email,
        role: editUserDraft.role,
        facultyId: editUserDraft.facultyId || undefined,
        studentId: editUserDraft.studentId || undefined
      };
      
      if (editUserDraft.password) {
        payload.password = editUserDraft.password;
      }

      if (editUserDraft.role === "faculty" || editUserDraft.role === "super_admin") {
        payload.scholarUrl = editUserDraft.scholarUrl;
        payload.scholarUser = editUserDraft.scholarUser;
        payload.focus = editUserDraft.focus;
        payload.accent = editUserDraft.accent;
      } else if (editUserDraft.role === "student") {
        payload.topic = editUserDraft.topic;
        payload.teamId = editUserDraft.teamId || "";
      }

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Could not update user");
        return;
      }

      // Update local users
      setUsers((current) =>
        current.map((u) => (u.id === editingUser.id ? data.user : u))
      );

      // Update local student if applicable
      if (data.user.role === "student" && data.user.studentId) {
        setStudents((current) =>
          current.map((s) =>
            s.id === data.user.studentId
              ? {
                  ...s,
                  name: data.user.name,
                  email: data.user.email,
                  topic: editUserDraft.topic,
                  teamId: editUserDraft.teamId || undefined
                }
              : s
          )
        );
      }

      // Update local faculty if applicable
      if ((data.user.role === "faculty" || data.user.role === "super_admin") && data.user.facultyId) {
        setFacultiesState((current) =>
          current.map((f) =>
            f.id === data.user.facultyId
              ? {
                  ...f,
                  name: data.user.name,
                  email: data.user.email,
                  scholarUrl: editUserDraft.scholarUrl,
                  scholarUser: editUserDraft.scholarUser,
                  focus: editUserDraft.focus,
                  accent: editUserDraft.accent
                }
              : f
          )
        );
      }

      setEditingUser(null);
      setMessage("User account details updated successfully.");
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This will delete their profile data as well.")) return;
    setMessage("");
    startTransition(async () => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const payload = await response.json();
        setMessage(payload.error || "Could not delete user");
        return;
      }

      const deletedUser = users.find((u) => u.id === userId);
      setUsers((current) => current.filter((u) => u.id !== userId));

      if (deletedUser?.role === "student" && deletedUser.studentId) {
        setStudents((current) => current.filter((s) => s.id !== deletedUser.studentId));
      } else if ((deletedUser?.role === "faculty" || deletedUser?.role === "super_admin") && deletedUser.facultyId) {
        setFacultiesState((current) => current.filter((f) => f.id !== deletedUser.facultyId));
      }

      if (editingUser?.id === userId) {
        setEditingUser(null);
      }

      setMessage("User login account and profile deleted successfully.");
    });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setMessage(`Copied URL: ${text}`);
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-md border border-ocean-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-ocean-700">
              <ShieldCheck size={16} />
              Faculty Workspace
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">
              Welcome, {currentUser.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage student teams, co-mentors, direct access requests, and faculty registrations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* Copy join link section */}
      <section className="rounded-md border border-ocean-100 bg-ocean-50/50 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-ocean-800 uppercase tracking-wider">Faculty Student Join Request Link</p>
          <p className="text-slate-600 text-sm truncate mt-1">
            Share this link with students. They can request to join using their college email, which you must approve.
          </p>
          <code className="text-xs text-ocean-900 font-bold block mt-1.5 truncate select-all">{joinLinkBase}</code>
        </div>
        <button
          onClick={() => copyToClipboard(joinLinkBase)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-ocean-700 hover:bg-ocean-800 text-white font-bold text-xs h-10 px-4 transition"
        >
          <Copy size={14} />
          Copy Join Link
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Current View" value={selectedMember.name} icon={ShieldCheck} />
        <Metric label="My Teams" value={visibleTeams.length} icon={Users} />
        <Metric label="Active Students" value={activeStudents.length} icon={Users} />
        <Metric label="Pending Requests" value={pendingRequests.length} icon={UserCheck} />
      </section>

      {/* Pending requests queue */}
      {pendingRequests.length > 0 && (
        <section className="rounded-md border border-amber-200 bg-amber-50/30 p-5 shadow-sm">
          <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
            <UserCheck className="text-amber-700" size={20} />
            Pending Student Access Requests ({pendingRequests.length})
          </h2>
          <p className="text-sm text-slate-600 mt-1 mb-4">
            Review these join requests. Approving will create their student profile and activate their credentials.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((studentReq) => {
              const proposedTeam = teams.find((t) => t.id === studentReq.teamId);
              return (
                <div key={studentReq.id} className="rounded-md border border-amber-100 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-950 text-base truncate">{studentReq.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">{studentReq.email}</p>
                    <div className="mt-3 text-xs">
                      <span className="text-slate-400 font-bold uppercase block tracking-wider">Research Topic</span>
                      <p className="text-slate-700 italic mt-0.5 line-clamp-1">{studentReq.topic}</p>
                    </div>
                    {proposedTeam && (
                      <div className="mt-2 text-xs">
                        <span className="text-slate-400 font-bold uppercase block tracking-wider">Requested Team</span>
                        <p className="text-ocean-800 font-bold mt-0.5 truncate">{proposedTeam.name}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleApproveRequest(studentReq.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-ocean-700 hover:bg-ocean-800 text-white font-bold text-xs h-9"
                    >
                      <UserCheck size={13} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(studentReq.id)}
                      className="inline-flex items-center justify-center rounded border border-red-200 bg-white hover:bg-red-50 text-red-700 font-bold text-xs h-9 px-3"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Creation and Invites Panels */}
      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Create Team" icon={Plus}>
          <div className="grid gap-3">
            <TextInput
              label="Team name"
              value={teamDraft.name}
              onChange={(value) => setTeamDraft((draft) => ({ ...draft, name: value }))}
              placeholder="Adaptive Search Team"
            />
            <TextInput
              label="Project"
              value={teamDraft.project}
              onChange={(value) => setTeamDraft((draft) => ({ ...draft, project: value }))}
              placeholder="Learning-assisted evolutionary optimization"
            />
            <TextInput
              label="Description"
              value={teamDraft.description}
              onChange={(value) => setTeamDraft((draft) => ({ ...draft, description: value }))}
              placeholder="Short project summary"
            />
            
            {/* Co-mentors selection */}
            <div className="grid gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Co-Mentors (Optional)</span>
              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto border border-slate-200 rounded-md p-2 bg-slate-50/50">
                {facultiesState
                  .filter((member) => member.id !== selectedFaculty)
                  .map((member) => (
                    <label key={member.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={coMentorIds.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCoMentorIds((current) => [...current, member.id]);
                          } else {
                            setCoMentorIds((current) => current.filter((id) => id !== member.id));
                          }
                        }}
                        className="rounded border-slate-300 text-ocean-700 focus:ring-ocean-500"
                      />
                      {member.name}
                    </label>
                  ))}
              </div>
            </div>

            <button
              disabled={isPending || !teamDraft.name || !teamDraft.project}
              onClick={saveTeam}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ocean-700 px-4 text-sm font-bold text-white transition hover:bg-ocean-800 disabled:opacity-55 mt-2"
            >
              <Save size={16} />
              Save team
            </button>
          </div>
        </Panel>

        <Panel title="Create Invite Link" icon={MailPlus}>
          <div className="grid gap-3">
            <TextInput
              label="Student email"
              value={studentEmail}
              onChange={setStudentEmail}
              placeholder="student@amrita.edu"
              type="email"
            />
            <label className="grid gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Team</span>
              <select
                value={inviteTeamId}
                onChange={(event) => setInviteTeamId(event.target.value)}
                className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100 bg-white"
              >
                <option value="">Assign later</option>
                {visibleTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Valid for</span>
              <select
                value={hoursValid}
                onChange={(event) => setHoursValid(Number(event.target.value))}
                className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100 bg-white"
              >
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>72 hours</option>
                <option value={168}>7 days</option>
              </select>
            </label>
            <button
              disabled={isPending || !studentEmail}
              onClick={createStudentInvite}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ocean-700 px-4 text-sm font-bold text-white transition hover:bg-ocean-800 disabled:opacity-55 mt-2"
            >
              <MailPlus size={16} />
              Generate Invite Link
            </button>
          </div>
        </Panel>
      </section>

      {generatedInviteUrl && (
        <div className="rounded-md border border-ocean-200 bg-ocean-50/50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-ocean-700">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ocean-800 uppercase tracking-wider">Generated Invite Link</p>
            <code className="text-xs text-ocean-900 font-bold block mt-1.5 truncate select-all">{generatedInviteUrl}</code>
          </div>
          <button
            onClick={() => copyToClipboard(generatedInviteUrl)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-ocean-700 hover:bg-ocean-800 text-white font-bold text-xs h-10 px-4 transition shadow-soft"
          >
            <Copy size={14} />
            Copy Invite Link
          </button>
        </div>
      )}

      {message && (
        <p className="rounded-md border border-ocean-100 bg-ocean-50 px-4 py-3 text-sm font-bold text-ocean-900 border-l-4 border-l-ocean-700">
          {message}
        </p>
      )}

      {/* Teams and Publications sections */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Teams And Projects" icon={Users}>
          <div className="grid gap-4">
            {visibleTeams.map((team) => {
              const teamStudents = activeStudents.filter((student) => student.teamId === team.id);
              const teamMentors = [
                facultiesState.find((f) => f.id === team.facultyId)?.name,
                ...(team.coMentorIds || []).map((id) => facultiesState.find((f) => f.id === id)?.name)
              ].filter(Boolean).join(", ");

              const unassignedStudentsForFaculty = students.filter(
                (s) => s.status === "active" && s.facultyId === selectedFaculty && !s.teamId
              );

              if (editingTeamId === team.id) {
                return (
                  <div key={team.id} className="rounded-md border-2 border-ocean-200 p-4 bg-white shadow-soft grid gap-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="font-black text-slate-950 text-sm uppercase tracking-wider">Edit Team Details</h3>
                      <button onClick={() => setEditingTeamId(null)} className="text-slate-400 hover:text-slate-700">
                        <X size={18} />
                      </button>
                    </div>
                    <TextInput
                      label="Team Name"
                      value={editTeamName}
                      onChange={setEditTeamName}
                    />
                    <TextInput
                      label="Project"
                      value={editTeamProject}
                      onChange={setEditTeamProject}
                    />
                    <TextInput
                      label="Description"
                      value={editTeamDescription}
                      onChange={setEditTeamDescription}
                    />
                    
                    {/* Co-mentors selector for edit */}
                    <div className="grid gap-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Co-Mentors (Optional)</span>
                      <div className="flex flex-col gap-2 max-h-36 overflow-y-auto border border-slate-200 rounded-md p-2 bg-slate-50/50">
                        {facultiesState
                          .filter((member) => member.id !== selectedFaculty)
                          .map((member) => (
                            <label key={member.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editTeamCoMentorIds.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditTeamCoMentorIds((current) => [...current, member.id]);
                                  } else {
                                    setEditTeamCoMentorIds((current) => current.filter((id) => id !== member.id));
                                  }
                                }}
                                className="rounded border-slate-300 text-ocean-700 focus:ring-ocean-500"
                              />
                              {member.name}
                            </label>
                          ))}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-2">
                      <button
                        onClick={() => setEditingTeamId(null)}
                        className="inline-flex h-9 items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 text-xs font-bold transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateTeam}
                        disabled={isPending || !editTeamName || !editTeamProject}
                        className="inline-flex h-9 items-center justify-center rounded bg-ocean-700 hover:bg-ocean-800 text-white px-4 text-xs font-bold transition disabled:opacity-50"
                      >
                        Save Team Details
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={team.id} className="rounded-md border border-slate-200 p-4 bg-white/70 shadow-soft">
                  <div className="flex flex-col justify-between gap-3 md:flex-row pb-3 border-b border-slate-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-slate-950 text-base truncate">{team.name}</h3>
                        <button
                          onClick={() => startEditingTeam(team)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-ocean-700 hover:text-ocean-950 px-2 py-0.5 rounded border border-ocean-100 bg-ocean-50 hover:bg-ocean-100 transition"
                        >
                          Edit Details
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">Mentors: {teamMentors}</p>
                      <p className="mt-2 text-sm font-bold text-ocean-850">Project: {team.project}</p>
                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{team.description}</p>
                    </div>
                    <span className="h-fit shrink-0 rounded-md bg-ocean-50 px-3 py-1.5 text-xs font-black text-ocean-850">
                      {teamStudents.length} students
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {teamStudents.length === 0 ? (
                      <p className="text-xs font-semibold text-slate-500 italic py-1">No students assigned to this team.</p>
                    ) : (
                      teamStudents.map((student) => (
                        <StudentRow
                          key={student.id}
                          student={student}
                          teams={visibleTeams}
                          onUpdate={updateStudentDetails}
                          onResetPassword={resetPassword}
                          onDelete={(id) => handleRejectRequest(id)}
                          onRemoveFromTeam={(student) => {
                            if (window.confirm(`Remove ${student.name} from this team?`)) {
                              updateStudentDetails(student, { teamId: "" });
                            }
                          }}
                        />
                      ))
                    )}
                  </div>

                  {/* Quick add student dropdown */}
                  {unassignedStudentsForFaculty.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50 p-2 rounded-md">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Add Student:</span>
                      <select
                        value=""
                        onChange={(e) => {
                          const studentId = e.target.value;
                          if (studentId) {
                            const studentObj = students.find((s) => s.id === studentId);
                            if (studentObj) {
                              updateStudentDetails(studentObj, { teamId: team.id });
                            }
                          }
                        }}
                        className="text-xs h-8 rounded border border-slate-200 bg-white px-2 focus:border-ocean-400 outline-none"
                      >
                        <option value="">Select student...</option>
                        {unassignedStudentsForFaculty.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Students without team */}
            {students.filter((s) => s.status === "active" && s.facultyId === selectedFaculty && !s.teamId).length > 0 && (
              <div className="rounded-md border border-dashed border-slate-350 p-4 bg-slate-50/40">
                <h3 className="font-black text-slate-700 text-sm uppercase tracking-wider mb-3">Students Without Assigned Team</h3>
                <div className="grid gap-2">
                  {students
                    .filter((s) => s.status === "active" && s.facultyId === selectedFaculty && !s.teamId)
                    .map((student) => (
                      <StudentRow
                        key={student.id}
                        student={student}
                        teams={visibleTeams}
                        onUpdate={updateStudentDetails}
                        onResetPassword={resetPassword}
                        onDelete={(id) => handleRejectRequest(id)}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </Panel>

        <Panel title={`${selectedMember.name} Publications`} icon={BookOpen}>
          <div className="grid gap-3">
            {latestPublications.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500 italic py-4">No publications synced yet.</p>
            ) : (
              latestPublications.map((publication) => (
                <a
                  key={publication.id}
                  href={publication.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-slate-200 p-3 bg-white hover:border-ocean-200 hover:bg-ocean-50 transition shadow-soft"
                >
                  <p className="line-clamp-2 text-sm font-bold text-slate-950 leading-relaxed">{publication.title}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {publication.year} · {publication.citations} citations
                  </p>
                </a>
              ))
            )}
          </div>
        </Panel>
      </section>

      {/* Joining links & Super Admin section */}
      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Recent Joining Links" icon={Copy}>
          <div className="grid gap-3">
            {visibleInvites.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">No invite links yet.</p>
            ) : (
              visibleInvites.slice(0, 8).map((invite) => {
                const team = teams.find((item) => item.id === invite.teamId);
                const expired = new Date(invite.expiresAt).getTime() < Date.now();
                return (
                  <div key={invite.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3 bg-white shadow-soft">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{invite.email}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {team?.name || "Team not assigned"} · {invite.usedAt ? "Used" : expired ? "Expired" : "Active"}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${inviteBase}/${invite.id}`)}
                      className="grid size-9 shrink-0 place-items-center rounded-md border border-ocean-200 text-ocean-700 transition hover:bg-ocean-50"
                      title="Copy invite link"
                      aria-label="Copy invite link"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </Panel>

        {isSuperAdmin && (
          <Panel title="Dynamic User and Designation Management" icon={KeyRound}>
            <div className="grid gap-6">
              
              {/* Edit User Form */}
              {editingUser ? (
                <div className="rounded-md border-2 border-ocean-200 bg-ocean-50/10 p-4 grid gap-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="font-black text-slate-950 text-sm uppercase tracking-wider">
                      Edit User Login: {editingUser.name}
                    </h3>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <TextInput
                      label="Full name"
                      value={editUserDraft.name}
                      onChange={(val) => setEditUserDraft((d) => ({ ...d, name: val }))}
                    />
                    <TextInput
                      label="Email ID"
                      value={editUserDraft.email}
                      onChange={(val) => setEditUserDraft((d) => ({ ...d, email: val }))}
                    />
                    <TextInput
                      label="Reset Password (leave blank to keep current)"
                      value={editUserDraft.password}
                      onChange={(val) => setEditUserDraft((d) => ({ ...d, password: val }))}
                      type="password"
                    />
                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-slate-700">Designation (Role)</span>
                      <select
                        value={editUserDraft.role}
                        onChange={(event) =>
                          setEditUserDraft((d) => ({ ...d, role: event.target.value as User["role"] }))
                        }
                        className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none bg-white focus:border-ocean-400"
                      >
                        <option value="faculty">Faculty</option>
                        <option value="student">Student</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </label>
                  </div>

                  {/* Dynamic fields based on role */}
                  {(editUserDraft.role === "faculty" || editUserDraft.role === "super_admin") && (
                    <div className="p-3 bg-slate-50 border rounded-md grid gap-3 mt-1.5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty Profile Info</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <TextInput
                          label="Google Scholar User ID"
                          value={editUserDraft.scholarUser}
                          onChange={(val) => setEditUserDraft((d) => ({ ...d, scholarUser: val }))}
                          placeholder="GgLc5qwAAAAJ"
                        />
                        <TextInput
                          label="Google Scholar Profile URL"
                          value={editUserDraft.scholarUrl}
                          onChange={(val) => setEditUserDraft((d) => ({ ...d, scholarUrl: val }))}
                          placeholder="https://scholar.google.com..."
                        />
                        <TextInput
                          label="Research Focus Area"
                          value={editUserDraft.focus}
                          onChange={(val) => setEditUserDraft((d) => ({ ...d, focus: val }))}
                          placeholder="Swarm computation..."
                        />
                        <TextInput
                          label="Accent Color (HEX code)"
                          value={editUserDraft.accent}
                          onChange={(val) => setEditUserDraft((d) => ({ ...d, accent: val }))}
                          placeholder="#0ca2df"
                        />
                      </div>
                    </div>
                  )}

                  {editUserDraft.role === "student" && (
                    <div className="p-3 bg-slate-50 border rounded-md grid gap-3 mt-1.5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Profile Info</h4>
                      <TextInput
                        label="Research Topic"
                        value={editUserDraft.topic}
                        onChange={(val) => setEditUserDraft((d) => ({ ...d, topic: val }))}
                      />
                      <label className="grid gap-2">
                        <span className="text-sm font-bold text-slate-700">Team Assignment</span>
                        <select
                          value={editUserDraft.teamId}
                          onChange={(event) => setEditUserDraft((d) => ({ ...d, teamId: event.target.value }))}
                          className="h-11 rounded-md border border-slate-200 px-3 text-sm bg-white focus:border-ocean-400"
                        >
                          <option value="">No team assignment</option>
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3 justify-end">
                    <button
                      onClick={() => handleDeleteUser(editingUser.id)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-red-200 hover:bg-red-50 text-red-700 px-4 text-xs font-bold transition"
                    >
                      <Trash2 size={14} />
                      Delete User
                    </button>
                    <button
                      onClick={handleSaveEditedUser}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-ocean-700 hover:bg-ocean-800 text-white px-4 text-xs font-bold transition"
                    >
                      <Save size={14} />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Create User Form */
                <div className="grid gap-3 bg-slate-50/50 p-4 border rounded-md">
                  <h3 className="font-black text-slate-950 text-xs uppercase tracking-wider mb-1">
                    Create New Faculty Login & Profile
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextInput
                      label="Faculty Name"
                      value={createUserDraft.name}
                      onChange={(value) => setCreateUserDraft((draft) => ({ ...draft, name: value }))}
                      placeholder="e.g. Dr. Ramesh K"
                    />
                    <TextInput
                      label="Official Email"
                      type="email"
                      value={createUserDraft.email}
                      onChange={(value) => setCreateUserDraft((draft) => ({ ...draft, email: value }))}
                      placeholder="ramesh@amrita.edu"
                    />
                    <TextInput
                      label="Initial Password"
                      value={createUserDraft.password}
                      onChange={(value) => setCreateUserDraft((draft) => ({ ...draft, password: value }))}
                      placeholder="Amrita@123"
                    />
                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-slate-700">Designation (Role)</span>
                      <select
                        value={createUserDraft.role}
                        onChange={(event) =>
                          setCreateUserDraft((draft) => ({ ...draft, role: event.target.value as User["role"] }))
                        }
                        className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none bg-white focus:border-ocean-400"
                      >
                        <option value="faculty">Faculty</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </label>
                  </div>

                  {/* Profile properties */}
                  <div className="grid gap-3 sm:grid-cols-2 mt-2 pt-3 border-t border-slate-200">
                    <TextInput
                      label="Google Scholar User ID"
                      value={createUserDraft.scholarUser}
                      onChange={(value) => setCreateUserDraft((draft) => ({ ...draft, scholarUser: value }))}
                      placeholder="GgLc5qwAAAAJ"
                    />
                    <TextInput
                      label="Google Scholar Profile URL"
                      value={createUserDraft.scholarUrl}
                      onChange={(value) => setCreateUserDraft((draft) => ({ ...draft, scholarUrl: value }))}
                      placeholder="https://scholar.google.com/citations?user=..."
                    />
                    <TextInput
                      label="Focus Area"
                      value={createUserDraft.focus}
                      onChange={(value) => setCreateUserDraft((draft) => ({ ...draft, focus: value }))}
                      placeholder="Swarm computation..."
                    />
                    <TextInput
                      label="Accent Hex Code"
                      value={createUserDraft.accent}
                      onChange={(value) => setCreateUserDraft((draft) => ({ ...draft, accent: value }))}
                      placeholder="#0ca2df"
                    />
                  </div>

                  <button
                    disabled={isPending || !createUserDraft.name || !createUserDraft.email || !createUserDraft.password}
                    onClick={handleCreateUser}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ocean-700 px-4 text-sm font-bold text-white transition hover:bg-ocean-800 disabled:opacity-55 mt-2"
                  >
                    <Save size={16} />
                    Create Faculty Login
                  </button>
                </div>
              )}

              {/* Users list for designation management */}
              <div className="grid gap-2 border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Workspace Users</h4>
                
                {/* Search Bar & Role Filter */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between mt-1 mb-2">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-1 text-xs h-9 rounded border border-slate-200 px-3 outline-none focus:border-ocean-400 bg-white"
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    className="text-xs h-9 rounded border border-slate-200 px-2 outline-none focus:border-ocean-400 bg-white min-w-[120px]"
                  >
                    <option value="all">All Roles</option>
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs font-semibold text-slate-500 italic py-4 text-center">No users match your search/filter.</p>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-md border p-3 transition bg-white shadow-soft hover:border-ocean-100",
                          editingUser?.id === user.id && "border-ocean-300 bg-ocean-50/10"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                          <p className="truncate text-xs font-semibold text-slate-500 mt-0.5">
                            {user.email} · <span className="font-bold text-ocean-700">{user.role}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditUserClick(user)}
                          className="inline-flex items-center justify-center h-8 px-3 rounded border border-ocean-200 text-ocean-700 font-bold text-xs hover:bg-ocean-50 transition shrink-0"
                        >
                          Manage
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </Panel>
        )}
      </section>
    </div>
  );
}

function StudentRow({
  student,
  teams,
  onUpdate,
  onResetPassword,
  onDelete,
  onRemoveFromTeam
}: {
  student: Student;
  teams: Team[];
  onUpdate: (student: Student, updates: Partial<Student>) => void;
  onResetPassword: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onRemoveFromTeam?: (student: Student) => void;
}) {
  return (
    <div className="rounded-md bg-slate-50 p-3 shadow-soft border border-slate-100">
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center">
        <div className="grid gap-2">
          <input
            defaultValue={student.name}
            onBlur={(event) => {
              if (event.target.value.trim() && event.target.value !== student.name) {
                onUpdate(student, { name: event.target.value });
              }
            }}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-ocean-400"
            placeholder="Student name"
          />
          <input
            defaultValue={student.email}
            onBlur={(event) => {
              if (event.target.value.trim() && event.target.value !== student.email) {
                onUpdate(student, { email: event.target.value });
              }
            }}
            type="email"
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-ocean-400"
            placeholder="Email"
          />
        </div>
        <input
          defaultValue={student.topic}
          onBlur={(event) => {
            if (event.target.value !== student.topic) onUpdate(student, { topic: event.target.value });
          }}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-ocean-400"
          placeholder="Research topic"
        />
        <div className="flex items-center gap-2">
          <select
            value={student.teamId || ""}
            onChange={(event) => onUpdate(student, { teamId: event.target.value || undefined })}
            className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-2 text-sm outline-none focus:border-ocean-400"
          >
            <option value="">No team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onRemoveFromTeam && student.teamId && (
            <button
              onClick={() => onRemoveFromTeam(student)}
              className="grid h-10 w-10 place-items-center rounded-md border border-amber-200 bg-white text-amber-700 transition hover:bg-amber-50"
              title="Remove student from team"
              aria-label="Remove student from team"
            >
              <UserMinus size={15} />
            </button>
          )}
          <button
            onClick={() => onResetPassword(student)}
            className="grid h-10 w-10 place-items-center rounded-md border border-ocean-200 bg-white text-ocean-700 transition hover:bg-ocean-50"
            title="Reset student password"
            aria-label="Reset student password"
          >
            <KeyRound size={15} />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete student ${student.name}?`)) {
                onDelete(student.id);
              }
            }}
            className="grid h-10 w-10 place-items-center rounded-md border border-red-200 bg-white text-red-650 transition hover:bg-red-50"
            title="Delete student and login ID"
            aria-label="Delete student and login ID"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: ComponentType<{ size?: number }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-ocean-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-ocean-50 text-ocean-700">
          <Icon size={19} />
        </span>
        <h2 className="font-black text-slate-950 text-base">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ size?: number }>;
}) {
  return (
    <div className="rounded-md border border-ocean-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ocean-700">
        <Icon size={14} />
        {label}
      </div>
      <p className={cn("mt-2 truncate font-black text-slate-950", typeof value === "number" ? "text-2xl" : "text-sm")}>
        {value}
      </p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</span>
      <input
        value={value}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-ocean-400 focus:ring-4 focus:ring-ocean-100"
      />
    </label>
  );
}
