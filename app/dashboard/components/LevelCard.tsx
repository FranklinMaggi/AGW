export default function LevelCard({ user }: any) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Il tuo livello</h2>
        <div className="text-5xl font-extrabold text-gray-900">
          {user.stats.level_total}
        </div>
        <p className="text-gray-600">
          Continua a migliorare per salire di livello.
        </p>
      </div>
    );
  }
  