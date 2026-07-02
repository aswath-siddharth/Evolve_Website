import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { Faculty, UserRole, Invite, Publication, Student, Team, User } from "./types";
import { seedPublications, seedStudents } from "./mock-publications";
import { faculty } from "./faculty";

const dataDir = path.join(process.cwd(), "data");
const publicationsPath = path.join(dataDir, "publications.json");
const studentsPath = path.join(dataDir, "students.json");
const invitesPath = path.join(dataDir, "invites.json");
const usersPath = path.join(dataDir, "users.json");
const teamsPath = path.join(dataDir, "teams.json");
const facultiesPath = path.join(dataDir, "faculties.json");

const now = new Date().toISOString();

export const seedUsers: User[] = [
  {
    id: "user-ritwik-m",
    name: "Ritwik M",
    email: "m_ritwik@cb.amrita.edu",
    password: "Amrita@123",
    role: "super_admin",
    facultyId: "ritwik-m",
    status: "active",
    createdAt: now
  },
  ...faculty
    .filter((member) => member.id !== "ritwik-m")
    .map((member) => ({
      id: `user-${member.id}`,
      name: member.name,
      email: member.email,
      password: "ChangeMe@123",
      role: "faculty" as const,
      facultyId: member.id,
      status: "active" as const,
      createdAt: now
    }))
];

export const seedTeams: Team[] = [
  {
    id: "team-evolutionary-scheduling",
    facultyId: "shunmuga-velayutham",
    name: "Evolutionary Scheduling Lab",
    project: "Genetic algorithms for academic timetable optimization",
    description: "Models constrained scheduling problems with adaptive evolutionary operators.",
    createdAt: now
  },
  {
    id: "team-learning-optimization",
    facultyId: "bagavathi-c",
    name: "Learning Optimization Group",
    project: "Hybrid learning models for optimization-guided prediction",
    description: "Combines data-driven modelling with search-based parameter tuning.",
    createdAt: now
  },
  {
    id: "team-adaptive-decision",
    facultyId: "anisha-radhakrishnan",
    name: "Adaptive Decision Systems",
    project: "Explainable adaptive systems for decision support",
    description: "Builds interpretable adaptive learning workflows for applied domains.",
    createdAt: now
  },
  {
    id: "team-ritwik-adaptive-ai",
    facultyId: "ritwik-m",
    name: "Adaptive AI Systems",
    project: "Learning-assisted optimization for dynamic environments",
    description: "Explores adaptive search and robust modelling for changing systems.",
    createdAt: now
  }
];

async function ensureDataFile<T>(filePath: string, fallback: T): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
  }
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  await ensureDataFile(filePath, fallback);
  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file) as T;
}

async function writeJson<T>(filePath: string, value: T): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

export async function getPublications(): Promise<Publication[]> {
  return readJson<Publication[]>(publicationsPath, seedPublications);
}

export async function savePublications(publications: Publication[]) {
  await writeJson(publicationsPath, publications);
}

export async function getStudents(): Promise<Student[]> {
  return readJson<Student[]>(studentsPath, seedStudents);
}

export async function saveStudents(students: Student[]) {
  await writeJson(studentsPath, students);
}

export async function getInvites(): Promise<Invite[]> {
  return readJson<Invite[]>(invitesPath, []);
}

export async function getUsers(): Promise<User[]> {
  return readJson<User[]>(usersPath, seedUsers);
}

export async function saveUsers(users: User[]) {
  await writeJson(usersPath, users);
}

export async function getTeams(): Promise<Team[]> {
  return readJson<Team[]>(teamsPath, seedTeams);
}

export async function saveTeams(teams: Team[]) {
  await writeJson(teamsPath, teams);
}

export async function findUserByCredentials(email: string, password: string) {
  const users = await getUsers();
  return (
    users.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password &&
        user.status === "active"
    ) || null
  );
}

export async function getUserById(userId?: string) {
  if (!userId) return null;
  const users = await getUsers();
  return users.find((user) => user.id === userId && user.status === "active") || null;
}

export async function upsertUser(input: {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: User["role"];
  facultyId?: string;
  studentId?: string;
}) {
  const users = await getUsers();
  const existingIndex = input.id
    ? users.findIndex((user) => user.id === input.id)
    : users.findIndex((user) => user.email.toLowerCase() === input.email.toLowerCase());

  const user: User = {
    id: input.id || users[existingIndex]?.id || nanoid(10),
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    facultyId: input.facultyId,
    studentId: input.studentId,
    status: "active",
    createdAt: users[existingIndex]?.createdAt || new Date().toISOString()
  };

  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.unshift(user);
  }
  await saveUsers(users);
  return user;
}

export async function createTeam(input: {
  facultyId: string;
  coMentorIds?: string[];
  name: string;
  project: string;
  description: string;
}) {
  const teams = await getTeams();
  const team: Team = {
    id: nanoid(10),
    facultyId: input.facultyId,
    coMentorIds: input.coMentorIds || [],
    name: input.name,
    project: input.project,
    description: input.description,
    createdAt: new Date().toISOString()
  };
  teams.unshift(team);
  await saveTeams(teams);
  return team;
}

export async function updateTeam(
  teamId: string,
  updates: Partial<Pick<Team, "name" | "project" | "description" | "coMentorIds">>
) {
  const teams = await getTeams();
  const teamIndex = teams.findIndex((team) => team.id === teamId);
  if (teamIndex === -1) throw new Error("Team not found");
  teams[teamIndex] = { ...teams[teamIndex], ...updates };
  await saveTeams(teams);
  return teams[teamIndex];
}

export async function updateStudent(
  studentId: string,
  updates: Partial<Pick<Student, "name" | "email" | "topic" | "teamId" | "password">>
) {
  const students = await getStudents();
  const studentIndex = students.findIndex((student) => student.id === studentId);
  if (studentIndex === -1) throw new Error("Student not found");

  const updatedStudent = { ...students[studentIndex], ...updates };
  if (updatedStudent.teamId === "" || updatedStudent.teamId === null) {
    delete updatedStudent.teamId;
  }
  students[studentIndex] = updatedStudent;
  await saveStudents(students);

  if (updates.password || updates.email || updates.name) {
    const users = await getUsers();
    const userIndex = users.findIndex((user) => user.studentId === studentId);
    if (userIndex >= 0) {
      users[userIndex] = {
        ...users[userIndex],
        name: updates.name || users[userIndex].name,
        email: updates.email || users[userIndex].email,
        password: updates.password || users[userIndex].password
      };
      await saveUsers(users);
    }
  }

  return students[studentIndex];
}

export async function createInvite(
  facultyId: string,
  email: string,
  hoursValid: number,
  teamId?: string
) {
  const invites = await getInvites();
  const invite: Invite = {
    id: nanoid(12),
    facultyId,
    teamId,
    email,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + hoursValid * 60 * 60 * 1000).toISOString()
  };
  invites.unshift(invite);
  await writeJson(invitesPath, invites);
  return invite;
}

export async function acceptInvite(inviteId: string, name: string, email: string, password: string) {
  const invites = await getInvites();
  const inviteIndex = invites.findIndex((invite) => invite.id === inviteId);
  if (inviteIndex === -1) {
    throw new Error("Invite not found");
  }
  const invite = invites[inviteIndex];
  if (invite.usedAt) {
    throw new Error("Invite has already been used");
  }
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    throw new Error("Invite has expired");
  }
  if (invite.email.toLowerCase() !== email.toLowerCase()) {
    throw new Error("Email does not match the invited address");
  }

  const students = await getStudents();
  if (students.some((s) => s.email.toLowerCase() === invite.email.toLowerCase())) {
    throw new Error("Student email already registered");
  }

  const student: Student = {
    id: nanoid(10),
    facultyId: invite.facultyId,
    teamId: invite.teamId || undefined,
    name,
    email: invite.email,
    topic: "General Research",
    status: "pending",
    password
  };

  invites[inviteIndex] = { ...invite, usedAt: new Date().toISOString() };
  students.unshift(student);

  await Promise.all([
    writeJson(invitesPath, invites),
    writeJson(studentsPath, students)
  ]);
  return student;
}

export async function getDynamicFaculty(): Promise<Faculty[]> {
  return readJson<Faculty[]>(facultiesPath, faculty);
}

export async function saveDynamicFaculty(faculties: Faculty[]) {
  await writeJson(facultiesPath, faculties);
}

export async function createStudentDirectly(input: {
  facultyId: string;
  name: string;
  email: string;
  topic: string;
  teamId?: string;
  password: string;
}) {
  const students = await getStudents();
  if (students.some((s) => s.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("Student email already registered");
  }

  const student: Student = {
    id: nanoid(10),
    facultyId: input.facultyId,
    teamId: input.teamId || undefined,
    name: input.name,
    email: input.email,
    status: "active",
    topic: input.topic,
    password: input.password,
    joinedAt: new Date().toISOString()
  };

  students.unshift(student);

  const users = await getUsers();
  users.unshift({
    id: `user-${student.id}`,
    name: input.name,
    email: input.email,
    password: input.password,
    role: "student",
    facultyId: input.facultyId,
    studentId: student.id,
    status: "active",
    createdAt: new Date().toISOString()
  });

  await Promise.all([
    saveStudents(students),
    saveUsers(users)
  ]);

  return student;
}

export async function createJoinRequest(input: {
  facultyId: string;
  name: string;
  email: string;
  topic: string;
  teamId?: string;
  password?: string;
}) {
  const students = await getStudents();
  if (students.some((s) => s.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("Email already registered");
  }

  const student: Student = {
    id: nanoid(10),
    facultyId: input.facultyId,
    teamId: input.teamId || undefined,
    name: input.name,
    email: input.email,
    status: "pending",
    topic: input.topic,
    password: input.password
  };

  students.unshift(student);
  await saveStudents(students);
  return student;
}

export async function approveStudentRequest(studentId: string) {
  const students = await getStudents();
  const index = students.findIndex((s) => s.id === studentId);
  if (index === -1) throw new Error("Student not found");

  students[index].status = "active";
  students[index].joinedAt = new Date().toISOString();

  const users = await getUsers();
  const existingUserIndex = users.findIndex((u) => u.studentId === studentId);

  const user: User = {
    id: `user-${studentId}`,
    name: students[index].name,
    email: students[index].email,
    password: students[index].password || "ChangeMe@123",
    role: "student",
    facultyId: students[index].facultyId,
    studentId: studentId,
    status: "active",
    createdAt: new Date().toISOString()
  };

  if (existingUserIndex >= 0) {
    users[existingUserIndex] = user;
  } else {
    users.unshift(user);
  }

  await Promise.all([
    saveStudents(students),
    saveUsers(users)
  ]);

  return students[index];
}

export async function deleteStudent(studentId: string) {
  const students = await getStudents();
  const filteredStudents = students.filter((s) => s.id !== studentId);

  const users = await getUsers();
  const filteredUsers = users.filter((u) => u.studentId !== studentId);

  await Promise.all([
    saveStudents(filteredStudents),
    saveUsers(filteredUsers)
  ]);
}

export async function updateUserAndEntity(
  userId: string,
  updates: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    facultyId?: string;
    studentId?: string;
    status?: "active" | "invited";
    scholarUrl?: string;
    scholarUser?: string;
    focus?: string;
    accent?: string;
    topic?: string;
    teamId?: string;
  }
) {
  const users = await getUsers();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) throw new Error("User not found");

  const originalUser = users[userIndex];

  users[userIndex] = {
    ...originalUser,
    name: updates.name ?? originalUser.name,
    email: updates.email ?? originalUser.email,
    password: updates.password ?? originalUser.password,
    role: updates.role ?? originalUser.role,
    facultyId: updates.facultyId ?? originalUser.facultyId,
    studentId: updates.studentId ?? originalUser.studentId,
    status: updates.status ?? originalUser.status
  };
  await saveUsers(users);

  const updatedUser = users[userIndex];

  if (updatedUser.role === "student" && updatedUser.studentId) {
    const students = await getStudents();
    const studentIndex = students.findIndex((s) => s.id === updatedUser.studentId);
    if (studentIndex >= 0) {
      students[studentIndex] = {
        ...students[studentIndex],
        name: updatedUser.name,
        email: updatedUser.email,
        password: updatedUser.password,
        topic: updates.topic ?? students[studentIndex].topic,
        teamId: updates.teamId ?? students[studentIndex].teamId
      };
      await saveStudents(students);
    }
  }

  if ((updatedUser.role === "faculty" || updatedUser.role === "super_admin") && updatedUser.facultyId) {
    const faculties = await getDynamicFaculty();
    const facultyIndex = faculties.findIndex((f) => f.id === updatedUser.facultyId);
    if (facultyIndex >= 0) {
      faculties[facultyIndex] = {
        ...faculties[facultyIndex],
        name: updatedUser.name,
        email: updatedUser.email,
        scholarUrl: updates.scholarUrl ?? faculties[facultyIndex].scholarUrl,
        scholarUser: updates.scholarUser ?? faculties[facultyIndex].scholarUser,
        focus: updates.focus ?? faculties[facultyIndex].focus,
        accent: updates.accent ?? faculties[facultyIndex].accent
      };
      await saveDynamicFaculty(faculties);
    } else {
      faculties.push({
        id: updatedUser.facultyId,
        name: updatedUser.name,
        email: updatedUser.email,
        role: "Faculty",
        scholarUrl: updates.scholarUrl ?? "",
        scholarUser: updates.scholarUser ?? "",
        focus: updates.focus ?? "Evolutionary computation",
        accent: updates.accent ?? "#0ca2df"
      });
      await saveDynamicFaculty(faculties);
    }
  }

  return updatedUser;
}
