import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import { LoginPage } from "./features/auth/LoginPage";
import { ReviewPage } from "./features/review/ReviewPage";
import "./index.css";

const qc = new QueryClient();

// 极简壳：真实项目用 TanStack Router 的 createRouter + 文件路由（见 README）。
function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
  return authed
    ? <ReviewPage roles={["评审专家"]} />
    : <LoginPage onLoggedIn={() => setAuthed(true)} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <App />
      <Toaster richColors />
    </QueryClientProvider>
  </StrictMode>,
);
