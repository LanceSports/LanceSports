import { render, screen, fireEvent } from "@testing-library/react"
import {vi} from "vitest"
import { BrowserRouter } from "react-router-dom"
import { Navbar } from "../components/Navbar"
import '@testing-library/jest-dom';


// helper wrapper for router
function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe("Navbar", () => {
  test("renders brand logo", () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByRole("link", { name: /lancesports/i })).toBeInTheDocument()
  })

  test("renders navigation links (desktop)", () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByRole("link", { name: /premier league/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /psl/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /rugby/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /cricket/i })).toBeInTheDocument()
  })

  test("renders login link if user is not signed in", () => {
    renderWithRouter(<Navbar isSignedIn={false} />)
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument()
  })

  test("renders user profile and logout if user is signed in", () => {
    const mockLogout = vi.fn()
    renderWithRouter(
      <Navbar
        isSignedIn={true}
        onLogout={mockLogout}
        userData={{ name: "Alice", avatar_url: "" }}
      />
    )

    expect(screen.getByText(/alice/i)).toBeInTheDocument()
    const logoutButton = screen.getByRole("button", { name: /logout/i })
    expect(logoutButton).toBeInTheDocument()

    fireEvent.click(logoutButton)
    expect(mockLogout).toHaveBeenCalled()
  })

test("toggles mobile menu when button clicked", () => {
  renderWithRouter(<Navbar />)

  const menuButton = screen.getByRole("button")
  fireEvent.click(menuButton)

  const links = screen.getAllByRole("link", { name: /premier league/i })
  expect(links[links.length - 1]).toBeVisible() // assume last is in mobile menu

  fireEvent.click(menuButton)
  expect(links[links.length - 1]).not.toBeVisible()
})
})
