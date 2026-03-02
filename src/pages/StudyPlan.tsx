import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Calendar, CheckCircle2, Circle, BookOpen, Brain, Clock } from "lucide-react";
import { mockStudyPlan } from "@/data/mockData";

export default function StudyPlan() {
  const [plan, setPlan] = useState(mockStudyPlan);
  const [currentScore, setCurrentScore] = useState(1300);
  const [targetScore, setTargetScore] = useState(1500);

  const toggleTask = (dayIdx: number, taskIdx: number) => {
    setPlan((prev) =>
      prev.map((day, di) =>
        di === dayIdx
          ? {
              ...day,
              tasks: day.tasks.map((t, ti) =>
                ti === taskIdx ? { ...t, completed: !t.completed } : t
              ),
            }
          : day
      )
    );
  };

  const totalTasks = plan.reduce((a, d) => a + d.tasks.length, 0);
  const completedTasks = plan.reduce(
    (a, d) => a + d.tasks.filter((t) => t.completed).length,
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">AI Study Plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalized weekly plan based on your score and weaknesses
        </p>
      </motion.div>

      {/* Score input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Current Score</p>
          <p className="font-display text-3xl font-bold text-foreground">{currentScore}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Target Score</p>
          <p className="font-display text-3xl font-bold text-accent">{targetScore}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Weekly Progress</p>
          <p className="font-display text-3xl font-bold text-foreground">
            {completedTasks}/{totalTasks}
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
            <div
              className="h-full rounded-full gradient-accent transition-all"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Daily plan */}
      <div className="mt-8 space-y-4">
        {plan.map((day, dayIdx) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + dayIdx * 0.05 }}
            className="rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <div className="mb-3 flex items-center gap-3">
              <Calendar className="h-4 w-4 text-accent" />
              <h3 className="font-display font-bold text-foreground">{day.day}</h3>
              <span className="text-xs text-muted-foreground">{day.date}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {day.tasks.filter((t) => t.completed).length}/{day.tasks.length} done
              </span>
            </div>
            <div className="space-y-2">
              {day.tasks.map((task, taskIdx) => (
                <button
                  key={taskIdx}
                  onClick={() => toggleTask(dayIdx, taskIdx)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    task.completed
                      ? "border-success/30 bg-success-light"
                      : "border-border bg-background hover:border-accent/30"
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.topic}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      task.type === "test" ? "bg-amber-light text-amber-foreground" :
                      task.type === "practice" ? "bg-teal-light text-accent" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {task.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {task.duration}m
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
