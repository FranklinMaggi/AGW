export default function ProfileStrip({ user }: any) {
    return (
      <div className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm">
        <div className="h-14 w-14 rounded-full bg-gray-200" />
  
        <div>
          <div className="text-lg font-semibold">{user.firstname}</div>
          <div className="text-gray-500 text-sm">{user.email}</div>
        </div>
      </div>
    );
  }
  