import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StudentModal from "../components/StudentModal.jsx";

describe("StudentModal component", () => {
  // Test that the modal appears when open is true
  it("renders modal when open", () => {
    render(
      <StudentModal
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        departments={[{ id: 1, name: "Computer Science" }]}
      />
    );

    expect(screen.getByText("Add New Student")).toBeInTheDocument();
  });
});