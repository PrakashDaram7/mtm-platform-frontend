/**
 * Home.jsx
 * 
 * Public home page component.
 * Demonstrates a simple page with no service calls.
 * 
 * Students: This is a basic public page that anyone can access.
 */

export default function Home() {
  return (
    <div>
      <h1>Welcome to MTM Digital Platform</h1>
      <p>This is the home page</p>
      <nav>
        <a href="/login">Go to Login</a>
      </nav>
      {/* TODO: Add hero content, features, testimonials, etc. */}
    </div>
  );
}
