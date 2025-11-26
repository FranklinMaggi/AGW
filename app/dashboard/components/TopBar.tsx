export default function Topbar({ user }: any) {
    return (
      <header className="h-16 bg-white shadow flex items-center justify-between px-6">
        <div className="text-lg font-semibold">Benvenuto</div>
  
        <div className="flex items-center gap-3">
          <span className="text-gray-700">{user.firstname || user.email}</span>
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        </div>
      </header>
    );
  }
  