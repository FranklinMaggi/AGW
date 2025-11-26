export default function StatsRow({ user }: any) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm text-center">
          <div className="text-gray-400 text-sm">KRM Totali</div>
          <div className="text-3xl font-semibold">
            {user.stats.krm_total}
          </div>
        </div>
  
        <div className="bg-white p-5 rounded-xl shadow-sm text-center">
          <div className="text-gray-400 text-sm">Missioni</div>
          <div className="text-3xl font-semibold">
            {user.stats.missions_completed_total}
          </div>
        </div>
  
        <div className="bg-white p-5 rounded-xl shadow-sm text-center">
          <div className="text-gray-400 text-sm">Attività 7 giorni</div>
          <div className="text-3xl font-semibold">
            {user.stats.dayPurchasesLast7Days}
          </div>
        </div>
      </div>
    );
  }
  