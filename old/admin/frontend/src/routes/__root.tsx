import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router"
import { Toaster } from "sonner"

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Outlet />
      <Toaster richColors closeButton />
    </>
  ),
  notFoundComponent: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">页面不存在</p>
      </div>
    </div>
  ),
})
