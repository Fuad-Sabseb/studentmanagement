import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../components/Footer.jsx";

describe("Footer", () => {
  test("renders brand, nav links, and copyright", () => {
    render(<Footer apiStatus="online" activeCount={5} />);

    expect(screen.getByText("Student Management")).toBeInTheDocument();
    expect(screen.getByText(/current status: online/i)).toBeInTheDocument();
    expect(screen.getByText(/5 active students tracked/i)).toBeInTheDocument();
    expect(screen.getByText(/© \d{4} Student Management/)).toBeInTheDocument();
  });

  test("reflects an offline API status", () => {
    render(<Footer apiStatus="offline" activeCount={0} />);
    expect(screen.getByText(/currently: api unreachable/i)).toBeInTheDocument();
  });
});
