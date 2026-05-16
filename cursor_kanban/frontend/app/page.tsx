import dynamic from "next/dynamic";

const Board = dynamic(() =>
  import("@/components/Board").then((mod) => ({ default: mod.Board })),
);

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-br from-primary/10 via-white to-white">
      <Board />
    </div>
  );
}
