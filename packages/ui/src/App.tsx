import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Components from "./pages/Components";
import ComponentDetail from "./pages/ComponentDetail";
import Import from "./pages/Import";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="components" element={<Components />} />
        <Route path="components/:id" element={<ComponentDetail />} />
        <Route path="import" element={<Import />} />
      </Route>
    </Routes>
  );
}
