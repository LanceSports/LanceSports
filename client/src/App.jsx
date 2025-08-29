import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TestWidgetPage from "./screens/TestWidgetPage";

function App() {
  return (
    <Router>
      <nav>
        <Link to="/test-widget">Test Widget Page</Link>
      </nav>
      <Routes>
        <Route path="/test-widget" element={<TestWidgetPage />} />
      </Routes>
    </Router>
  );
}

export default App;
