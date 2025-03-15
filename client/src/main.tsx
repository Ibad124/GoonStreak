import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App";
import "./index.css";

console.log("Starting application initialization...");

const container = document.getElementById("root");

if (!container) {
  console.error("Critical error: Failed to find root element");
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Failed to initialize application: Root element not found</div>';
  throw new Error("Failed to find root element");
}

const root = createRoot(container);

try {
  console.log("Mounting React application...");
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log("React application mounted successfully");
} catch (error) {
  console.error("Failed to mount React application:", error);
  container.innerHTML = `
    <div style="color: red; padding: 20px;">
      Failed to initialize application. Please check console for details.
      <pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>
    </div>
  `;
  throw error;
}