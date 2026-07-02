export type Faculty = {
  id: string;
  name: string;
  role: string;
  email: string;
  scholarUrl: string;
  scholarUser: string;
  focus: string;
  accent: string;
};

export type Publication = {
  id: string;
  facultyId: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  citations: number;
  url: string;
  updatedAt: string;
};

export type Student = {
  id: string;
  facultyId: string;
  teamId?: string;
  name: string;
  email: string;
  status: "active" | "invited" | "pending";
  topic: string;
  password?: string;
  joinedAt?: string;
};

export type Invite = {
  id: string;
  facultyId: string;
  teamId?: string;
  email: string;
  expiresAt: string;
  createdAt: string;
  usedAt?: string;
};

export type UserRole = "super_admin" | "faculty" | "student";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  facultyId?: string;
  studentId?: string;
  status: "active" | "invited";
  createdAt: string;
};

export type Team = {
  id: string;
  facultyId: string;
  coMentorIds?: string[];
  name: string;
  project: string;
  description: string;
  createdAt: string;
};
