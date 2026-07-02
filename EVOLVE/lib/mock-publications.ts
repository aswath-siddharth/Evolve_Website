import type { Publication, Student } from "./types";

const now = new Date().toISOString();

export const seedPublications: Publication[] = [
  "shunmuga-velayutham",
  "bagavathi-c",
  "jeyakumar-g",
  "s-thangavelu",
  "ritwik-m",
  "anisha-radhakrishnan",
  "dhanya-m-dhananlakshmy"
].flatMap((facultyId, index) => [
  {
    id: `${facultyId}-pub-1`,
    facultyId,
    title: [
      "Adaptive evolutionary optimization for constrained engineering design",
      "Hybrid learning models for high-dimensional decision systems",
      "A comparative study of bio-inspired metaheuristics in intelligent search",
      "Multi-objective evolutionary algorithms for resource-aware scheduling",
      "Learning-assisted optimization for dynamic environments",
      "Explainable adaptive systems for data-driven decision support",
      "Evolutionary feature selection for robust predictive modelling"
    ][index],
    authors: "Faculty, Research Group, Collaborators",
    venue: "Indexed research publication",
    year: 2026,
    citations: 18 + index * 7,
    url: "#",
    updatedAt: now
  },
  {
    id: `${facultyId}-pub-2`,
    facultyId,
    title: [
      "Survey of learning strategies in evolutionary computation",
      "Optimization-guided representation learning for applied AI",
      "Adaptive search techniques for complex optimization landscapes",
      "Efficient swarm intelligence methods for real-world systems",
      "Benchmarking adaptive algorithms across noisy environments",
      "Learning-enhanced heuristics for intelligent automation",
      "Robust optimization models for adaptive analytics"
    ][index],
    authors: "Faculty, Student Researchers",
    venue: "Conference proceedings",
    year: 2025,
    citations: 9 + index * 5,
    url: "#",
    updatedAt: now
  }
]);

export const seedStudents: Student[] = [
  {
    id: "student-1",
    facultyId: "shunmuga-velayutham",
    teamId: "team-evolutionary-scheduling",
    name: "Aarav N",
    email: "aarav.n@amrita.edu",
    status: "active",
    topic: "Genetic algorithms for scheduling",
    password: "Student@123",
    joinedAt: now
  },
  {
    id: "student-2",
    facultyId: "bagavathi-c",
    teamId: "team-learning-optimization",
    name: "Meera S",
    email: "meera.s@amrita.edu",
    status: "active",
    topic: "Learning-based optimization",
    password: "Student@123",
    joinedAt: now
  },
  {
    id: "student-3",
    facultyId: "anisha-radhakrishnan",
    teamId: "team-adaptive-decision",
    name: "Dev P",
    email: "dev.p@amrita.edu",
    status: "invited",
    topic: "Adaptive decision systems",
    password: "Student@123"
  }
];
