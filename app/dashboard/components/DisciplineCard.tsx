export default function DisciplineCard({ user }: any) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Disciplina</h2>
  
        <div className="flex justify-between text-lg font-medium">
          <div>
            Giornaliero:
            {" "}
            {user.discipline.daily_completed}/{user.discipline.daily_goal}
          </div>
  
          <div>
            Settimanale:
            {" "}
            {user.discipline.weekly_completed}/{user.discipline.weekly_goal}
          </div>
        </div>
      </div>
    );
  }
  