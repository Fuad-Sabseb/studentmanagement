import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Header from "../components/Header.jsx";

describe("Header component", () => {
  // Test that the header displays the brand name
  it("renders brand and title", () => {
    render(<Header />);
    expect(screen.getByText("Student Management")).toBeInTheDocument();
  });

  // Test the Add Student button and Settings dropdown
  it("renders Add Student button and opens Settings dropdown for extra actions", () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const onSubmitGrade = vi.fn();

    render(
      <Header
        onAddStudent={onAdd}
        onUpdateStudent={onUpdate}
        onSubmitGrade={onSubmitGrade}
      />
    );

    expect(screen.getAllByText("Add Student").length).toBeGreaterThan(0);

    // Open the Settings dropdown
    const settingsBtn = screen.getByText("Settings");
    fireEvent.click(settingsBtn);

    expect(screen.getByText("Update Student Information")).toBeInTheDocument();
    expect(screen.getByText("Submit Single Grade")).toBeInTheDocument();
  });
});