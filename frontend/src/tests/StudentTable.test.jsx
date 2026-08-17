import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StudentTable from "../components/StudentTable.jsx";

describe("StudentTable component", () => {
  // Test that a student's name and email are displayed
  it("renders student row with name and email", () => {
    const students = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        department_name: "Computer Science",
        courses: []
      }
    ];

    render(
      <StudentTable
        students={students}
        departments={[]}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });
});