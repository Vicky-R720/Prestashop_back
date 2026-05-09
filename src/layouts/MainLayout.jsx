import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

function MainLayout() {

  return (
    <div className="app">

      <Sidebar />

      <div className="main">

        <header className="topbar">
          <h1>NewApp</h1>
        </header>

        <main className="content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;