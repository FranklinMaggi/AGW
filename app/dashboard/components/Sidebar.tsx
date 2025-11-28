import LogoutButton from "./LogoutButton";
export default function Sidebar() {
    return (
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold">AGW</h2>
  
        <a href="/dashboard" className="text-gray-700 hover:text-black">
          Dashboard
        </a>
        <a href="/dashboard/profile" className="text-gray-700 hover:text-black">
          Profilo
        </a>
        <a href="/dashboard/missions" className="text-gray-700 hover:text-black">
          Missioni
        </a>
        <a href="/dashboard/stats" className="text-gray-700 hover:text-black">
          Statistiche
        </a>
        <a href="/dashboard/settings" className="text-gray-700 hover:text-black">
          Impostazioni
        </a>
        <li className="mt-4">
        <form action={"/api/user/logout"} method="POST">

        <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 rounded">
        Logout
        </button>
        </form>
        </li>
      </aside>
    );
  }
  